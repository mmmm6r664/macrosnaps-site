// "Finish my booking" link from the reminder emails: reopens Stripe Checkout for the saved booking (terms already signed).
import { NextResponse, type NextRequest } from "next/server";
import { stripe } from "@/lib/stripe";
import { q, hasDb } from "@/lib/db";
import { verifyRef } from "@/lib/automations";
import { attachCheckout } from "@/lib/records";
import { isTooSoon } from "@/lib/pricing";
import { SITE } from "@/lib/site";

export const dynamic = "force-dynamic";

type Row = { ref: string; status: string; service: string; service_name: string; package: string | null; addon: string | null; city: string | null; city_slug: string | null; venue_address: string | null;
  customer_name: string; email: string; phone: string | null; company: string | null; notes: string | null; schedule: { date: string; start: string; end: string; venue?: string; extraCrew?: number }[]; lines: { label: string; amount: number }[]; total_cents: number };

export async function GET(req: NextRequest) {
  const ref = (req.nextUrl.searchParams.get("ref") ?? "").slice(0, 40);
  const t = req.nextUrl.searchParams.get("t") ?? "";
  const go = (path: string) => NextResponse.redirect(new URL(path, req.url));
  if (!hasDb || !stripe || !ref || !verifyRef(ref, "resume", t)) return go("/book");
  const b = (await q<Row[]>`select ref, status, service, service_name, package, addon, city, city_slug, venue_address, customer_name, email, phone, company, notes, schedule, lines, total_cents from bookings where ref = ${ref}`)[0];
  if (!b) return go("/book");
  if (b.status !== "pending_payment") return go(b.status === "paid" || b.status === "confirmed" || b.status === "completed" ? "/account" : `/book?service=${b.service}`);
  // Date passed or now inside the 48-hour notice window: start a fresh booking instead.
  if (b.schedule.some((s) => isTooSoon(s.date, s.start || "00:00"))) return go(`/book?service=${b.service}${b.city_slug ? `&city=${b.city_slug}` : ""}`);
  const schedule = b.schedule.map((x) => `${x.date} ${x.start}-${x.end}${x.extraCrew ? ` +${x.extraCrew} crew` : ""}${x.venue ? ` @ ${x.venue}` : ""}`).join("; ");
  const md: Record<string, string> = {
    booking_ref: b.ref, service: b.service_name, package: b.package ?? "", addon: b.addon ?? "", total: `$${b.total_cents / 100}`, schedule: schedule.slice(0, 480),
    city: b.city ?? "", venue_address: b.venue_address ?? "", customer_name: b.customer_name, customer_phone: b.phone ?? "", company: b.company ?? "", notes: (b.notes ?? "").slice(0, 480), resumed: "1",
  };
  const origin = process.env.NEXT_PUBLIC_SITE_URL || req.nextUrl.origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: b.email,
    line_items: b.lines.map((l) => ({ quantity: 1, price_data: { currency: "usd", unit_amount: Math.round(l.amount * 100), product_data: { name: `${b.service_name} — ${l.label}`.slice(0, 250), description: b.city ?? undefined } } })),
    metadata: md,
    payment_intent_data: { description: `MacroSnaps: ${b.service_name} — ${b.city ?? ""} — ${b.schedule.map((x) => x.date).join(", ")}`.slice(0, 1000), metadata: md },
    invoice_creation: { enabled: true, invoice_data: { description: `MacroSnaps ${b.service_name}`, footer: `${SITE.name} · ${SITE.phone} · ${SITE.email}` } },
    allow_promotion_codes: true,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
    success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book?service=${b.service}${b.city_slug ? `&city=${b.city_slug}` : ""}&cancelled=1`,
  });
  await attachCheckout(b.ref, session.id);
  return NextResponse.redirect(session.url!, 303);
}
