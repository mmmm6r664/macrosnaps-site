// Newsletter rendering and sending (Resend batch API, 100 emails per request).
import "server-only";
import { Resend } from "resend";
import { db, q } from "@/lib/db";
import { SITE } from "@/lib/site";
import { LOGO } from "@/lib/emailTemplate";

const FROM = process.env.NEWSLETTER_FROM || process.env.MAIL_FROM || "MacroSnaps <info@e.macrosnaps.com>";
const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : SITE.url);

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const safeUrl = (u: string) => (/^https?:\/\/[^\s"<>]+$/.test(u) ? u : "#");

const GOLD = "#ccba56", GOLD_DARK = "#8a7a2b", INK = "#1d1d1d";
const SERIF = "Georgia,'Times New Roman',serif", SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";
const sized = (u: string, t: string) => (u.includes("wixstatic.com/media/") ? `${u.split("/v1/")[0]}/v1/fill/${t}/i.jpg` : u);

/** Formatting language for the newsletter editor (one block per paragraph, blank line between blocks):
 *  # Big heading · ## Section heading · **bold** · [link text](https://…) · ![caption](https://image) (full-width photo)
 *  - bullet list lines · > quote · --- divider · [[Button text|https://…]]
 *  {{Card title | short text | https://image | https://link}} (cards placed one after another sit side by side, 2 per row) */
export function renderBody(src: string) {
  const inline = (t: string) =>
    esc(t)
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g, (_, a, u) => `<a href="${safeUrl(u.replace(/&amp;/g, "&"))}" style="color:${GOLD_DARK};font-weight:600">${a}</a>`);
  const P = `margin:0 0 18px;font:16px/1.7 ${SANS};color:#333`;
  const card = (title: string, text: string, img: string, url: string) =>
    `<td valign="top" width="50%" style="padding:0 8px 16px"><a href="${safeUrl(url)}" style="text-decoration:none;color:${INK}">${img ? `<img src="${safeUrl(sized(img, "w_520,h_360,q_80"))}" alt="" width="252" style="display:block;width:100%;height:auto;border:0">` : ""}<p style="margin:12px 0 4px;font:400 19px/1.3 ${SERIF};color:${INK}">${esc(title)}</p><p style="margin:0;font:14px/1.55 ${SANS};color:#555">${esc(text)}</p><p style="margin:8px 0 0;font:700 11px ${SANS};letter-spacing:2px;text-transform:uppercase;color:${GOLD_DARK}">Read more &rarr;</p></a></td>`;
  const blocks = src.replace(/\r/g, "").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    let m;
    if ((m = b.match(/^#\s+(.+)$/))) out.push(`<h2 style="margin:8px 0 14px;font:400 30px/1.25 ${SERIF};color:${INK}">${inline(m[1])}</h2>`);
    else if ((m = b.match(/^##\s+(.+)$/))) out.push(`<p style="margin:30px 0 4px;font:700 11px/1.4 ${SANS};letter-spacing:3px;text-transform:uppercase;color:${GOLD_DARK}">&mdash;</p><h3 style="margin:0 0 12px;font:400 23px/1.3 ${SERIF};color:${INK}">${inline(m[1])}</h3>`);
    else if (/^-{3,}$/.test(b)) out.push(`<div style="margin:26px 0;height:1px;background:#e8e3d6;line-height:1px">&nbsp;</div>`);
    else if ((m = b.match(/^!\[([^\]]*)\]\((https?:\/\/[^)\s]+)\)$/))) out.push(`<div style="margin:8px -44px 22px"><img src="${safeUrl(sized(m[2], "w_1200,h_720,q_80"))}" alt="${esc(m[1])}" width="600" style="display:block;width:100%;height:auto;border:0">${m[1] ? `<p style="margin:8px 44px 0;font:italic 13px/1.5 ${SERIF};color:#777">${esc(m[1])}</p>` : ""}</div>`);
    else if ((m = b.match(/^\[\[([^|\]]+)\|(https?:\/\/[^\]\s]+)\]\]$/))) out.push(`<p style="margin:26px 0;text-align:center"><a href="${safeUrl(m[2])}" style="background:${GOLD};color:#000;text-decoration:none;padding:17px 34px;font:700 13px ${SANS};letter-spacing:2px;text-transform:uppercase;display:inline-block">${esc(m[1])}</a></p>`);
    else if (b.split("\n").every((l) => /^>\s?/.test(l))) out.push(`<div style="margin:6px 0 24px;padding:6px 0 6px 22px;border-left:3px solid ${GOLD}"><p style="margin:0;font:italic 20px/1.5 ${SERIF};color:${INK}">${inline(b.replace(/^>\s?/gm, ""))}</p></div>`);
    else if (b.split("\n").every((l) => /^[-*]\s+/.test(l))) out.push(`<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 18px">${b.split("\n").map((l) => `<tr><td valign="top" style="padding:0 12px 10px 0;color:${GOLD};font-size:18px;line-height:1.5">&#9670;</td><td style="padding:0 0 10px;font:16px/1.6 ${SANS};color:#333">${inline(l.replace(/^[-*]\s+/, ""))}</td></tr>`).join("")}</table>`);
    else if (/^\{\{.+\}\}$/.test(b)) {
      // Gather consecutive cards into rows of two.
      const cards: string[][] = [];
      while (i < blocks.length && /^\{\{.+\}\}$/.test(blocks[i])) { cards.push(blocks[i].slice(2, -2).split("|").map((x) => x.trim())); i++; }
      i--;
      const rows: string[] = [];
      for (let k = 0; k < cards.length; k += 2) rows.push(`<tr>${[cards[k], cards[k + 1]].map((c) => (c ? card(c[0] ?? "", c[1] ?? "", c[2] ?? "", c[3] ?? ORIGIN) : `<td width="50%"></td>`)).join("")}</tr>`);
      out.push(`<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px -8px 10px;width:calc(100% + 16px)">${rows.join("")}</table>`);
    } else out.push(`<p style="${P}">${inline(b).replace(/\n/g, "<br>")}</p>`);
  }
  return out.join("");
}

/** Newsletter layout: masthead with issue date, quick links, the body, a booking band and the footer. */
export function emailHtml(subject: string, preheader: string, body: string, unsubUrl: string, sentAt: Date = new Date()) {
  const issue = sentAt.toLocaleDateString("en-US", { month: "long", year: "numeric", timeZone: "America/New_York" });
  const nav = [["Book", `${ORIGIN}/book`], ["Portfolio", `${ORIGIN}/portfolio`], ["Weddings", `${ORIGIN}/wedding-photography`], ["Events", `${ORIGIN}/events`]]
    .map(([l, u]) => `<a href="${u}" style="color:#e9e2c4;text-decoration:none;font:600 11px ${SANS};letter-spacing:2px;text-transform:uppercase">${l}</a>`).join(`<span style="color:#555">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`);
  const social = [["Instagram", SITE.social.instagram], ["Facebook", SITE.social.facebook], ["YouTube", SITE.social.youtube], ["Pinterest", SITE.social.pinterest]]
    .map(([n, u]) => `<a href="${esc(u)}" style="color:${GOLD};text-decoration:none;font:600 12px ${SANS}">${n}</a>`).join(`<span style="color:#555">&nbsp;&nbsp;&middot;&nbsp;&nbsp;</span>`);
  return `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light"><title>${esc(subject)}</title>
<style>@media (max-width:620px){.nl-pad{padding:30px 22px !important}.nl-card td{display:block !important;width:100% !important}}</style></head>
<body style="margin:0;padding:0;background:#ede9df">
<div style="display:none;max-height:0;overflow:hidden;opacity:0">${esc(preheader)}&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede9df"><tr><td align="center" style="padding:24px 10px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#fff">
  <tr><td align="center" style="background:#000;padding:30px 20px 16px"><a href="${ORIGIN}"><img src="${LOGO}" alt="MacroSnaps" width="140" style="display:block;width:140px;height:auto;border:0"></a>
    <p style="margin:16px 0 0;font:italic 15px ${SERIF};color:${GOLD}">The MacroSnaps Journal &nbsp;&middot;&nbsp; ${esc(issue)}</p></td></tr>
  <tr><td align="center" style="background:#000;padding:4px 20px 20px">${nav}</td></tr>
  <tr><td style="height:4px;line-height:4px;font-size:0;background:${GOLD}">&nbsp;</td></tr>
  <tr><td class="nl-pad" style="padding:40px 44px 20px">${renderBody(body)}</td></tr>
  <tr><td align="center" style="background:#111;padding:34px 30px">
    <p style="margin:0 0 6px;font:700 11px ${SANS};letter-spacing:3px;text-transform:uppercase;color:${GOLD}">Planning something?</p>
    <p style="margin:0 0 18px;font:400 24px/1.3 ${SERIF};color:#fff">Published prices. Book online in two minutes.</p>
    <a href="${ORIGIN}/book" style="background:${GOLD};color:#000;text-decoration:none;padding:15px 30px;font:700 12px ${SANS};letter-spacing:2px;text-transform:uppercase;display:inline-block">Book your date</a>
  </td></tr>
  <tr><td align="center" style="background:#000;padding:26px 30px 30px">
    <p style="margin:0 0 12px">${social}</p>
    <p style="margin:0 0 6px;font:12px/1.6 ${SANS};color:#9a9a9a">America's premier event &amp; wedding photography and videography company</p>
    <p style="margin:0;font:12px/1.6 ${SANS};color:#777">${esc(SITE.phone)} &middot; ${esc(SITE.email)} &middot; <a href="${ORIGIN}" style="color:${GOLD};text-decoration:none">macrosnaps.com</a></p>
    <p style="margin:12px 0 0;font:11px/1.6 ${SANS};color:#777">You're receiving this because you subscribed on macrosnaps.com. <a href="${unsubUrl}" style="color:#9a9a9a">Unsubscribe</a></p>
  </td></tr>
</table></td></tr></table></body></html>`;
}

export const unsubUrl = (token: string) => `${ORIGIN}/unsubscribe?t=${token}`;
/** Headers for the one-click "Unsubscribe" button in Gmail, Yahoo and Apple Mail. */
export const listUnsubscribe = (token: string) => ({
  "List-Unsubscribe": `<${ORIGIN}/api/unsubscribe?t=${token}>, <mailto:${SITE.email}?subject=unsubscribe>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

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
        headers: listUnsubscribe(s.token),
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
