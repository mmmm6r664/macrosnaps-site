import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { sendMail, table, TEAM_INBOX, esc } from "@/lib/mail";
import { SITE } from "@/lib/site";
import { markPaid } from "@/lib/records";
import { db, hasDb, q } from "@/lib/db";
import { emailWrap, ORIGIN } from "@/lib/notify";

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
    await markPaid(m.booking_ref, s.id, typeof s.payment_intent === "string" ? s.payment_intent : s.payment_intent?.id ?? null, s.amount_total || 0);
    const rows: [string, unknown][] = [
      ["Service", m.service], ["Package", m.package], ["Paid", `$${((s.amount_total || 0) / 100).toFixed(2)}`],
      ["Schedule", m.schedule], ["Add-on", m.addon], ["City", m.city], ["Venue / address", m.venue_address],
      ["Name", m.customer_name], ["Email", email], ["Phone", m.customer_phone], ["Company", m.company], ["Notes", m.notes],
      ["Booking ref", m.booking_ref], ["Stripe session", s.id],
    ];
    // Itemized lines saved with the booking (falls back to the summary rows if the database is unavailable).
    let lines: { label: string; amount: number }[] = [];
    let bookingId: number | null = null;
    if (hasDb && m.booking_ref) {
      try {
        const r = await q<{ id: number; lines: { label: string; amount: number }[] }[]>`select id, lines from bookings where ref = ${m.booking_ref}`;
        if (r[0]) { lines = r[0].lines || []; bookingId = r[0].id; }
      } catch (e) { console.error("[webhook] lines lookup failed", e); }
    }
    const paid = `$${((s.amount_total || 0) / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD`;
    const itemized = lines.length
      ? `<table cellpadding="6" style="border-collapse:collapse;width:100%;font-size:14px;margin:12px 0">${lines.map((l) => `<tr><td style="border-bottom:1px solid #eee">${esc(l.label)}</td><td style="border-bottom:1px solid #eee;text-align:right;white-space:nowrap">$${Number(l.amount).toLocaleString()}</td></tr>`).join("")}<tr><td><b>Total paid</b></td><td style="text-align:right"><b>${paid}</b></td></tr></table>`
      : "";
    const adminLink = bookingId && process.env.ADMIN_GATE_PATH ? `<p><a href="${ORIGIN}/admin/bookings/${bookingId}" style="background:#ccba56;color:#000;padding:10px 18px;text-decoration:none;display:inline-block">Open in admin portal</a></p>` : "";
    await sendMail({
      to: TEAM_INBOX,
      replyTo: email,
      subject: `NEW PAID BOOKING: ${m.service} — ${m.city} — ${(m.schedule || "").slice(0, 10)} — ${paid}`,
      html: emailWrap("New paid booking", `${itemized}${table(rows)}${adminLink}`),
    });
    if (email)
      await sendMail({
        to: email,
        replyTo: SITE.email,
        subject: `Booking confirmed: ${m.service} on ${(m.schedule || "").slice(0, 10)} (ref ${m.booking_ref})`,
        html: emailWrap(
          "Your booking is confirmed",
          `<p>Hi ${esc((m.customer_name || "").split(" ")[0] || "there")},</p><p>Thank you for booking MacroSnaps. Your payment was received and your date is reserved. We'll email you your photographer/videographer's details before the shoot.</p>${itemized}${table(rows.slice(3, 10))}<p><b>Booking reference:</b> ${esc(m.booking_ref)}</p><p><a href="${ORIGIN}/account" style="background:#ccba56;color:#000;padding:12px 22px;text-decoration:none;display:inline-block;font-weight:bold">Track your order</a></p><p style="font-size:13px;color:#666">Sign in to your client portal with this email address to see your order status and, after the shoot, your gallery.</p><p>Need to change something? Just reply to this email or call ${esc(SITE.phone)}.</p><p>— The MacroSnaps team</p>`,
        ),
      });
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
