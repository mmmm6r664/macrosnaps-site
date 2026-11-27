// One-click unsubscribe (RFC 8058): Gmail/Yahoo "Unsubscribe" button POSTs here with the subscriber's token.
import { NextResponse, type NextRequest } from "next/server";
import { hasDb, q } from "@/lib/db";

export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  if (hasDb && /^[A-Za-z0-9_-]{10,64}$/.test(t)) await q`update subscribers set status = 'unsubscribed' where token = ${t}`;
  return new NextResponse(null, { status: 200 });
}

/** Some mail apps open the List-Unsubscribe link with a plain GET: send the person to the confirmation page instead of a 405 error. */
export async function GET(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const url = new URL("/unsubscribe", req.nextUrl.origin);
  if (/^[A-Za-z0-9_-]{10,64}$/.test(t)) url.searchParams.set("t", t);
  return NextResponse.redirect(url, 302);
}
