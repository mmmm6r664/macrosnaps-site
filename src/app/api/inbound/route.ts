// Resend "email.received" webhook. Client emails (forwarded from the Gmail inbox, or replies to portal emails)
// land in the portal inbox. Replies that came straight to our receiving address are copied to the team Gmail.
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { ingestInbound, htmlToText, parseAddress } from "@/lib/inboundEmail";
import { sendMail, esc } from "@/lib/mail";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

/** Svix signature check (Resend webhooks): HMAC-SHA256 of "id.timestamp.body" with the base64 secret after "whsec_". */
function verified(req: Request, body: string): boolean {
  const secret = process.env.RESEND_INBOUND_SECRET;
  if (!secret) return false;
  const id = req.headers.get("svix-id"), ts = req.headers.get("svix-timestamp"), sigs = req.headers.get("svix-signature");
  if (!id || !ts || !sigs) return false;
  if (Math.abs(Date.now() / 1000 - Number(ts)) > 600) return false;
  const expected = createHmac("sha256", Buffer.from(secret.replace(/^whsec_/, ""), "base64")).update(`${id}.${ts}.${body}`).digest();
  return sigs.split(" ").some((part) => {
    const sig = Buffer.from(part.split(",")[1] ?? "", "base64");
    return sig.length === expected.length && timingSafeEqual(sig, expected);
  });
}

type Received = { from: string; to: string[] | string; subject: string; text?: string | null; html?: string | null; headers?: Record<string, string> | null; message_id?: string | null; created_at?: string };

export async function POST(req: Request) {
  const raw = await req.text();
  if (!verified(req, raw)) return new NextResponse("Invalid signature", { status: 401 });
  let event: { type?: string; data?: { email_id?: string } };
  try { event = JSON.parse(raw); } catch { return new NextResponse("Bad JSON", { status: 400 }); }
  if (event.type !== "email.received" || !event.data?.email_id) return NextResponse.json({ ok: true, ignored: true });

  // The webhook carries metadata only; fetch the full email.
  const r = await fetch(`https://api.resend.com/emails/receiving/${encodeURIComponent(event.data.email_id)}`, { headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}` } });
  if (!r.ok) return new NextResponse("Could not fetch email", { status: 502 });
  const m = (await r.json()) as Received;
  const to = (Array.isArray(m.to) ? m.to : [m.to]).join(", ");
  const text = m.text || htmlToText(m.html || "");
  const messageId = m.message_id || m.headers?.["message-id"] || m.headers?.["Message-ID"] || event.data.email_id;

  const res = await ingestInbound({ from: m.from, to, subject: m.subject, text, messageId, receivedAt: m.created_at ? new Date(m.created_at) : undefined });

  // A client replied to a portal email (it came to our receiving address, not via Gmail): copy it to the team inbox.
  const viaGmail = /x-forwarded-for|x-forwarded-to/i.test(Object.keys(m.headers ?? {}).join(" "));
  if (!viaGmail && (res.status === "added" || res.status === "created")) {
    const { email, name } = parseAddress(m.from);
    await sendMail({
      to: SITE.email, replyTo: email, subject: `${name}: ${m.subject}`.slice(0, 200),
      html: `<p style="font:14px Arial">Client reply in the portal: <a href="https://www.macrosnaps.com/admin/inbox/${res.inquiryId}">open conversation</a></p><pre style="font:14px Arial;white-space:pre-wrap">${esc(text).slice(0, 20000)}</pre>`,
    }).catch(() => null);
  }
  return NextResponse.json({ ok: true, ...res });
}
