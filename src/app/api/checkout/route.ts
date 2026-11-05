import { NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { findPackage, getService } from "@/lib/services";
import { quoteHourly, type Kind, type SessionInput, type Line } from "@/lib/pricing";
import { getCity, cityLabel } from "@/lib/geo";
import { SITE } from "@/lib/site";
import { sendMail, table, TEAM_INBOX } from "@/lib/mail";
import { TERMS_VERSION } from "@/lib/terms";

const s = (v: unknown, max = 300) => String(v ?? "").trim().slice(0, max);
const isDate = (d: string) => /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T23:59:59`) >= new Date();
const isTime = (t: string) => /^\d{2}:\d{2}$/.test(t);

export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  // Prices always come from the server-side catalog and rate card, never from the browser.
  const service = getService(s(b.service));
  if (!service) return NextResponse.json({ error: "Please choose a service" }, { status: 400 });
  const hourly = service.packages.every((p) => p.hours) && (service.kind === "photo" || service.kind === "video");
  const pkg = hourly ? undefined : findPackage(service.slug, s(b.package));
  if (!hourly && (!pkg || pkg.quoteOnly)) return NextResponse.json({ error: "Please choose a package" }, { status: 400 });

  const raw: unknown[] = Array.isArray(b.sessions) ? b.sessions.slice(0, 10) : [];
  const sessions: SessionInput[] = raw.map((x) => {
    const o = (x ?? {}) as Record<string, unknown>;
    return { date: s(o.date, 10), start: s(o.start, 5), end: s(o.end, 5), venue: s(o.venue, 120), extraCrew: Number(o.extraCrew) || 0 };
  });
  if (!sessions.length || sessions.some((x) => !isDate(x.date) || !isTime(x.start) || !isTime(x.end)))
    return NextResponse.json({ error: "Please enter a future date and start and end times for every day" }, { status: 400 });

  const email = s(b.email);
  const required = { name: s(b.name), email, phone: s(b.phone, 40), location: s(b.location), address: s(b.address, 400) };
  if (Object.values(required).some((v) => !v) || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return NextResponse.json({ error: "Please complete all required fields" }, { status: 400 });
  const signature = s(b.signature, 100);
  if (b.agree !== true || signature.length < 3) return NextResponse.json({ error: "Please read and sign the Terms and Conditions" }, { status: 400 });
  const signedAt = new Date().toISOString();
  const signerIp = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 45);

  const addCompanion = hourly && b.addCompanion === true;
  const lines: Line[] = hourly
    ? quoteHourly(service.kind as Kind, sessions, addCompanion).lines
    : sessions.map((x, i) => ({ label: `${sessions.length > 1 ? `Day ${i + 1} (${x.date})` : x.date}: ${pkg!.name}`, amount: pkg!.price }));
  const total = lines.reduce((a, l) => a + l.amount, 0);

  const city = getCity(s(b.citySlug));
  const location = city ? cityLabel(city) : required.location;
  const schedule = sessions.map((x) => `${x.date} ${x.start}-${x.end}${x.extraCrew ? ` +${x.extraCrew} crew` : ""}${x.venue ? ` @ ${x.venue}` : ""}`).join("; ");
  const details: Record<string, string> = {
    service: service.name,
    package: hourly ? "Hourly" : pkg!.name,
    addon: addCompanion ? (service.kind === "photo" ? "Videography" : "Photography") : "",
    total: `$${total}`,
    schedule: schedule.slice(0, 480),
    city: location,
    venue_address: required.address,
    customer_name: required.name,
    customer_phone: required.phone,
    company: s(b.company, 120),
    notes: s(b.notes, 480),
    terms_signed_by: signature,
    terms_version: TERMS_VERSION,
    terms_signed_at: signedAt,
    terms_signer_ip: signerIp,
  };

  if (!stripe) {
    // Payments not configured yet: send the booking as a request so nothing is lost.
    const r = await sendMail({ to: TEAM_INBOX, replyTo: email, subject: `Booking request (unpaid): ${service.name} — ${location} — ${sessions[0].date}`, html: table([["Email", email], ...Object.entries(details), ...lines.map((l) => [l.label, `$${l.amount}`] as [string, string])]) });
    if (!r.ok) return NextResponse.json({ error: "Online booking is temporarily unavailable — please call 877-622-4973" }, { status: 503 });
    return NextResponse.json({ requested: true });
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL || new URL(req.url).origin;
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: lines.map((l) => ({
      quantity: 1,
      price_data: { currency: "usd", unit_amount: l.amount * 100, product_data: { name: `${service.name} — ${l.label}`.slice(0, 250), description: location } },
    })),
    metadata: details,
    payment_intent_data: { description: `MacroSnaps: ${service.name} — ${location} — ${sessions.map((x) => x.date).join(", ")}`.slice(0, 1000), metadata: details },
    invoice_creation: { enabled: true, invoice_data: { description: `MacroSnaps ${service.name}`, footer: `${SITE.name} · ${SITE.phone} · ${SITE.email}` } },
    allow_promotion_codes: true,
    success_url: `${origin}/book/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/book?service=${service.slug}${city ? `&city=${city.slug}` : ""}&cancelled=1`,
  });
  return NextResponse.json({ url: session.url });
}
