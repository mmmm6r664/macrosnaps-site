"use server";
import { revalidatePath } from "next/cache";
import { db, audit, q } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function updateInquiry(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const status = String(f.get("status") ?? "");
  if (!["new", "in_progress", "done", "rejected"].includes(status)) return;
  await q`update inquiries set status = ${status}, notes = ${String(f.get("notes") ?? "").slice(0, 10000)} where id = ${id}`;
  await audit(u.id, "inquiry_update", `#${id} ${status}`);
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
}

export type ReplyState = { ok?: string; error?: string } | undefined;

/** Emails a branded reply to the person who sent the inquiry (from info@e.macrosnaps.com, replies go to info@macrosnaps.com) and logs it in the notes. */
export async function replyInquiry(_: ReplyState, f: FormData): Promise<ReplyState> {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const subject = String(f.get("subject") ?? "").trim().slice(0, 200);
  const message = String(f.get("message") ?? "").trim().slice(0, 20000);
  if (!subject || !message) return { error: "Add a subject and a message." };
  const [r] = await q<{ email: string; status: string; notes: string }[]>`select email, status, notes from inquiries where id = ${id}`;
  if (!r?.email) return { error: "This message has no email address to reply to." };
  const { inquiryReply } = await import("@/lib/emails");
  const { sendMail } = await import("@/lib/mail");
  const m = inquiryReply(subject, message, f.get("book") === "on");
  const sent = await sendMail({ to: r.email, subject: m.subject, html: m.html });
  if (!sent.ok) return { error: "The email couldn't be sent. Please try again in a minute." };
  const stamp = new Date().toLocaleString("en-US", { timeZone: "America/New_York", dateStyle: "medium", timeStyle: "short" });
  const log = `[${stamp}] Replied by email (${u.name || u.email}): ${subject}`;
  await q`update inquiries set status = ${r.status === "new" ? "in_progress" : r.status}, notes = ${r.notes ? `${r.notes}\n${log}` : log} where id = ${id}`;
  await audit(u.id, "inquiry_reply", `#${id} to ${r.email}`);
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
  return { ok: `Sent to ${r.email}.` };
}
