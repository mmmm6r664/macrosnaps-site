import { NextResponse } from "next/server";
import { matchRequest } from "@/lib/match";
import { safeQuery } from "@/lib/safeInput";
import { limited } from "@/lib/rateLimit";

export async function GET(req: Request) {
  if (limited(`match:${(req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()}`, 30, 10 * 60_000)) return NextResponse.json({ error: "Too many requests. Please try again in a few minutes." }, { status: 429 });
  const q = safeQuery(new URL(req.url).searchParams.get("q"));
  if (q === null) return NextResponse.json({ error: "Please describe your event in words only." }, { status: 400 });
  if (q.trim().length < 3) return NextResponse.json({ error: "Tell us a little more" }, { status: 400 });
  return NextResponse.json(matchRequest(q));
}
