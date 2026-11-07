"use server";
import { revalidatePath } from "next/cache";
import { db, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { BOOKING_STATUSES } from "@/lib/adminData";
import { stripe } from "@/lib/stripe";

export type ActionState = { error?: string; ok?: string } | undefined;
const id = (f: FormData) => Number(f.get("id")) || 0;

export async function updateBooking(_: ActionState, f: FormData): Promise<ActionState> {
  const u = await requireUser();
  const status = String(f.get("status") ?? "");
  if (!(BOOKING_STATUSES as readonly string[]).includes(status)) return { error: "Unknown status" };
  const notes = String(f.get("internal_notes") ?? "").slice(0, 10000);
  const crew = f.getAll("crew").map(Number).filter(Boolean).slice(0, 20);
  const sql = await db();
  const bid = id(f);
  await sql.begin(async (tx) => {
    await tx`update bookings set status = ${status}, internal_notes = ${notes}, updated_at = now() where id = ${bid}`;
    await tx`delete from crew_assignments where booking_id = ${bid}`;
    for (const c of crew) await tx`insert into crew_assignments (booking_id, user_id) values (${bid}, ${c}) on conflict do nothing`;
  });
  await audit(u.id, "booking_update", `#${bid} status=${status} crew=${crew.join(",")}`);
  revalidatePath(`/admin/bookings/${bid}`);
  return { ok: "Saved" };
}

export async function refundBooking(_: ActionState, f: FormData): Promise<ActionState> {
  const u = await requireUser();
  if (!stripe) return { error: "Stripe isn't connected yet." };
  const bid = id(f);
  const sql = await db();
  const [b] = await sql<{ stripe_payment_intent: string | null; total_cents: number; amount_refunded_cents: number }[]>`select stripe_payment_intent, total_cents, amount_refunded_cents from bookings where id = ${bid}`;
  if (!b?.stripe_payment_intent) return { error: "This booking has no card payment to refund." };
  const left = b.total_cents - b.amount_refunded_cents;
  const dollars = Number(String(f.get("amount") ?? "").replace(/[$,]/g, ""));
  const cents = f.get("full") === "1" ? left : Math.round(dollars * 100);
  if (!Number.isFinite(cents) || cents <= 0 || cents > left) return { error: `Enter an amount between $0.01 and $${(left / 100).toFixed(2)}.` };
  if (f.get("confirm") !== "on") return { error: "Tick the box to confirm the refund." };
  try {
    await stripe.refunds.create({ payment_intent: b.stripe_payment_intent, amount: cents, reason: "requested_by_customer", metadata: { booking_id: String(bid), by: u.email } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Stripe refused the refund." };
  }
  const refunded = b.amount_refunded_cents + cents;
  await sql`update bookings set amount_refunded_cents = ${refunded}, status = ${refunded >= b.total_cents ? "refunded" : "partially_refunded"}, updated_at = now() where id = ${bid}`;
  await audit(u.id, "refund", `#${bid} $${(cents / 100).toFixed(2)}`);
  revalidatePath(`/admin/bookings/${bid}`);
  return { ok: `Refunded $${(cents / 100).toFixed(2)}. The customer sees it in 5–10 business days.` };
}
