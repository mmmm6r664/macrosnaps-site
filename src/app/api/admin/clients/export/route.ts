import { currentUser, isManager } from "@/lib/auth";
import { q } from "@/lib/db";
import { csv, csvResponse } from "@/lib/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const u = await currentUser();
  if (!u || !isManager(u)) return new Response("Unauthorized", { status: 401 });
  const rows = await q<Record<string, unknown>[]>`select c.first_name, c.last_name, c.email, c.phone, c.company, c.address, array_to_string(c.labels, ', ') as labels, c.source, c.created_at::date as since, c.last_activity_at::date as last_active,
      (select count(*) from orders o where o.client_id = c.id) as orders, (select coalesce(sum(paid_cents),0)/100.0 from orders o where o.client_id = c.id) as paid_usd, c.notes
    from clients c where not exists (select 1 from users u where lower(u.email) = c.email) order by c.last_activity_at desc nulls last`;
  const head = ["first_name", "last_name", "email", "phone", "company", "address", "labels", "source", "since", "last_active", "orders", "paid_usd", "notes"];
  return csvResponse(csv(head, rows.map((r) => head.map((h) => r[h] instanceof Date ? (r[h] as Date).toISOString().slice(0, 10) : r[h]))), "macrosnaps-clients.csv");
}
