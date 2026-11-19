// A paid invoice becomes a booking, so invoiced shoots show up in admin → Bookings and the calendar like website bookings.
import "server-only";
import type Stripe from "stripe";
import { hasDb, db } from "@/lib/db";
import { newRef } from "@/lib/records";

const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];

/** "6:30 PM" → "18:30" */
function to24(t: string): string | null {
  const m = t.trim().match(/^(\d{1,2})(?::(\d{2}))?\s*([AaPp])\.?[Mm]\.?$/);
  if (!m) return null;
  let h = Number(m[1]) % 12;
  if (/p/i.test(m[3])) h += 12;
  return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
}

/** Pulls the first "November 20, 2026" date and an optional "5:00 – 7:00 PM" time range out of free text. */
export function parseWhen(text: string): { date: string; start: string; end: string } | null {
  const d = text.match(/\b(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),?\s+(20\d{2})\b/i);
  if (!d) return null;
  const date = `${d[3]}-${String(MONTHS.indexOf(d[1].toLowerCase()) + 1).padStart(2, "0")}-${d[2].padStart(2, "0")}`;
  let start = "", end = "";
  const t = text.slice(d.index ?? 0).match(/(\d{1,2}(?::\d{2})?\s*(?:[AaPp]\.?[Mm]\.?)?)\s*[–—-]\s*(\d{1,2}(?::\d{2})?\s*[AaPp]\.?[Mm]\.?)/);
  if (t) {
    const endAmpm = t[2].match(/[AaPp]\.?[Mm]\.?/)?.[0] ?? "";
    start = to24(/[AaPp]/.test(t[1]) ? t[1] : `${t[1]} ${endAmpm}`) ?? "";
    end = to24(t[2]) ?? "";
  }
  return { date, start, end };
}

/** Creates (once) a paid booking for a paid invoice. If the client has an unpaid website booking for the same amount, that booking is marked paid instead. */
export async function bookingFromInvoice(inv: Stripe.Invoice): Promise<{ ref: string; created: boolean } | null> {
  // Only invoices made in admin → Invoices; website checkouts already have their booking.
  if (!hasDb || inv.status !== "paid" || !(inv.amount_paid > 0) || inv.metadata?.source !== "admin") return null;
  const sql = await db();
  const [existing] = await sql<{ ref: string }[]>`select ref from bookings where stripe_invoice_id = ${inv.id!}`;
  if (existing) return { ref: existing.ref, created: false };
  const email = (inv.customer_email ?? "").toLowerCase();
  const total = inv.amount_paid;
  const pi = typeof inv.payment_intent === "string" ? inv.payment_intent : inv.payment_intent?.id ?? null;
  if (pi) { const [byPi] = await sql<{ ref: string }[]>`select ref from bookings where stripe_payment_intent = ${pi}`; if (byPi) return { ref: byPi.ref, created: false }; }
  const paidAt = new Date(((inv.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000))) * 1000);
  const [pending] = await sql<{ ref: string }[]>`update bookings set status = 'paid', stripe_invoice_id = ${inv.id!}, stripe_payment_intent = coalesce(stripe_payment_intent, ${pi}),
      reminders_stopped = true, updated_at = now()
    where id = (select id from bookings where lower(email) = ${email} and total_cents = ${total} and status in ('pending_payment', 'requested') order by id desc limit 1)
    returning ref`;
  if (pending) return { ref: pending.ref, created: false };

  const items = (inv.lines?.data ?? []).map((l) => ({ label: l.description || "Service", amount: (l.amount ?? 0) / 100 }));
  const text = [inv.description, ...items.map((i) => i.label)].filter(Boolean).join(" \n ");
  const video = /video/i.test(text), photo = /photo|portrait|headshot/i.test(text) || !video;
  const service = video && !photo ? "event-videography" : "event-photography";
  const serviceName = video && photo ? "Photography + Videography" : video ? "Event Videography" : "Event Photography";
  const a = inv.customer_address;
  const city = a?.city ? [a.city, a.state].filter(Boolean).join(", ") : null;
  const venue = a?.line1 ? [a.line1, a.line2, city, a.postal_code].filter(Boolean).join(", ") : null;
  const when = parseWhen(text);
  const schedule = when ? [{ date: when.date, start: when.start, end: when.end, venue: venue ?? "" }] : [];
  const contact = inv.metadata?.contact_name || inv.customer_name || email;
  const company = inv.metadata?.contact_name && inv.customer_name && inv.customer_name !== inv.metadata.contact_name ? inv.customer_name : null;
  const ref = newRef();
  await sql`insert into bookings (ref, status, service, service_name, package, city, venue_address, customer_name, email, phone, company, notes,
      schedule, lines, total_cents, stripe_payment_intent, stripe_invoice_id, first_date, reminders_stopped, internal_notes, created_at)
    values (${ref}, 'paid', ${service}, ${serviceName}, 'Invoice', ${city}, ${venue}, ${contact}, ${email}, ${inv.customer_phone ?? null}, ${company},
      ${inv.description ?? null}, ${sql.json(schedule)}, ${sql.json(items)}, ${total}, ${pi}, ${inv.id!}, ${when?.date ?? null}, true,
      ${`Created from paid invoice ${inv.number ?? inv.id}.${when ? "" : " No date found in the invoice: add the schedule."}`}, ${paidAt})`;
  return { ref, created: true };
}
