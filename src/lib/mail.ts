import { Resend } from "resend";
import { SITE } from "./site";
import { details } from "./emailTemplate";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.MAIL_FROM || "MacroSnaps <info@e.macrosnaps.com>";
export const TEAM_INBOX = process.env.TEAM_INBOX || SITE.email;

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; replyTo?: string; attachments?: { filename: string; content: Buffer }[] }) {
  if (!resend) {
    console.warn("[mail] RESEND_API_KEY not set — email not sent:", opts.subject);
    return { ok: false as const, skipped: true };
  }
  const { error } = await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo || SITE.email, attachments: opts.attachments });
  if (error) {
    console.error("[mail] send failed", error);
    return { ok: false as const, skipped: false };
  }
  return { ok: true as const };
}

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Label/value rows in the branded email style. */
export const table = (rows: [string, unknown][]) => details(rows);
