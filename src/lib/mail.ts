import { Resend } from "resend";
import { SITE } from "./site";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.MAIL_FROM || "MacroSnaps <info@e.macrosnaps.com>";
export const TEAM_INBOX = process.env.TEAM_INBOX || SITE.email;

export async function sendMail(opts: { to: string | string[]; subject: string; html: string; replyTo?: string }) {
  if (!resend) {
    console.warn("[mail] RESEND_API_KEY not set — email not sent:", opts.subject);
    return { ok: false as const, skipped: true };
  }
  const { error } = await resend.emails.send({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, replyTo: opts.replyTo || SITE.email });
  if (error) {
    console.error("[mail] send failed", error);
    return { ok: false as const, skipped: false };
  }
  return { ok: true as const };
}

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

export function table(rows: [string, unknown][]) {
  return `<table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${rows
    .filter(([, v]) => v !== undefined && v !== "")
    .map(([k, v]) => `<tr><td style="color:#605e5e;vertical-align:top"><b>${esc(k)}</b></td><td>${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
}
