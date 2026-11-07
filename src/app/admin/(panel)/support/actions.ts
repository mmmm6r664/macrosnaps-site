"use server";
import { revalidatePath } from "next/cache";
import { q, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notifyUser, emailPerson } from "@/lib/notify";

export async function replyTicket(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const reply = String(f.get("reply") ?? "").trim().slice(0, 5000);
  const status = f.get("close") === "1" ? "closed" : reply ? "answered" : "open";
  const [t] = await q<{ user_id: number; subject: string; email: string; name: string }[]>`
    update support_tickets t set reply = coalesce(nullif(${reply}, ''), t.reply), replied_at = case when ${reply} <> '' then now() else t.replied_at end, status = ${status}
    from users u where t.id = ${id} and u.id = t.user_id returning t.user_id, t.subject, u.email, u.name`;
  if (t && reply) {
    await notifyUser(t.user_id, `Reply to: ${t.subject}`, reply.slice(0, 300), "/staff/support");
    await emailPerson(t.email, `Re: ${t.subject}`, `Hi ${t.name.split(" ")[0]},\n\n${reply}\n\nThe MacroSnaps team`, u.id);
  }
  await audit(u.id, "support_reply", `#${id} ${status}`);
  revalidatePath("/admin/support");
}
