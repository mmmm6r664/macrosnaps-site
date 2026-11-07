import { NextResponse } from "next/server";
import { subscribe } from "@/lib/records";
import { hasDb } from "@/lib/db";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const email = String(b.email ?? "").trim().slice(0, 200);
  if (!/^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  const name = String(b.name ?? "").replace(/[<>{}]/g, "").trim().slice(0, 80);
  if (!hasDb || !(await subscribe(email, name, String(b.source ?? "footer").slice(0, 40)))) return NextResponse.json({ error: "Signups are temporarily unavailable" }, { status: 503 });
  return NextResponse.json({ ok: true });
}
