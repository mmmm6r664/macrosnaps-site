import { NextResponse } from "next/server";
import { matchRequest } from "@/lib/match";

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 300);
  if (q.trim().length < 3) return NextResponse.json({ error: "Tell us a little more" }, { status: 400 });
  return NextResponse.json(matchRequest(q));
}
