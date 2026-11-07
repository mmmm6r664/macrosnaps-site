// Saves bookings, inquiries and subscribers to the database (when connected) for the admin portal.
import "server-only";
import { randomBytes } from "crypto";
import { db, hasDb, q } from "@/lib/db";

export const newRef = () => `MS-${Date.now().toString(36).toUpperCase().slice(-5)}${randomBytes(2).toString("hex").toUpperCase()}`;

export type NewBooking = {
  ref: string; status: "pending_payment" | "requested"; service: string; serviceName: string; package?: string; addon?: string;
  city?: string; citySlug?: string; venueAddress?: string; customerName: string; email: string; phone?: string; company?: string; notes?: string;
  schedule: { date: string; start: string; end: string; venue?: string; extraCrew?: number }[]; lines: { label: string; amount: number }[];
  totalCents: number; signature?: string; termsVersion?: string; signedAt?: string; signerIp?: string;
};

/** Returns true when saved. Never throws, so a database problem can't block a customer's booking. */
export async function saveBooking(b: NewBooking): Promise<boolean> {
  if (!hasDb) return false;
  try {
    const sql = await db();
    const first = [...b.schedule].map((s) => s.date).sort()[0] ?? null;
    await sql`insert into bookings (ref, status, service, service_name, package, addon, city, city_slug, venue_address, customer_name, email, phone, company, notes,
      schedule, lines, total_cents, signature, terms_version, signed_at, signer_ip, first_date)
      values (${b.ref}, ${b.status}, ${b.service}, ${b.serviceName}, ${b.package ?? null}, ${b.addon ?? null}, ${b.city ?? null}, ${b.citySlug ?? null}, ${b.venueAddress ?? null},
      ${b.customerName}, ${b.email}, ${b.phone ?? null}, ${b.company ?? null}, ${b.notes ?? null}, ${sql.json(b.schedule)}, ${sql.json(b.lines)}, ${b.totalCents},
      ${b.signature ?? null}, ${b.termsVersion ?? null}, ${b.signedAt ?? null}, ${b.signerIp ?? null}, ${first})`;
    return true;
  } catch (e) {
    console.error("[db] saveBooking", e);
    return false;
  }
}

export async function attachCheckout(ref: string, sessionId: string) {
  if (!hasDb) return;
  try { await q`update bookings set stripe_session_id = ${sessionId}, updated_at = now() where ref = ${ref}`; } catch (e) { console.error(e); }
}

export async function markPaid(ref: string | undefined, sessionId: string, paymentIntent: string | null, amountCents: number) {
  if (!hasDb) return;
  try {
    const sql = await db();
    await sql`update bookings set status = 'paid', stripe_payment_intent = ${paymentIntent}, total_cents = ${amountCents}, updated_at = now()
      where (ref = ${ref ?? ""} or stripe_session_id = ${sessionId}) and status in ('pending_payment', 'requested')`;
  } catch (e) { console.error("[db] markPaid", e); }
}

export async function saveInquiry(kind: "contact" | "application", name: string, email: string, phone: string | undefined, data: Record<string, unknown>): Promise<boolean> {
  if (!hasDb) return false;
  try {
    const sql = await db();
    await sql`insert into inquiries (kind, name, email, phone, data) values (${kind}, ${name.slice(0, 120)}, ${email.slice(0, 200)}, ${phone ?? null}, ${sql.json(JSON.parse(JSON.stringify(data)))})`;
    return true;
  } catch (e) {
    console.error("[db] saveInquiry", e);
    return false;
  }
}

export async function subscribe(email: string, name: string, source: string): Promise<boolean> {
  if (!hasDb) return false;
  try {
    const sql = await db();
    await sql`insert into subscribers (email, name, token, source) values (${email.toLowerCase()}, ${name}, ${randomBytes(18).toString("base64url")}, ${source})
      on conflict (email) do update set status = 'subscribed'`;
    return true;
  } catch (e) {
    console.error("[db] subscribe", e);
    return false;
  }
}
