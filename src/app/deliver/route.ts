// Crew file delivery: the photographer/videographer pastes the Google Drive link for a shoot. No login: the link in their email is signed.
import { NextResponse, type NextRequest } from "next/server";
import { deliveryInfo, saveDriveLink, requestInfo, saveRequestLink } from "@/lib/crewDelivery";
import { esc } from "@/lib/emailTemplate";

export const dynamic = "force-dynamic";

const shell = (body: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Send your files · MacroSnaps</title></head>
<body style="margin:0;min-height:100vh;background:#000;font-family:Arial,sans-serif;color:#fff;display:grid;place-items:center"><main style="width:100%;max-width:560px;padding:32px 20px;box-sizing:border-box;text-align:center">
<img src="/logo.png" alt="MacroSnaps" width="150" style="height:auto">${body}</main></body></html>`;
const html = (body: string, status = 200) => new NextResponse(shell(body), { status, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
const h1 = (t: string) => `<h1 style="font-family:Georgia,serif;font-weight:400;font-size:28px;margin:18px 0 8px">${t}</h1>`;
const muted = (t: string) => `<p style="color:#bbb;line-height:1.6;margin:0 0 18px">${t}</p>`;

function form(hidden: string, t: string, info: { ref: string; service_name: string; customer_name: string; when: string; name: string; drive_link: string | null }, error = "") {
  return h1(info.drive_link ? "Update your Google Drive link" : "Send your Google Drive link") +
    muted([info.ref, info.service_name, info.customer_name].filter(Boolean).map(esc).join(" · ") + (info.when && info.when !== info.ref.replace(/ shoot$/, "") ? `<br>${esc(info.when)}` : "")) +
    (error ? `<p role="alert" style="background:#3a1212;color:#ffb4b4;padding:10px;border-radius:6px">${esc(error)}</p>` : "") +
    `<form method="post" style="text-align:left">${hidden}<input type="hidden" name="t" value="${esc(t)}">
<label for="link" style="display:block;font-size:12px;letter-spacing:.15em;text-transform:uppercase;color:#ccba56;margin-bottom:6px">Google Drive folder link</label>
<input id="link" name="link" type="url" required placeholder="https://drive.google.com/drive/folders/..." value="${esc(info.drive_link ?? "")}" style="width:100%;box-sizing:border-box;padding:14px;font-size:16px;border:1px solid #555;background:#111;color:#fff;border-radius:6px">
<p style="color:#999;font-size:13px;line-height:1.5">Include all original RAW files and the edited .JPG files (and video files, if you filmed). Set sharing to “Anyone with the link can view”.</p>
<button style="width:100%;background:#ccba56;color:#000;border:0;padding:15px;font-size:15px;font-weight:bold;letter-spacing:.12em;cursor:pointer;border-radius:4px">SEND LINK</button></form>`;
}

const ids = (sp: URLSearchParams | FormData) => ({ r: Number(sp.get("r")) || 0, b: Number(sp.get("b")) || 0, u: Number(sp.get("u")) || 0, t: String(sp.get("t") ?? "").slice(0, 64) });
const hid = (o: { r: number; b: number; u: number }) => o.r ? `<input type="hidden" name="r" value="${o.r}">` : `<input type="hidden" name="b" value="${o.b}"><input type="hidden" name="u" value="${o.u}">`;
const load = (o: { r: number; b: number; u: number; t: string }) => (o.r ? requestInfo(o.r, o.t) : deliveryInfo(o.b, o.u, o.t)).catch(() => null);
const invalid = () => html(h1("This link isn't valid") + muted("Please use the button in your email, or reply to it with your Google Drive link."), 404);

export async function GET(req: NextRequest) {
  const o = ids(req.nextUrl.searchParams);
  const info = await load(o);
  return info ? html(form(hid(o), o.t, info)) : invalid();
}

export async function POST(req: NextRequest) {
  const fd = await req.formData().catch(() => null);
  if (!fd) return invalid();
  const o = ids(fd);
  const link = String(fd.get("link") ?? "");
  const r = await (o.r ? saveRequestLink(o.r, o.t, link) : saveDriveLink(o.b, o.u, o.t, link)).catch(() => ({ error: "Something went wrong. Please try again." }));
  if ("error" in r) {
    const info = await load(o);
    return info ? html(form(hid(o), o.t, info, r.error), 400) : invalid();
  }
  return html(h1("Thank you!") + muted(`We've received your files for ${esc(r.ref)}. The MacroSnaps team has been notified.`) + muted("Need to change the link? Open the button in your email again."));
}
