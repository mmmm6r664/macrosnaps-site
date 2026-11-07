// Notifications: in-portal (database), email (Resend) and text (Twilio), with a log of every outbound message.
import "server-only";
import { q } from "@/lib/db";
import { sendMail, esc, TEAM_INBOX } from "@/lib/mail";
import { sendSms } from "@/lib/sms";
import { SITE } from "@/lib/site";
import { layout } from "@/lib/emailTemplate";

export const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : SITE.url);

/** Wraps body HTML in the branded MacroSnaps email layout. */
export const emailWrap = (title: string, html: string, opts: { signoff?: boolean; preheader?: string } = {}) => layout({ title, body: html, ...opts });

export const textToHtml = (t: string) => t.split(/\n{2,}/).map((p) => `<p style="margin:0 0 12px;line-height:1.6">${esc(p).replace(/\n/g, "<br>")}</p>`).join("");

export async function logMessage(channel: "email" | "sms", recipient: string, subject: string | null, body: string, ok: boolean, error: string | undefined, by: number | null) {
  try { await q`insert into outbound_messages (channel, recipient, subject, body, status, error, created_by) values (${channel}, ${recipient}, ${subject}, ${body.slice(0, 5000)}, ${ok ? "sent" : "failed"}, ${error ?? null}, ${by})`; } catch (e) { console.error(e); }
}

export async function emailPerson(to: string, subject: string, text: string, by: number | null, cta?: { label: string; url: string }) {
  const html = emailWrap(subject, textToHtml(text) + (cta ? `<p style="margin:22px 0"><a href="${esc(cta.url)}" style="background:#ccba56;color:#000;padding:12px 22px;text-decoration:none;font-weight:bold;letter-spacing:1px;text-transform:uppercase;font-size:13px">${esc(cta.label)}</a></p>` : ""));
  const r = await sendMail({ to, subject, html, replyTo: SITE.email }); // logged in the email log by sendMail
  void by;
  return r.ok;
}

export async function textPerson(to: string, body: string, by: number | null) {
  const r = await sendSms(to, body);
  await logMessage("sms", to, null, body, r.ok, r.error, by);
  return r.ok;
}

/** In-portal notification for one staff member. */
export async function notifyUser(userId: number, title: string, body = "", link: string | null = null) {
  try { await q`insert into notifications (user_id, title, body, link) values (${userId}, ${title.slice(0, 200)}, ${body.slice(0, 2000)}, ${link})`; } catch (e) { console.error(e); }
}

/** Alert for the admin team: shows on the admin dashboard and goes to the team inbox by email. */
export async function notifyAdmins(title: string, body = "", link: string | null = null) {
  try { await q`insert into notifications (user_id, title, body, link) values (null, ${title.slice(0, 200)}, ${body.slice(0, 2000)}, ${link})`; } catch (e) { console.error(e); }
  await sendMail({ to: TEAM_INBOX, subject: `[MacroSnaps admin] ${title}`, html: emailWrap(title, textToHtml(body)) });
}
