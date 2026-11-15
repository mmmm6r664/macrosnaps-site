import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Table, Badge, Empty, Pager, fmtDate, money, inputCls, btnGhost } from "@/components/admin/ui";

export const metadata = { title: "Past orders" };
const SIZE = 50;

type Row = { id: number; number: string | null; client_id: number | null; name: string; email: string | null; created_at: Date; payment_status: string | null; fulfillment_status: string | null; total_cents: number; paid_cents: number; balance_cents: number; items: { name: string; qty: number }[]; channel: string | null; source: string };

export default async function Orders({ searchParams }: { searchParams: Promise<{ q?: string; page?: string; pay?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const pay = (sp.pay ?? "").replace(/[^A-Z_]/g, "").slice(0, 30);
  const page = Math.max(1, Number(sp.page) || 1);
  const sql = await db();
  const like = q ? `%${q.replace(/[%_]/g, "")}%` : null;
  const rows = await sql<Row[]>`
    select id, number, client_id, name, email, created_at, payment_status, fulfillment_status, total_cents, paid_cents, balance_cents, items, channel, source from orders
    where (${pay || null}::text is null or payment_status = ${pay}) and (${like}::text is null or name ilike ${like} or email ilike ${like} or number ilike ${like} or items::text ilike ${like})
    order by created_at desc limit ${SIZE + 1} offset ${(page - 1) * SIZE}`;
  const [t] = await sql<{ n: number; paid: number; owed: number; first: Date | null }[]>`select count(*)::int as n, coalesce(sum(paid_cents),0)::int as paid, coalesce(sum(greatest(balance_cents,0)),0)::int as owed, min(created_at) as first from orders`;
  const statuses = await sql<{ payment_status: string; n: number }[]>`select payment_status, count(*)::int as n from orders where payment_status is not null group by 1 order by 2 desc`;
  const base = `/admin/orders?${new URLSearchParams({ ...(q ? { q } : {}), ...(pay ? { pay } : {}) })}`;
  return (
    <>
      <PageHead title="Past orders" sub={`${t.n.toLocaleString()} orders from the old Wix site${t.first ? ` since ${fmtDate(t.first)}` : ""} · ${money(t.paid)} paid${t.owed ? ` · ${money(t.owed)} still unpaid` : ""}. New work is under Bookings and Invoices.`} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, email, order # or item" className={`${inputCls} max-w-xs`} />
        <select name="pay" defaultValue={pay} className={`${inputCls} w-auto`}><option value="">All payments</option>{statuses.map((s) => <option key={s.payment_status} value={s.payment_status}>{s.payment_status.replace(/_/g, " ").toLowerCase()} ({s.n})</option>)}</select>
        <button className={btnGhost}>Search</button>
      </form>
      {rows.length ? (
        <Table head={["Order", "Date", "Client", "Items", "Total", "Paid", "Payment", "Fulfillment"]}>
          {rows.slice(0, SIZE).map((r) => (
            <tr key={r.id}>
              <td className="whitespace-nowrap px-4 py-3">#{r.number ?? r.id}{r.channel === "WIX_INVOICES" ? <div className="text-xs text-black/50">Invoice</div> : null}</td>
              <td className="whitespace-nowrap px-4 py-3">{fmtDate(r.created_at)}</td>
              <td className="px-4 py-3">{r.client_id ? <Link className="underline-offset-2 hover:underline" href={`/admin/clients/${r.client_id}`}>{r.name || r.email}</Link> : r.name || r.email || "—"}{r.name && r.email ? <div className="break-all text-xs text-black/50">{r.email}</div> : null}</td>
              <td className="px-4 py-3">{r.items.map((i) => `${i.name}${i.qty > 1 ? ` × ${i.qty}` : ""}`).join(", ") || "—"}</td>
              <td className="px-4 py-3">{money(r.total_cents)}</td>
              <td className="px-4 py-3">{money(r.paid_cents)}</td>
              <td className="px-4 py-3"><Badge status={(r.payment_status ?? "").toLowerCase()} /></td>
              <td className="px-4 py-3"><Badge status={(r.fulfillment_status ?? "").toLowerCase()} /></td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No past orders imported yet.</Empty>}
      <Pager base={base} page={page} more={rows.length > SIZE} />
    </>
  );
}
