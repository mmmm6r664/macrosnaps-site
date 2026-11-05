import { NextResponse } from "next/server";
import { sendMail, table, TEAM_INBOX } from "@/lib/mail";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const email = String(b.email || "").trim();
  if (!b.firstName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !b.message) {
    return NextResponse.json({ error: "Please fill in your name, a valid email and a message" }, { status: 400 });
  }
  const r = await sendMail({
    to: TEAM_INBOX,
    replyTo: email,
    subject: `Website inquiry: ${String(b.subject || "General").slice(0, 120)}`,
    html: table([
      ["Name", `${b.firstName} ${b.lastName || ""}`],
      ["Email", email],
      ["Phone", b.phone],
      ["Company", b.company],
      ["Event date(s)", b.date],
      ["Subject", b.subject],
      ["Message", b.message],
      ["Sent from page", b.page],
    ]),
  });
  if (!r.ok) return NextResponse.json({ error: "We couldn't send your message right now" }, { status: 502 });
  return NextResponse.json({ ok: true });
}
