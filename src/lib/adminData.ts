import "server-only";
import { db, q } from "@/lib/db";

export type Booking = {
  id: number; ref: string; status: string; service: string; service_name: string; package: string | null; addon: string | null; city: string | null; city_slug: string | null;
  venue_address: string | null; customer_name: string; email: string; phone: string | null; company: string | null; notes: string | null;
  schedule: { date: string; start: string; end: string; venue?: string; extraCrew?: number }[]; lines: { label: string; amount: number }[];
  total_cents: number; amount_refunded_cents: number; signature: string | null; terms_version: string | null; signed_at: Date | null; signer_ip: string | null;
  stripe_session_id: string | null; stripe_payment_intent: string | null; internal_notes: string; first_date: Date | null; created_at: Date; updated_at: Date; stage?: string;
};

export const BOOKING_STATUSES = ["requested", "pending_payment", "paid", "confirmed", "completed", "cancelled", "partially_refunded", "refunded"] as const;
export const PAGE_SIZE = 25;

export async function listBookings(o: { status?: string; q?: string; page?: number; userId?: number }) {
  const sql = await db();
  const page = Math.max(1, o.page ?? 1);
  const q = o.q ? `%${o.q.replace(/[%_]/g, "")}%` : null;
  const rows = await sql<Booking[]>`
    select b.* from bookings b
    ${o.userId ? sql`join crew_assignments c on c.booking_id = b.id and c.user_id = ${o.userId}` : sql``}
    where true
    ${o.status ? sql`and b.status = ${o.status}` : sql``}
    ${q ? sql`and (b.ref ilike ${q} or b.customer_name ilike ${q} or b.email ilike ${q} or b.city ilike ${q} or b.service_name ilike ${q} or coalesce(b.company,'') ilike ${q})` : sql``}
    order by b.created_at desc limit ${PAGE_SIZE + 1} offset ${(page - 1) * PAGE_SIZE}`;
  return { rows: rows.slice(0, PAGE_SIZE), more: rows.length > PAGE_SIZE, page };
}

export async function getBooking(id: number) {
  const sql = await db();
  const [b] = await sql<Booking[]>`select * from bookings where id = ${id}`;
  if (!b) return null;
  const crew = await sql<{ id: number; name: string; email: string }[]>`select u.id, u.name, u.email from crew_assignments c join users u on u.id = c.user_id where c.booking_id = ${id} order by u.name`;
  return { ...b, crew };
}

export async function staffUsers() {
  return q<{ id: number; name: string; email: string; role: string }[]>`select id, name, email, role from users where active order by name`;
}

/** Bookings with any day inside [from, to) (dates as YYYY-MM-DD). */
export async function bookingsBetween(from: string, to: string, userId?: number) {
  const sql = await db();
  return sql<Booking[]>`
    select distinct b.* from bookings b
    ${userId ? sql`join crew_assignments c on c.booking_id = b.id and c.user_id = ${userId}` : sql``}
    , jsonb_array_elements(b.schedule) s
    where (s->>'date') >= ${from} and (s->>'date') < ${to} and b.status not in ('cancelled', 'refunded')`;
}
