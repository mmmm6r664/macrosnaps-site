import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { sendMail, table, TEAM_INBOX, esc } from "@/lib/mail";
import { SITE } from "@/lib/site";

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const sig = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const s = event.data.object as Stripe.Checkout.Session;
    const m = s.metadata || {};
    const email = s.customer_details?.email || s.customer_email || "";
    const rows: [string, unknown][] = [
      ["Service", m.service], ["Package", m.package], ["Paid", `$${((s.amount_total || 0) / 100).toFixed(2)}`],
      ["Schedule", m.schedule], ["Add-on", m.addon], ["City", m.city], ["Venue / address", m.venue_address],
      ["Name", m.customer_name], ["Email", email], ["Phone", m.customer_phone], ["Company", m.company], ["Notes", m.notes],
      ["Stripe session", s.id],
    ];
    await sendMail({ to: TEAM_INBOX, replyTo: email, subject: `NEW PAID BOOKING: ${m.service} — ${m.city} — ${(m.schedule || "").slice(0, 10)}`, html: table(rows) });
    if (email)
      await sendMail({
        to: email,
        replyTo: SITE.email,
        subject: `Your MacroSnaps booking is confirmed — ${(m.schedule || "").slice(0, 10)}`,
        html: `<div style="font-family:Arial,sans-serif;font-size:15px;color:#2f2e2e"><p>Hi ${esc(m.customer_name)},</p><p>Thank you for booking MacroSnaps. Your date is reserved and we will confirm your photographer/videographer by email before the shoot.</p>${table(rows.slice(0, 10))}<p>Questions? Reply to this email or call ${SITE.phone}.</p><p>— The MacroSnaps team</p></div>`,
      });
  }
  return NextResponse.json({ received: true });
}
