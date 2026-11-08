import { NextResponse } from "next/server";
import { sendMail, table, TEAM_INBOX } from "@/lib/mail";
import { saveInquiry } from "@/lib/records";

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b || typeof b !== "object") return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  if (b.website) return NextResponse.json({ ok: true }); // honeypot
  const email = String(b.email || "").trim();
  if (!b.firstName || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !b.message) {
    return NextResponse.json({ error: "Please fill in your name, a valid email and a message" }, { status: 400 });
  }
  const clip = (v: unknown, n = 300) => String(v ?? "").trim().slice(0, n);
  const saved = await saveInquiry("contact", `${clip(b.firstName, 60)} ${clip(b.lastName, 60)}`.trim(), email, clip(b.phone, 40) || undefined, {
    company: clip(b.company), date: clip(b.date), subject: clip(b.subject, 120), message: clip(b.message, 5000), page: clip(b.page),
  });
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
  if (!r.ok && !saved) return NextResponse.json({ error: "We couldn't send your message right now" }, { status: 502 });
  const { contactReceived } = await import("@/lib/emails");
  const ack = contactReceived(clip(b.firstName, 60), clip(b.subject, 120), clip(b.message, 5000));
  await sendMail({ to: email, subject: ack.subject, html: ack.html }).catch(() => null);
  return NextResponse.json({ ok: true });
}
