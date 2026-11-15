import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Table, Empty, Pager, fmtDate, money, inputCls, btnGhost } from "@/components/admin/ui";

export const metadata = { title: "Clients" };
const SIZE = 50;

type Row = { id: number; name: string; email: string | null; phone: string | null; company: string | null; source: string | null; created_at: Date; last_activity_at: Date | null; orders: number; paid_cents: number; bookings: number };

export default async function Clients({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; sort?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);
  const sort = sp.sort === "spent" ? "spent" : sp.sort === "name" ? "name" : "recent";
  const sql = await db();
  const like = q ? `%${q.replace(/[%_]/g, "")}%` : null;
  const order = sort === "spent" ? sql`paid_cents desc, c.id desc` : sort === "name" ? sql`lower(c.first_name), lower(c.last_name)` : sql`coalesce(c.last_activity_at, c.created_at) desc, c.id desc`;
  const rows = await sql<Row[]>`
    select * from (
      select c.id, trim(c.first_name || ' ' || c.last_name) as name, c.email, c.phone, c.company, c.source, c.created_at, c.last_activity_at, c.first_name, c.last_name,
        (select count(*)::int from orders o where o.client_id = c.id) as orders,
        (select coalesce(sum(o.paid_cents), 0)::int from orders o where o.client_id = c.id) as paid_cents,
        (select count(*)::int from bookings b where c.email is not null and lower(b.email) = c.email) as bookings
      from clients c
      where not exists (select 1 from users u where lower(u.email) = c.email or c.email = any(u.alt_emails)) and c.email !~ '@(macrohype|macrosnaps)\\.com$' and c.email !~ '^(rehmansiddiq|macrohype)@'
      ${like ? sql`and (c.first_name || ' ' || c.last_name ilike ${like} or c.email ilike ${like} or c.phone ilike ${like} or c.company ilike ${like})` : sql``}
    ) c order by ${order} limit ${SIZE + 1} offset ${(page - 1) * SIZE}`;
  const [t] = await sql<{ n: number; wix: number; spent: number }[]>`select count(*)::int as n, count(*) filter (where source = 'Wix')::int as wix, (select coalesce(sum(paid_cents),0)::int from orders) as spent from clients c where not exists (select 1 from users u where lower(u.email) = c.email or c.email = any(u.alt_emails)) and c.email !~ '@(macrohype|macrosnaps)\\.com$' and c.email !~ '^(rehmansiddiq|macrohype)@'`;
  const base = `/admin/clients?${new URLSearchParams({ ...(q ? { q } : {}), ...(sort !== "recent" ? { sort } : {}) })}`;
  return (
    <>
      <PageHead actions={<form action="/api/admin/clients/export" method="get"><button className={btnGhost}>Export CSV</button></form>} title="Clients" sub={`${t.n.toLocaleString()} contacts (${t.wix.toLocaleString()} from Wix) · ${money(t.spent)} paid on past orders. Team members are not listed here.`} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone or company" className={`${inputCls} max-w-xs`} />
        <select name="sort" defaultValue={sort} className={`${inputCls} w-auto`}><option value="recent">Recent activity</option><option value="spent">Most spent</option><option value="name">Name</option></select>
        <button className={btnGhost}>Search</button>
      </form>
      {rows.length ? (
        <Table head={["Name", "Email", "Phone", "Orders", "Paid", "Bookings", "Last activity", "Source"]}>
          {rows.slice(0, SIZE).map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3"><Link href={`/admin/clients/${r.id}`} className="font-medium underline-offset-2 hover:underline">{r.name || r.company || r.email || "—"}</Link>{r.company && r.name ? <div className="text-xs text-black/50">{r.company}</div> : null}</td>
              <td className="break-all px-4 py-3">{r.email ?? "—"}</td>
              <td className="whitespace-nowrap px-4 py-3">{r.phone ?? "—"}</td>
              <td className="px-4 py-3">{r.orders || "—"}</td>
              <td className="px-4 py-3">{r.paid_cents ? money(r.paid_cents) : "—"}</td>
              <td className="px-4 py-3">{r.bookings || "—"}</td>
              <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(r.last_activity_at ?? r.created_at)}</td>
              <td className="px-4 py-3 text-black/60">{r.source ?? "Portal"}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No clients yet.</Empty>}
      <Pager base={base} page={page} more={rows.length > SIZE} />
    </>
  );
}
