import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listBookings, BOOKING_STATUSES } from "@/lib/adminData";
import { PageHead, Table, Badge, Empty, Pager, money, fmtDate, inputCls, btnGhost, btnGold } from "@/components/admin/ui";

export const metadata = { title: "Bookings" };

export default async function Bookings({ searchParams }: { searchParams: Promise<{ status?: string; q?: string; page?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const status = (BOOKING_STATUSES as readonly string[]).includes(sp.status ?? "") ? sp.status : undefined;
  const q = (sp.q ?? "").slice(0, 80);
  const { rows, more, page } = await listBookings({ status, q, page: Number(sp.page) || 1 });
  const base = `/admin/bookings?${new URLSearchParams({ ...(status ? { status } : {}), ...(q ? { q } : {}) })}`;
  return (
    <>
      <PageHead title="Bookings" sub="Every booking made on the website, newest first." actions={<Link href="/admin/invoices/new" className={btnGold}>New invoice</Link>} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, email, ref, city…" className={`${inputCls} max-w-xs`} />
        <select name="status" defaultValue={status ?? ""} className={`${inputCls} max-w-[200px]`}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <button className={btnGhost}>Filter</button>
      </form>
      {rows.length ? (
        <Table head={["Ref", "Customer", "Service", "First date", "City", "Total", "Status", "Booked"]}>
          {rows.map((b) => (
            <tr key={b.id} className="hover:bg-black/[.02]">
              <td className="px-4 py-3"><Link href={`/admin/bookings/${b.id}`} className="font-semibold underline-offset-2 hover:underline">{b.ref}</Link></td>
              <td className="px-4 py-3">{b.customer_name}<div className="text-xs text-black/50">{b.email}</div></td>
              <td className="px-4 py-3">{b.service_name}{b.addon && <div className="text-xs text-black/50">+ {b.addon}</div>}</td>
              <td className="whitespace-nowrap px-4 py-3">{fmtDate(b.first_date)}{b.schedule.length > 1 && <div className="text-xs text-black/50">{b.schedule.length} days</div>}</td>
              <td className="px-4 py-3">{b.city}</td>
              <td className="whitespace-nowrap px-4 py-3">{money(b.total_cents)}</td>
              <td className="px-4 py-3"><Badge status={b.status} /></td>
              <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(b.created_at)}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No bookings{status || q ? " match this filter" : " yet"}.</Empty>}
      <Pager base={base} page={page} more={more} />
    </>
  );
}
