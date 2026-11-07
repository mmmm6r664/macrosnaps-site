import { NextResponse } from "next/server";
import { parseBooking } from "@/lib/parseBooking";
import { safeQuery } from "@/lib/safeInput";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const text = safeQuery(String(b?.text ?? ""));
  if (text === null) return NextResponse.json({ error: "Please describe your booking in words only." }, { status: 400 });
  if (!text) return NextResponse.json({ error: "Describe your booking first." }, { status: 400 });
  return NextResponse.json(parseBooking(text));
}
