// Branded HTML email layout used by every MacroSnaps email (bookings, portal, reminders, nurture, newsletters).
// Table-based and inline-styled so it renders in Gmail, Outlook, Apple Mail and on phones.
import { SITE } from "./site";

export const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : SITE.url);
export const LOGO = "https://static.wixstatic.com/media/1f3625_e1b0968a0a4344fa92e40a800af6d464~mv2.png/v1/fit/w_320,h_220,q_90/logo.png";
const GOLD = "#ccba56", GOLD_DARK = "#8a7a2b", INK = "#1d1d1d", MUTED = "#6b6b6b", CREAM = "#f6f3ec";
const SERIF = "Georgia,'Times New Roman',serif", SANS = "'Helvetica Neue',Helvetica,Arial,sans-serif";

export const esc = (s: unknown) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);
/** Wix-hosted images can be resized by URL; other images are used as-is. */
const sized = (src: string, t: string) => (src.includes("wixstatic.com") ? `${src}/v1/fill/${t}/i.jpg` : src);
const safeUrl = (u: string) => (/^(https?:\/\/|mailto:|tel:)[^\s"<>]+$/.test(u) ? u : "#");

/* ---------- building blocks ---------- */
export const p = (html: string) => `<p style="margin:0 0 16px;font:16px/1.65 ${SANS};color:#333">${html}</p>`;
export const small = (html: string) => `<p style="margin:0 0 12px;font:13px/1.6 ${SANS};color:${MUTED}">${html}</p>`;
export const h2 = (text: string) => `<h2 style="margin:28px 0 12px;font:400 24px/1.3 ${SERIF};color:${INK}">${esc(text)}</h2>`;
export const eyebrow = (text: string) => `<p style="margin:0 0 6px;font:700 11px/1.4 ${SANS};letter-spacing:3px;text-transform:uppercase;color:${GOLD_DARK}">${esc(text)}</p>`;
export const divider = () => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:12px 0"><div style="height:1px;background:#e8e3d6;line-height:1px">&nbsp;</div></td></tr></table>`;

export const button = (label: string, url: string, align: "center" | "left" = "center") =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="${align}" style="padding:10px 0 22px">
  <!--[if mso]><v:rect xmlns:v="urn:schemas-microsoft-com:vml" href="${safeUrl(url)}" style="height:50px;v-text-anchor:middle;width:280px" stroke="f" fillcolor="${GOLD}"><center style="color:#000;font-family:Arial;font-size:14px;font-weight:bold;letter-spacing:2px">${esc(label.toUpperCase())}</center></v:rect><![endif]-->
  <!--[if !mso]><!--><a href="${safeUrl(url)}" style="display:inline-block;background:${GOLD};color:#000;text-decoration:none;font:700 14px/1 ${SANS};letter-spacing:2px;text-transform:uppercase;padding:18px 34px;border-radius:2px">${esc(label)}</a><!--<![endif]-->
  </td></tr></table>`;

/** A soft gold-bordered box for key facts or a note. */
export const callout = (html: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 22px"><tr><td style="background:${CREAM};border-left:4px solid ${GOLD};padding:16px 20px;font:15px/1.6 ${SANS};color:#333">${html}</td></tr></table>`;

/** Label/value pairs (booking details). Empty values are skipped. */
export function details(rows: [string, unknown][]) {
  const r = rows.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== "");
  if (!r.length) return "";
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;border-collapse:collapse">${r
    .map(([k, v]) => `<tr><td valign="top" style="padding:9px 12px 9px 0;border-bottom:1px solid #eee;font:600 12px/1.5 ${SANS};letter-spacing:1px;text-transform:uppercase;color:${MUTED};width:38%">${esc(k)}</td><td valign="top" style="padding:9px 0;border-bottom:1px solid #eee;font:15px/1.5 ${SANS};color:${INK}">${esc(v).replace(/\n/g, "<br>")}</td></tr>`)
    .join("")}</table>`;
}

/** Itemized price list with a total row. */
export function priceTable(lines: { label: string; amount: number }[], totalLabel: string, total: string) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px;border-collapse:collapse;border:1px solid #ece6d6">
  ${lines.map((l) => `<tr><td style="padding:12px 14px;border-bottom:1px solid #f0ebde;font:15px/1.45 ${SANS};color:#333">${esc(l.label)}</td><td align="right" style="padding:12px 14px;border-bottom:1px solid #f0ebde;font:15px/1.45 ${SANS};color:${INK};white-space:nowrap">$${Number(l.amount).toLocaleString("en-US")}</td></tr>`).join("")}
  <tr><td style="padding:14px;background:${CREAM};font:700 13px/1.4 ${SANS};letter-spacing:2px;text-transform:uppercase;color:${INK}">${esc(totalLabel)}</td><td align="right" style="padding:14px;background:${CREAM};font:400 22px/1.2 ${SERIF};color:${INK};white-space:nowrap">${esc(total)}</td></tr></table>`;
}

/** Up to 3 photos side by side (stack on phones in most clients). */
export function photoRow(urls: string[]) {
  const u = urls.slice(0, 3);
  if (!u.length) return "";
  const w = Math.floor(536 / u.length) - 8;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 22px"><tr>${u
    .map((src) => `<td style="padding:0 4px" width="${w}"><img src="${esc(sized(src, `w_${w * 2},h_${Math.round(w * 1.4)},q_80`))}" width="${w}" alt="" style="display:block;width:100%;max-width:${w}px;height:auto;border:0"></td>`)
    .join("")}</tr></table>`;
}

/** Numbered steps (e.g. "what happens next"). */
export function steps(items: [string, string][]) {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px">${items
    .map(([t, d], i) => `<tr><td valign="top" width="40" style="padding:0 0 16px"><div style="width:30px;height:30px;line-height:30px;border-radius:15px;background:#000;color:${GOLD};text-align:center;font:700 14px/30px ${SANS}">${i + 1}</div></td><td valign="top" style="padding:3px 0 16px;font:15px/1.55 ${SANS};color:#333"><b style="color:${INK}">${esc(t)}</b><br>${d}</td></tr>`)
    .join("")}</table>`;
}

/* ---------- full layout ---------- */
export type LayoutOpts = {
  title: string; // big heading inside the email
  preheader?: string; // inbox preview text
  body: string; // HTML built from the blocks above
  hero?: string; // optional full-width photo under the header
  footerNote?: string; // e.g. why they're receiving it
  unsubUrl?: string; // marketing emails only
  signoff?: boolean; // "Warmly, The MacroSnaps Team" (default true; off for internal alerts)
};

export function layout(o: LayoutOpts) {
  const year = new Date().getFullYear();
  const social = [["Instagram", SITE.social.instagram], ["Facebook", SITE.social.facebook], ["YouTube", SITE.social.youtube]]
    .map(([n, u]) => `<a href="${esc(u)}" style="color:${GOLD};text-decoration:none;font:600 12px ${SANS};letter-spacing:1px">${n}</a>`).join(`<span style="color:#555">&nbsp;&nbsp;·&nbsp;&nbsp;</span>`);
  return `<!doctype html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="x-apple-disable-message-reformatting"><meta name="color-scheme" content="light"><meta name="supported-color-schemes" content="light"><title>${esc(o.title)}</title>
<style>@media (max-width:620px){.card{padding:28px 22px !important}.h1{font-size:28px !important}}a{color:${GOLD_DARK}}</style></head>
<body style="margin:0;padding:0;background:#ede9df;-webkit-text-size-adjust:100%">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent">${esc(o.preheader ?? "")}&#8199;&#65279;&#847;&#8199;&#65279;&#847;&#8199;&#65279;&#847;</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#ede9df"><tr><td align="center" style="padding:28px 12px">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:100%;max-width:600px;background:#ffffff;box-shadow:0 2px 12px rgba(0,0,0,.06)">
  <tr><td align="center" style="background:#000;padding:26px 20px 22px"><a href="${ORIGIN}"><img src="${LOGO}" alt="MacroSnaps" width="150" style="display:block;width:150px;height:auto;border:0"></a></td></tr>
  <tr><td style="height:4px;line-height:4px;font-size:0;background:${GOLD}">&nbsp;</td></tr>
  ${o.hero ? `<tr><td><img src="${esc(sized(o.hero, "w_1200,h_560,q_80"))}" width="600" alt="" style="display:block;width:100%;height:auto;border:0"></td></tr>` : ""}
  <tr><td class="card" style="padding:40px 44px 28px">
    <h1 class="h1" style="margin:0 0 20px;font:400 32px/1.25 ${SERIF};color:${INK}">${esc(o.title)}</h1>
    ${o.body}
    ${o.signoff === false ? "" : `<p style="margin:26px 0 0;font:15px/1.6 ${SANS};color:#333">Warmly,<br><span style="font:italic 20px ${SERIF};color:${INK}">The MacroSnaps Team</span></p>`}
  </td></tr>
  <tr><td style="background:${CREAM};padding:22px 44px;font:14px/1.6 ${SANS};color:#444;text-align:center">
    Questions? Just reply to this email, or call <a href="${SITE.phoneHref}" style="color:${GOLD_DARK};text-decoration:none;font-weight:600">${esc(SITE.phone)}</a>
  </td></tr>
  <tr><td align="center" style="background:#000;padding:26px 30px 30px">
    <p style="margin:0 0 12px">${social}</p>
    <p style="margin:0 0 6px;font:12px/1.6 ${SANS};color:#9a9a9a">America's premier event &amp; wedding photography and videography company<br>All 50 states, Washington, DC, Ontario &amp; Quebec</p>
    <p style="margin:0;font:12px/1.6 ${SANS};color:#777">© ${year} MacroSnaps · part of MacroHype LLC · <a href="${ORIGIN}" style="color:${GOLD};text-decoration:none">macrosnaps.com</a></p>
    ${o.footerNote ? `<p style="margin:12px 0 0;font:11px/1.6 ${SANS};color:#777">${o.footerNote}</p>` : ""}
    ${o.unsubUrl ? `<p style="margin:8px 0 0;font:11px/1.6 ${SANS}"><a href="${esc(o.unsubUrl)}" style="color:#9a9a9a">Unsubscribe</a></p>` : ""}
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
}
