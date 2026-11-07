// One-time email sign-in link → client session.
// GET only shows a confirm button (so email security scanners that pre-open links can't use up the link); POST signs in.
import { NextResponse, type NextRequest } from "next/server";
import { consumeLoginToken, startClientSession, upsertClient } from "@/lib/clientAuth";

export const dynamic = "force-dynamic";

const page = (token: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Sign in · MacroSnaps</title></head>
<body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#000;font-family:Arial,sans-serif;color:#fff;text-align:center">
<form method="post" style="padding:24px"><img src="/logo.png" alt="MacroSnaps" width="150" style="height:auto"><h1 style="font-family:Georgia,serif;font-weight:400">Sign in to your client portal</h1>
<input type="hidden" name="token" value="${token.replace(/[^\w-]/g, "")}"><button style="background:#ccba56;color:#000;border:0;padding:14px 32px;font-size:16px;font-weight:bold;letter-spacing:.1em;cursor:pointer">SIGN IN</button></form></body></html>`;

export async function GET(req: NextRequest) {
  const token = (req.nextUrl.searchParams.get("token") ?? "").slice(0, 100);
  if (!token) return NextResponse.redirect(new URL("/account/login", req.url));
  return new NextResponse(page(token), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store", "x-robots-tag": "noindex" } });
}

export async function POST(req: NextRequest) {
  const fd = await req.formData().catch(() => null);
  const t = await consumeLoginToken(String(fd?.get("token") ?? "")).catch(() => null);
  if (!t) return NextResponse.redirect(new URL("/account/login?error=expired", req.url), 303);
  const id = await upsertClient(t.email);
  await startClientSession(id);
  return NextResponse.redirect(new URL(t.next_path || "/account", req.url), 303);
}
