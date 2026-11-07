// "Stop these reminders" link in abandoned-booking emails.
import { NextResponse, type NextRequest } from "next/server";
import { q, hasDb } from "@/lib/db";
import { verifyRef } from "@/lib/automations";

export const dynamic = "force-dynamic";
const page = (msg: string) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>MacroSnaps</title></head><body style="margin:0;min-height:100vh;display:grid;place-items:center;background:#000;color:#fff;font-family:Arial,sans-serif;text-align:center;padding:24px"><div><h1 style="font-family:Georgia,serif;font-weight:400;color:#ccba56">MacroSnaps</h1><p>${msg}</p><p><a href="/" style="color:#ccba56">Back to macrosnaps.com</a></p></div></body></html>`;

export async function GET(req: NextRequest) {
  const ref = (req.nextUrl.searchParams.get("ref") ?? "").slice(0, 40);
  const ok = hasDb && ref && verifyRef(ref, "stop", req.nextUrl.searchParams.get("t") ?? "");
  if (ok) await q`update bookings set reminders_stopped = true where ref = ${ref}`;
  return new NextResponse(page(ok ? "Done. You won't get any more reminders about this booking." : "That link isn't valid. Please reply to any of our emails and we'll take care of it."), { headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
}

/** One-click "Unsubscribe" from the inbox (RFC 8058). */
export async function POST(req: NextRequest) {
  const ref = (req.nextUrl.searchParams.get("ref") ?? "").slice(0, 40);
  if (hasDb && ref && verifyRef(ref, "stop", req.nextUrl.searchParams.get("t") ?? "")) await q`update bookings set reminders_stopped = true where ref = ${ref}`;
  return new NextResponse(null, { status: 200 });
}
