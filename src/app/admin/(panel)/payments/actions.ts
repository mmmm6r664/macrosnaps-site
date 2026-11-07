"use server";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/auth";
import { db, audit, hasDb } from "@/lib/db";

export type S = { error?: string; ok?: string } | undefined;

/** Refund any Stripe payment (full or partial). Keeps the matching website booking in sync. */
export async function refundPayment(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  if (!stripe) return { error: "Stripe isn't connected yet." };
  const pi = String(f.get("pi") ?? "");
  if (!/^pi_[A-Za-z0-9]+$/.test(pi)) return { error: "Unknown payment." };
  if (f.get("confirm") !== "on") return { error: "Tick the box to confirm the refund." };
  let intent;
  try { intent = await stripe.paymentIntents.retrieve(pi, { expand: ["latest_charge"] }); } catch { return { error: "Couldn't find that payment in Stripe." }; }
  const charge = intent.latest_charge && typeof intent.latest_charge !== "string" ? intent.latest_charge : null;
  const left = (charge?.amount ?? intent.amount_received) - (charge?.amount_refunded ?? 0);
  const cents = f.get("full") === "1" ? left : Math.round(Number(String(f.get("amount") ?? "").replace(/[$,]/g, "")) * 100);
  if (!Number.isFinite(cents) || cents <= 0 || cents > left) return { error: `Enter an amount between $0.01 and $${(left / 100).toFixed(2)}.` };
  try {
    await stripe.refunds.create({ payment_intent: pi, amount: cents, reason: "requested_by_customer", metadata: { by: u.email } });
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Stripe refused the refund." };
  }
  if (hasDb) {
    const sql = await db();
    await sql`update bookings set amount_refunded_cents = amount_refunded_cents + ${cents},
      status = case when amount_refunded_cents + ${cents} >= total_cents then 'refunded' else 'partially_refunded' end, updated_at = now()
      where stripe_payment_intent = ${pi}`;
  }
  await audit(u.id, "refund", `${pi} $${(cents / 100).toFixed(2)}`);
  revalidatePath("/admin/payments");
  return { ok: `Refunded $${(cents / 100).toFixed(2)}.` };
}
