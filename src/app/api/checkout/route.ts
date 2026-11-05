import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { findPackage, getService } from "@/lib/services";
import { getCity, cityLabel } from "@/lib/geo";
import { SITE } from "@/lib/site";
import { sendMail, table, TEAM_INBOX } from "@/lib/mail";

const s = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Prices always come from the server-side catalog, never from the browser.
  const service = getService(s(b.service));
  const pkg = service && findPackage(service.slug, s(b.package));
  if (!service || !pkg || pkg.quoteOnly) return NextResponse.json({ error: "Please choose a service and package" }, { status: 400 });

  const email = s(b.email);
  const required = { name: s(b.name), email, phone: s(b.phone, 40), date: s(b.date, 20), time: s(b.time, 10), location: s(b.location), address: s(b.address, 400) };
  if (Object.values(required).some((v) => !v) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Please complete all required fields" }, { status: 400 });
  if (!/^\d{4}-\d{2}-\d{2}$/.test(required.date) || new Date(`${required.date}T23:59:59`) < new Date())
    return NextResponse.json({ error: "Please choose a future date" }, { status: 400 });
  if (b.agree !== true) return NextResponse.json({ error: "Please accept the booking terms" }, { status: 400 });

  const city = getCity(s(b.citySlug));
  const location = city ? cityLabel(city) : required.location;
  const details = {
    service: service.name,
    package: pkg.name,
    price: `$${pkg.price}`,
    date: required.date,
    start_time: required.time,
    city: location,
    venue_address: required.address,
    customer_name: required.name,
    customer_phone: required.phone,
    company: s(b.company, 120),
    notes: s(b.notes, 480),
  };

  if (!stripe) {
    // Payments not configured yet: send the booking as a request so nothing is lost.
    const r = await sendMail({ to: TEAM_INBOX, replyTo: email, subject: `Booking request (unpaid): ${service.name} — ${location} — ${required.date}`, html: table([["Email", email], ...Object.entries(details)]) });
    if (!r.ok) return NextResponse.json({ error: "Online booking is temporarily unavailable" }, { status: 503 });
    return NextResponse.json({ requested: true });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: pkg.price * 100,
          product_data: { name: `${service.name} — ${pkg.name}`, description: `${required.date} at ${required.time} · ${location}`.slice(0, 500) },
        },
      },
    ],
    metadata: details,
    payment_intent_data: { description: `MacroSnaps: ${service.name} (${pkg.name}) — ${location} — ${required.date}`, metadata: details },
    invoice_creation: { enabled: true, invoice_data: { description: `MacroSnaps ${service.name}`, footer: `${SITE.name} · ${SITE.phone} · ${SITE.email}` } },
    allow_promotion_codes: true,
    success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book?service=${service.slug}&package=${pkg.id}${city ? `&city=${city.slug}` : ""}&cancelled=1`,
  });
  return NextResponse.json({ url: session.url });
}
