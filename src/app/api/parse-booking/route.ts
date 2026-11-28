import { NextResponse } from "next/server";
import { parseBooking } from "@/lib/parseBooking";
import { safeQuery } from "@/lib/safeInput";
import { limited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (limited(`parse:${(req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()}`, 20, 10 * 60_000)) return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  const b = await req.json().catch(() => null);
  const text = safeQuery(String(b?.text ?? ""));
  if (text === null) return NextResponse.json({ error: "Please describe your booking in words only." }, { status: 400 });
  if (!text) return NextResponse.json({ error: "Describe your booking first." }, { status: 400 });
  return NextResponse.json(parseBooking(text));
}
