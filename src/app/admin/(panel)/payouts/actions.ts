"use server";
import { revalidatePath } from "next/cache";
import { q, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { decrypt } from "@/lib/crypto";
import { notifyUser } from "@/lib/notify";
import { sendMail } from "@/lib/mail";
import { payoutSent } from "@/lib/emails";

export type S = { error?: string; ok?: string } | undefined;

export async function addPayout(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const userId = Number(f.get("user_id")) || null;
  let name = String(f.get("payee_name") ?? "").trim().slice(0, 120);
  let email = String(f.get("payee_email") ?? "").trim().toLowerCase().slice(0, 200);
  const cents = Math.round(Number(String(f.get("amount") ?? "").replace(/[$,]/g, "")) * 100);
  const date = String(f.get("paid_on") ?? "");
  const method = String(f.get("method") ?? "").slice(0, 40) || null;
  const note = String(f.get("note") ?? "").trim().slice(0, 300);
  if (userId) {
    const [m] = await q<{ name: string; email: string }[]>`select name, email from users where id = ${userId}`;
    if (!m) return { error: "That team member wasn't found." };
    name = m.name; email = m.email;
  }
  if (!userId && (!name || !/^\S+@\S+\.\S+$/.test(email))) return { error: "Choose who was paid, or enter their name and email." };
  if (!Number.isFinite(cents) || cents <= 0 || cents > 10_000_000) return { error: "Enter the amount paid." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Enter the date paid." };
  const [row] = await q<{ id: number }[]>`insert into payouts (user_id, payee_name, payee_email, amount_cents, paid_on, method, booking_id, note, created_by)
    values (${userId}, ${name}, ${email}, ${cents}, ${date}, ${method}, ${Number(f.get("booking_id")) || null}, ${note}, ${u.id}) returning id`;
  if (userId) await notifyUser(userId, `Payment recorded: $${(cents / 100).toFixed(2)}`, note, "/staff/payments");
  let mailed = false;
  if (f.get("email_them") === "on" && email) {
    const m = payoutSent({ name, amount: `$${(cents / 100).toFixed(2)}`, method, date, note, portal: !!userId });
    mailed = (await sendMail({ to: email, subject: m.subject, html: m.html })).ok;
    if (mailed) await q`update payouts set emailed_at = now() where id = ${row.id}`;
  }
  await audit(u.id, "payout_add", `#${row.id} ${email} $${(cents / 100).toFixed(2)}${mailed ? " (emailed)" : ""}`);
  revalidatePath("/admin/payouts");
  return { ok: `Payment of $${(cents / 100).toFixed(2)} to ${name} recorded.${mailed ? ` Confirmation emailed to ${email}.` : ""}${userId ? " It shows in their staff portal." : ""}` };
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
