// One-click unsubscribe (RFC 8058): Gmail/Yahoo "Unsubscribe" button POSTs here with the subscriber's token.
import { NextResponse, type NextRequest } from "next/server";
import { hasDb, q } from "@/lib/db";

export async function POST(req: NextRequest) {
  const t = req.nextUrl.searchParams.get("t") ?? "";
  if (hasDb && /^[A-Za-z0-9_-]{10,64}$/.test(t)) await q`update subscribers set status = 'unsubscribed' where token = ${t}`;
  return new NextResponse(null, { status: 200 });
}
