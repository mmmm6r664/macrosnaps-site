"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { q, audit } from "@/lib/db";
import { sendContract } from "@/lib/esign";

export type CState = { ok?: string; error?: string; url?: string } | undefined;

export async function sendNew(_: CState, f: FormData): Promise<CState> {
  const u = await requireUser();
  const name = String(f.get("name") ?? "").replace(/[<>]/g, "").trim().slice(0, 100);
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const signer = String(f.get("signer") ?? "").replace(/[<>]/g, "").trim().slice(0, 100) || u.name;
  if (name.length < 3) return { error: "Enter the person's full name." };
  if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)) return { error: "Enter a valid email address." };
  const userId = (await q<{ id: number }[]>`select id from users where lower(email) = ${email}`)[0]?.id ?? null;
  const c = await sendContract({ name, email, userId, companySigner: signer, by: u.id });
  revalidatePath("/admin/contracts");
  return c.emailed ? { ok: `Sent to ${email} (MS-C${c.id}). You'll get the signed PDF by email when they sign.` } : { ok: `Created MS-C${c.id}, but the email couldn't be sent. Share this signing link with them:`, url: c.url };
}

export async function resend(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const c = (await q<{ signer_name: string; signer_email: string; user_id: number | null; inquiry_id: number | null; company_signer: string; status: string }[]>`select signer_name, signer_email, user_id, inquiry_id, company_signer, status from contracts where id = ${id}`)[0];
  if (!c || c.status === "signed") return;
  // A fresh link replaces the old one (the old contract is voided automatically).
  await sendContract({ name: c.signer_name, email: c.signer_email, userId: c.user_id, inquiryId: c.inquiry_id, companySigner: c.company_signer, by: u.id });
  revalidatePath("/admin/contracts");
}

export async function voidContract(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  await q`update contracts set status = 'voided' where id = ${id} and status in ('sent','viewed')`;
  await audit(u.id, "contract_voided", `MS-C${id}`);
  revalidatePath("/admin/contracts");
}
