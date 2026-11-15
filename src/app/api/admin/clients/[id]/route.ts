// One client's full record (contact, past orders, bookings, messages) as a CSV download.
import { currentUser, isManager } from "@/lib/auth";
import { q } from "@/lib/db";
import { csv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";
const day = (d: unknown) => (d instanceof Date ? d.toISOString().slice(0, 10) : String(d ?? ""));

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || !isManager(u)) return new Response("Unauthorized", { status: 401 });
  const id = Number((await params).id);
  const [c] = await q<{ first_name: string; last_name: string; email: string | null; phone: string | null; company: string | null; address: string | null; source: string | null; notes: string | null; created_at: Date }[]>`select * from clients where id = ${id}`;
  if (!c) return new Response("Not found", { status: 404 });
  const e = c.email ?? "";
  const [orders, bookings, inbox] = await Promise.all([
    q<{ number: string | null; created_at: Date; event: string | null; company: string | null; location: string | null; event_date: string | null; items: { name: string; qty: number }[]; total_cents: number; paid_cents: number; payment_status: string | null }[]>`select number, created_at, event, company, location, event_date, items, total_cents, paid_cents, payment_status from orders where client_id = ${id} order by created_at desc`,
    e ? q<{ ref: string; service_name: string; city: string | null; first_date: string | null; total_cents: number; status: string; created_at: Date }[]>`select ref, service_name, city, first_date::text, total_cents, status, created_at from bookings where lower(email) = ${e} order by created_at desc` : Promise.resolve([]),
    e ? q<{ subject: string | null; status: string; created_at: Date }[]>`select data->>'subject' as subject, status, created_at from inquiries where lower(email) = ${e} order by id desc` : Promise.resolve([]),
  ]);
  const rows: unknown[][] = [
    ["Contact", `${c.first_name} ${c.last_name}`.trim(), c.email, c.phone, c.company, c.address, c.source, `since ${day(c.created_at)}`, c.notes],
    ...orders.map((o) => ["Past order", `#${o.number ?? ""}`, day(o.created_at), o.event, o.company, [o.location, o.event_date].filter(Boolean).join(" · "), o.items.map((i) => i.name).join(", "), (o.total_cents / 100).toFixed(2), `${o.payment_status ?? ""} (paid ${(o.paid_cents / 100).toFixed(2)})`]),
    ...bookings.map((b) => ["Booking", b.ref, day(b.created_at), b.service_name, b.city, b.first_date, "", (b.total_cents / 100).toFixed(2), b.status]),
    ...inbox.map((m) => ["Message", m.subject, day(m.created_at), "", "", "", "", "", m.status]),
  ];
  const slug = `${c.first_name}-${c.last_name}`.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || `client-${id}`;
  return csvResponse(csv(["type", "name / ref", "date", "detail 1", "detail 2", "detail 3", "items", "amount", "status / notes"], rows), `${slug}.csv`);
}
