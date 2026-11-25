// Client emails come into the portal inbox: new inquiries become inbox messages, and replies are added to the
// client's existing conversation, so every reply can be sent (and tracked) from the portal.
import "server-only";
import { hasDb, db } from "@/lib/db";
import { SITE } from "@/lib/site";

export type InboundEmail = {
  from: string; // "Name <email>" or plain email
  to?: string;
  subject: string;
  text: string;
  messageId?: string | null;
  receivedAt?: Date;
  source?: string; // e.g. "Email", "WeddingWire"
};

/** Senders that are never client conversations (our own mail, notifications, platforms that have their own importers). */
const IGNORE = [
  /@(e\.)?macrosnaps\.com$/i, /@macrohype(photography)?\.com$/i, /no-?reply|donotreply|mailer-daemon|postmaster|notifications?@/i,
  /@(stripe|google|vercel|github|resend|paypal|intuit|wix|squarespace|linkedin|facebook|instagram|calendly)\.com$/i,
  /@sulekhainfo\.com$/i,
];

export function parseAddress(s: string): { name: string; email: string } {
  const m = String(s || "").match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  const email = (m ? m[2] : s).trim().toLowerCase();
  const name = (m ? m[1] : "").trim() || email.split("@")[0];
  return { name, email };
}

/** Drops the quoted history ("On … wrote:") so the thread shows only what the client wrote. */
export function stripQuoted(text: string): string {
  const lines = String(text || "").replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  for (const l of lines) {
    if (/^On .+wrote:\s*$/.test(l.trim()) || /^-{2,}\s*Original Message/i.test(l.trim()) || /^From: .+/.test(l.trim()) && out.length > 2) break;
    if (/^>/.test(l)) continue;
    out.push(l);
  }
  return out.join("\n").trim().slice(0, 20000);
}

export function htmlToText(html: string): string {
  return String(html || "")
    .replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|tr|li|h\d)>/gi, "\n")
    .replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/&#39;/g, "'").replace(/&quot;/g, '"')
    .replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n\n").trim();
}

/** Adds an inbound email to the portal inbox. Returns what happened; never throws for ordinary skips. */
export async function ingestInbound(e: InboundEmail): Promise<{ status: "skipped" | "duplicate" | "added" | "created"; inquiryId?: number; reason?: string }> {
  if (!hasDb) return { status: "skipped", reason: "no database" };
  const { name, email } = parseAddress(e.from);
  if (!email.includes("@")) return { status: "skipped", reason: "no sender" };
  if (IGNORE.some((r) => r.test(email))) return { status: "skipped", reason: "automated or internal sender" };
  const sql = await db();
  const mid = e.messageId?.trim() || null;
  if (mid) {
    const [d] = await sql<{ inquiry_id: number }[]>`select inquiry_id from inquiry_messages where message_id = ${mid}`;
    if (d) return { status: "duplicate", inquiryId: d.inquiry_id };
  }
  const body = stripQuoted(e.text);
  const subject = String(e.subject || "").replace(/^\s*((re|fwd?|aw):\s*)+/i, "").trim().slice(0, 300) || "Email";
  const at = e.receivedAt ?? new Date();

  // Reply to an ongoing conversation: same client, contact inquiry in the last 120 days.
  const [open] = await sql<{ id: number }[]>`select id from inquiries where kind = 'contact' and lower(email) = ${email}
    and created_at > now() - interval '120 days' order by created_at desc limit 1`;
  if (open) {
    await sql`insert into inquiry_messages (inquiry_id, direction, from_addr, to_addr, subject, body, message_id, created_at)
      values (${open.id}, 'in', ${email}, ${e.to ?? SITE.email}, ${subject}, ${body}, ${mid}, ${at}) on conflict do nothing`;
    await sql`update inquiries set status = 'new' where id = ${open.id} and status <> 'rejected'`;
    return { status: "added", inquiryId: open.id };
  }
  const [r] = await sql<{ id: number }[]>`insert into inquiries (kind, name, email, data, status, created_at)
    values ('contact', ${name.slice(0, 100)}, ${email}, ${sql.json({ source: e.source || "Email", subject, message: body, page: "email" })}, 'new', ${at}) returning id`;
  await sql`insert into inquiry_messages (inquiry_id, direction, from_addr, to_addr, subject, body, message_id, created_at)
    values (${r.id}, 'in', ${email}, ${e.to ?? SITE.email}, ${subject}, ${body}, ${mid}, ${at}) on conflict do nothing`;
  await (await import("@/lib/leadSync")).syncLeadsToClients(email).catch(() => 0);
  return { status: "created", inquiryId: r.id };
}
