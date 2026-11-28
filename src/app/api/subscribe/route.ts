import { startNurture } from "@/lib/automations";
import { NextResponse } from "next/server";
import { subscribe } from "@/lib/records";
import { hasDb } from "@/lib/db";
import { limited } from "@/lib/rateLimit";

export async function POST(req: Request) {
  if (limited(`subscribe:${(req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()}`, 10, 10 * 60_000)) return NextResponse.json({ error: "Too many sign-ups from this connection. Please try again later." }, { status: 429 });
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const email = String(b.email ?? "").trim().slice(0, 200);
  if (!/^[^@\s<>]+@[^@\s<>]+\.[^@\s<>]+$/.test(email)) return NextResponse.json({ error: "Please enter a valid email" }, { status: 400 });
  const name = String(b.name ?? "").replace(/[<>{}]/g, "").trim().slice(0, 80);
  if (!hasDb || !(await subscribe(email, name, String(b.source ?? "footer").slice(0, 40)))) return NextResponse.json({ error: "Signups are temporarily unavailable" }, { status: 503 });
  await startNurture(email);
  return NextResponse.json({ ok: true });
}
