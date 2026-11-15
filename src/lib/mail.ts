import { Resend } from "resend";
import { SITE } from "./site";
import { details } from "./emailTemplate";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.MAIL_FROM || "MacroSnaps <info@e.macrosnaps.com>";
export const TEAM_INBOX = process.env.TEAM_INBOX || SITE.email;

/** Addresses on the blocklist (blacklisted contractors etc.) never receive email. */
export async function blockedEmails(list: string[]): Promise<Set<string>> {
  try {
    const { q, hasDb } = await import("./db");
    if (!hasDb || !list.length) return new Set();
    const rows = await q<{ value: string }[]>`select value from blocklist where kind = 'email' and value = any(${list.map((e) => e.trim().toLowerCase())})`;
    return new Set(rows.map((r) => r.value));
  } catch { return new Set(); }
}

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; replyTo?: string; attachments?: { filename: string; content: Buffer }[]; headers?: Record<string, string> }) {
  const all = Array.isArray(opts.to) ? opts.to : [opts.to];
  const blocked = await blockedEmails(all);
  if (blocked.size) {
    const rest = all.filter((e) => !blocked.has(e.trim().toLowerCase()));
    if (!rest.length) { await logEmail(opts, "blocked", "Recipient is on the blocklist"); return { ok: false as const, skipped: true }; }
    opts = { ...opts, to: rest };
  }
  if (!resend) {
    console.warn("[mail] RESEND_API_KEY not set — email not sent:", opts.subject);
    await logEmail(opts, "not sent", "Email service not connected (RESEND_API_KEY)");
    return { ok: false as const, skipped: true };
  }
  const { data, error } = await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo || SITE.email, attachments: opts.attachments, headers: opts.headers });
  if (error) {
    console.error("[mail] send failed", error);
    await logEmail(opts, "failed", error.message || String(error));
    return { ok: false as const, skipped: false };
  }
  await logEmail(opts, "sent", null, data?.id ?? null);
  return { ok: true as const };
}

/** Every outgoing email is recorded for the admin "Sent emails & texts" log. Logging never blocks or breaks sending. */
async function logEmail(o: { to: string | string[]; subject: string; html: string; replyTo?: string; attachments?: { filename: string }[] }, status: string, error: string | null, id: string | null = null) {
  try {
    const { q, hasDb } = await import("./db");
    if (!hasDb) return;
    const to = (Array.isArray(o.to) ? o.to : [o.to]).join(", ").slice(0, 1000);
    await q`insert into email_log (to_addr, subject, html, reply_to, attachments, status, error, provider_id)
      values (${to}, ${o.subject.slice(0, 500)}, ${o.html.length < 400_000 ? o.html : null}, ${o.replyTo || SITE.email}, ${(o.attachments ?? []).map((a) => a.filename)}, ${status}, ${error?.slice(0, 1000) ?? null}, ${id})`;
  } catch (e) { console.error("[mail] log failed", e); }
}

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Label/value rows in the branded email style. */
export const table = (rows: [string, unknown][]) => details(rows);
