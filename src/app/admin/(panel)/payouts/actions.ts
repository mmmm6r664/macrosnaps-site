"use server";
import { revalidatePath } from "next/cache";
import { q, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { notifyUser } from "@/lib/notify";

export type S = { error?: string; ok?: string } | undefined;

export async function addPayout(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const userId = Number(f.get("user_id"));
  const cents = Math.round(Number(String(f.get("amount") ?? "").replace(/[$,]/g, "")) * 100);
  const date = String(f.get("paid_on") ?? "");
  if (!userId) return { error: "Choose who was paid." };
  if (!Number.isFinite(cents) || cents <= 0 || cents > 10_000_000) return { error: "Enter the amount paid." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Enter the date paid." };
  await q`insert into payouts (user_id, amount_cents, paid_on, method, booking_id, note, created_by) values (${userId}, ${cents}, ${date}, ${String(f.get("method") ?? "").slice(0, 40) || null}, ${Number(f.get("booking_id")) || null}, ${String(f.get("note") ?? "").slice(0, 300)}, ${u.id})`;
  await notifyUser(userId, `Payment recorded: $${(cents / 100).toFixed(2)}`, String(f.get("note") ?? ""), "/staff/payments");
  await audit(u.id, "payout_add", `user ${userId} $${(cents / 100).toFixed(2)}`);
  revalidatePath("/admin/payouts");
  return { ok: "Payment recorded. It now shows in their staff portal." };
}

export async function deletePayout(f: FormData) {
  const u = await requireUser();
  await q`delete from payouts where id = ${Number(f.get("id"))}`;
  await audit(u.id, "payout_delete", String(f.get("id")));
  revalidatePath("/admin/payouts");
}

/** Owner only: reveal a full SSN/EIN (for 1099 filing). Every reveal is logged. */
export async function revealTin(_: S, f: FormData): Promise<S> {
  const u = await requireUser(["owner"]);
  const userId = Number(f.get("user_id"));
  const [p] = await q<{ tin_enc: string | null; tin_type: string | null }[]>`select tin_enc, tin_type from staff_profiles where user_id = ${userId}`;
  if (!p?.tin_enc) return { error: "No tax ID on file." };
  try {
    const v = decrypt(p.tin_enc);
    await audit(u.id, "tin_reveal", `user ${userId}`);
    return { ok: `${p.tin_type?.toUpperCase() ?? "TIN"}: ${v}` };
  } catch {
    return { error: "Couldn't decrypt. Check TAX_ENCRYPTION_KEY." };
  }
}
