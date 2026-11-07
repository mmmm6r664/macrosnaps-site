"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";

export type ImportState = { ok?: string; error?: string } | undefined;
type ListItem = { id: string; to: string[] | string; subject: string; created_at: string; last_event?: string; reply_to?: string[] | string | null };

/** Copies emails sent before the log existed from Resend (the email service), with their full content. */
export async function importFromResend(_: ImportState): Promise<ImportState> {
  await requireUser();
  const key = process.env.RESEND_API_KEY;
  if (!key) return { error: "The email service isn't connected." };
  const H = { Authorization: `Bearer ${key}` };
  const list = await fetch("https://api.resend.com/emails?limit=100", { headers: H, cache: "no-store" }).then(async (r) => ({ status: r.status, body: await r.json().catch(() => ({})) }));
  if (list.status === 401 || list.status === 403) return { error: "Your Resend API key is “sending only”, so it can't read past emails. You can still see them at resend.com → Emails. Everything sent from now on is logged here." };
  const items: ListItem[] = list.body?.data ?? [];
  if (list.status >= 400) return { error: `Resend said: ${list.body?.message ?? list.status}` };
  let added = 0;
  for (const it of items) {
    if ((await q`select 1 from email_log where provider_id = ${it.id}`).length) continue;
    const full = await fetch(`https://api.resend.com/emails/${it.id}`, { headers: H, cache: "no-store" }).then((r) => r.json()).catch(() => null) as { html?: string; reply_to?: string[] | string | null; last_event?: string } | null;
    const to = (Array.isArray(it.to) ? it.to : [it.to]).join(", ");
    const ev = full?.last_event ?? it.last_event ?? "sent";
    const status = /bounced|failed|complained/.test(ev) ? "failed" : "sent";
    const reply = full?.reply_to ?? it.reply_to;
    await q`insert into email_log (to_addr, subject, html, reply_to, status, error, provider_id, created_at)
      values (${to}, ${it.subject ?? ""}, ${full?.html && full.html.length < 400_000 ? full.html : null}, ${Array.isArray(reply) ? reply.join(", ") : reply ?? null}, ${status}, ${status === "failed" ? ev : null}, ${it.id}, ${new Date(it.created_at)})`;
    added++;
  }
  revalidatePath("/admin/messages");
  return { ok: added ? `Added ${added} earlier email${added === 1 ? "" : "s"} from Resend.` : "Everything from Resend is already here." };
}
