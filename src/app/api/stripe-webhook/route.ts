import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { sendMail, TEAM_INBOX } from "@/lib/mail";
import { SITE } from "@/lib/site";
import { markPaid } from "@/lib/records";
import { db, hasDb, q } from "@/lib/db";
import { ORIGIN } from "@/lib/emailTemplate";
import { bookingConfirmed, teamNewBooking } from "@/lib/emails";

export async function POST(req: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) return NextResponse.json({ error: "Not configured" }, { status: 503 });
  const sig = req.headers.get("stripe-signature") || "";
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch {
    return NextResponse.json({ error: "Bad signature" }, { status: 400 });
  }

  // Most methods (cards, wallets, Klarna, Afterpay) are paid at checkout. Delayed methods finish later
  // with checkout.session.async_payment_succeeded, so only confirm once the money is actually in.
  const isCheckout = event.type === "checkout.session.completed" || event.type === "checkout.session.async_payment_succeeded";
  if (isCheckout && (event.data.object as Stripe.Checkout.Session).payment_status === "paid") {
    const s = event.data.object as Stripe.Checkout.Session;
    const m = s.metadata || {};
    const email = s.customer_details?.email || s.customer_email || "";
    const first = await markPaid(m.booking_ref, s.id, typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null, s.amount_total || 0);
    if (first === false) return NextResponse.json({ received: true, duplicate: true }); // already confirmed; don't email twice
    // Itemized lines saved with the booking.
    let lines: { label: string; amount: number }[] = [];
    let bookingId: number | null = null;
    if (hasDb && m.booking_ref) {
      try {
        const r = await q<{ id: number; lines: { label: string; amount: number }[] }[]>`select id, lines from bookings where ref = ${m.booking_ref}`;
        if (r[0]) { lines = r[0].lines || []; bookingId = r[0].id; }
      } catch (e) { console.error("[webhook] lines lookup failed", e); }
    }
    const total = `$${((s.amount_total || 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`;
    const info = {
      firstName: m.customer_name || "", service: m.service || "Your booking", ref: m.booking_ref || "", schedule: m.schedule || "",
      city: m.city, venue: m.venue_address, lines: lines.length ? lines : [{ label: m.service || "Booking", amount: (s.amount_total || 0) / 100 }],
      total, phone: m.customer_phone, email, company: m.company, notes: m.notes,
    };
    const team = teamNewBooking(info, bookingId ? `${ORIGIN}/admin/bookings/${bookingId}` : undefined);
    await sendMail({ to: TEAM_INBOX, replyTo: email || undefined, subject: team.subject, html: team.html });
    if (email) {
      const c = bookingConfirmed(info);
      await sendMail({ to: email, replyTo: SITE.email, subject: c.subject, html: c.html });
    }
  }
  // Refunds made directly in the Stripe dashboard stay in sync with the admin portal.
  if (event.type === "charge.refunded" && hasDb) {
    const ch = event.data.object as Stripe.Charge;
    const pi = typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id;
    if (pi) {
      const sql = await db();
      await sql`update bookings set amount_refunded_cents = ${ch.amount_refunded},
        status = case when ${ch.amount_refunded} >= total_cents then 'refunded' else 'partially_refunded' end, updated_at = now()
        where stripe_payment_intent = ${pi}`;
    }
  }
  return NextResponse.json({ received: true });
}
