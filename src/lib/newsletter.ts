// Newsletter rendering and sending (Resend batch API, 100 emails per request).
import "server-only";
import { Resend } from "resend";
import { db, q } from "@/lib/db";
import { SITE } from "@/lib/site";

const FROM = process.env.NEWSLETTER_FROM || process.env.MAIL_FROM || "MacroSnaps <news@macrosnaps.com>";
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : SITE.url);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeUrl = (u: string) => (/^https?:\/\/[^\s"<>]+$/.test(u) ? u : "#");

/** Very small formatting language for the editor:
 *  # Heading · **bold** · [link text](https://…) · ![image](https://…) · [[Button text|https://…]] · blank line = new paragraph */
export function renderBody(src: string) {
  const inline = (t: string) =>
    esc(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, a, u) => `<a href="${safeUrl(u.replace(/&amp;/g, "&"))}" style="color:#8a7a2b">${a}</a>`);
  return src.replace(/\r/g, "").split(/\n{2,}/).map((block) => {
    const b = block.trim();
    if (!b) return "";
    let m;
    if ((m = b.match(/^#\s+(.+)$/))) return `<h2 style="font-family:Georgia,serif;font-weight:400;font-size:26px;margin:28px 0 10px;color:#1d1d1d">${inline(m[1])}</h2>`;
    if ((m = b.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/))) return `<p style="margin:18px 0"><img src="${safeUrl(m[2])}" alt="${esc(m[1])}" width="560" style="width:100%;max-width:560px;height:auto;border:0;display:block"></p>`;
    if ((m = b.match(/^\[\[([^|\]]+)\|(https?:\/\/[^\]\s]+)\]\]$/))) return `<p style="margin:24px 0;text-align:center"><a href="${safeUrl(m[2])}" style="background:#ccba56;color:#000;text-decoration:none;padding:12px 26px;font-weight:bold;letter-spacing:2px;text-transform:uppercase;font-size:13px;display:inline-block">${esc(m[1])}</a></p>`;
    return `<p style="margin:0 0 16px;line-height:1.65">${inline(b).replace(/\n/g, "<br>")}</p>`;
  }).join("");
}

export function emailHtml(subject: string, preheader: string, body: string, unsubUrl: string) {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>${esc(subject)}</title></head>
<body style="margin:0;background:#f3f1ec;font-family:Arial,Helvetica,sans-serif;color:#2f2e2e;font-size:16px">
<span style="display:none;max-height:0;overflow:hidden">${esc(preheader)}</span>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#fff">
<tr><td style="background:#000;padding:22px;text-align:center;font-family:Georgia,serif;font-style:italic;font-size:30px;color:#ccba56">MacroSnaps</td></tr>
<tr><td style="padding:28px 32px">${renderBody(body)}</td></tr>
<tr><td style="padding:20px 32px;background:#111;color:#aaa;font-size:12px;line-height:1.6;text-align:center">
MacroSnaps · part of MacroHype LLC · ${esc(SITE.phone)} · <a href="${ORIGIN}" style="color:#ccba56">macrosnaps.com</a><br>
You're receiving this because you subscribed on our website. <a href="${unsubUrl}" style="color:#ccba56">Unsubscribe</a>
</td></tr></table></td></tr></table></body></html>`;
}

export const unsubUrl = (token: string) => `${ORIGIN}/unsubscribe?t=${token}`;

/** Sends one newsletter to every current subscriber. Safe to call twice: it claims the newsletter first. */
export async function sendNewsletter(id: number): Promise<{ ok: boolean; sent: number; error?: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, sent: 0, error: "Email isn't connected (RESEND_API_KEY)." };
  const sql = await db();
  const claimed = await sql<{ id: number; subject: string; preheader: string; body: string }[]>`
    update newsletters set status = 'sending', updated_at = now() where id = ${id} and status in ('draft', 'scheduled', 'failed') returning id, subject, preheader, body`;
  if (!claimed.length) return { ok: false, sent: 0, error: "This newsletter is already sending or sent." };
  const n = claimed[0];
  const subs = await sql<{ email: string; token: string }[]>`select email, token from subscribers where status = 'subscribed' order by id`;
  const resend = new Resend(key);
  let sent = 0;
  try {
    for (let i = 0; i < subs.length; i += 100) {
      const chunk = subs.slice(i, i + 100);
      const { error } = await resend.batch.send(chunk.map((s) => ({
        from: FROM, to: s.email, replyTo: SITE.email, subject: n.subject,
        html: emailHtml(n.subject, n.preheader, n.body, unsubUrl(s.token)),
        headers: { "List-Unsubscribe": `<${unsubUrl(s.token)}>` },
      })));
      if (error) throw new Error(error.message);
      sent += chunk.length;
      if (i + 100 < subs.length) await new Promise((r) => setTimeout(r, 600)); // stay under Resend's rate limit
    }
    await sql`update newsletters set status = 'sent', sent_at = now(), sent_count = ${sent}, error = null, updated_at = now() where id = ${id}`;
    return { ok: true, sent };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Send failed";
    await sql`update newsletters set status = 'failed', sent_count = ${sent}, error = ${msg}, updated_at = now() where id = ${id}`;
    return { ok: false, sent, error: msg };
  }
}

export async function sendTest(id: number, to: string) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return { ok: false, error: "Email isn't connected (RESEND_API_KEY)." };
  const [n] = await q<{ subject: string; preheader: string; body: string }[]>`select subject, preheader, body from newsletters where id = ${id}`;
  if (!n) return { ok: false, error: "Not found" };
  const { error } = await new Resend(key).emails.send({ from: FROM, to, subject: `[TEST] ${n.subject}`, html: emailHtml(n.subject, n.preheader, n.body, `${ORIGIN}/unsubscribe`) });
  return error ? { ok: false, error: error.message } : { ok: true };
}
