import { currentUser, isManager } from "@/lib/auth";
import { q } from "@/lib/db";
import { csv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u || !isManager(u)) return new Response("Unauthorized", { status: 401 });
  const rows = await q<{ number: string | null; created_at: Date; name: string; email: string | null; phone: string | null; company: string | null; event: string | null; location: string | null; event_date: string | null; items: { name: string; qty: number }[]; total_cents: number; paid_cents: number; balance_cents: number; payment_status: string | null; channel: string | null; notes: string | null }[]>`
    select number, created_at, name, email, phone, company, event, location, event_date, items, total_cents, paid_cents, balance_cents, payment_status, channel, notes from orders order by created_at desc`;
  return csvResponse(csv(["order", "date", "client", "email", "phone", "company", "event", "location", "event_date", "items", "total", "paid", "balance", "payment", "channel", "notes"],
    rows.map((o) => [o.number, o.created_at.toISOString().slice(0, 10), o.name, o.email, o.phone, o.company, o.event, o.location, o.event_date, o.items.map((i) => `${i.name}${i.qty > 1 ? ` x${i.qty}` : ""}`).join("; "), (o.total_cents / 100).toFixed(2), (o.paid_cents / 100).toFixed(2), (o.balance_cents / 100).toFixed(2), o.payment_status, o.channel, o.notes])),
    "macrosnaps-past-orders.csv");
}
