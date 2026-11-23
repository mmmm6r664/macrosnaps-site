import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { listBookings, BOOKING_STATUSES, type Booking } from "@/lib/adminData";
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
      <PageHead title="Bookings" sub="Every booking (website and paid invoices), newest first." actions={<Link href="/admin/invoices/new" className={btnGold}>New invoice</Link>} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input name="q" defaultValue={q} placeholder="Search name, email, phone, ref, city…" className={`${inputCls} max-w-xs`} />
        <select name="status" defaultValue={status ?? ""} className={`${inputCls} max-w-[200px]`}>
          <option value="">All statuses</option>
          {BOOKING_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
        <button className={btnGhost}>Filter</button>
      </form>
      {rows.length ? (
        <>
          {/* Phone: one card per booking with every detail. */}
          <div className="space-y-3 md:hidden">
            {rows.map((b) => (
              <Link key={b.id} href={`/admin/bookings/${b.id}`} className="block rounded-lg border border-black/10 bg-white p-4 hover:bg-black/[.02]">
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{b.customer_name}{b.company && <span className="font-normal text-black/50"> · {b.company}</span>}</div>
                  <Badge status={b.status} />
                </div>
                <div className="mt-1 text-sm">{b.service_name}{b.addon && ` + ${b.addon}`} · <span className="font-semibold">{money(b.total_cents)}</span></div>
                <When b={b} />
                {(b.venue_address || b.city) && <div className="mt-1 text-sm">📍 {b.venue_address || b.city}</div>}
                <Contact b={b} />
                {b.notes && <div className="mt-2 rounded bg-black/[.03] p-2 text-sm whitespace-pre-wrap">{b.notes}</div>}
                <div className="mt-2 text-xs text-black/45">{b.ref} · booked {fmtDate(b.created_at)}</div>
              </Link>
            ))}
          </div>
          <div className="hidden md:block">
            <Table head={["Ref", "Customer", "Event", "Location", "Notes", "Total", "Status"]}>
              {rows.map((b) => (
                <tr key={b.id} className="align-top hover:bg-black/[.02]">
                  <td className="px-4 py-3"><Link href={`/admin/bookings/${b.id}`} className="font-semibold underline-offset-2 hover:underline">{b.ref}</Link><div className="text-xs text-black/45">booked {fmtDate(b.created_at)}</div></td>
                  <td className="px-4 py-3">{b.customer_name}{b.company && <div className="text-xs text-black/50">{b.company}</div>}<Contact b={b} /></td>
                  <td className="px-4 py-3">{b.service_name}{b.addon && <div className="text-xs text-black/50">+ {b.addon}</div>}<When b={b} /></td>
                  <td className="max-w-[220px] px-4 py-3">{b.venue_address || b.city || "—"}{b.venue_address && b.city && !b.venue_address.includes(b.city.split(",")[0]) && <div className="text-xs text-black/50">{b.city}</div>}</td>
                  <td className="max-w-[260px] px-4 py-3 text-xs text-black/70 whitespace-pre-wrap">{b.notes || "—"}</td>
                  <td className="whitespace-nowrap px-4 py-3">{money(b.total_cents)}</td>
                  <td className="px-4 py-3"><Badge status={b.status} /></td>
                </tr>
              ))}
            </Table>
          </div>
        </>
      ) : <Empty>No bookings{status || q ? " match this filter" : " yet"}.</Empty>}
      <Pager base={base} page={page} more={more} />
    </>
  );
}

const t12 = (t: string) => {
  const m = t.match(/^(\d{1,2}):(\d{2})$/);
  if (!m) return t;
  const h = Number(m[1]);
  return `${h % 12 || 12}:${m[2]} ${h < 12 ? "AM" : "PM"}`;
};

/** Each shoot day with its time, e.g. "Nov 27, 2026 · 1:30 PM – 3:30 PM". */
function When({ b }: { b: Booking }) {
  const days = b.schedule.length ? b.schedule : [{ date: "", start: "", end: "" }];
  return (
    <div className="mt-1 text-sm">
      {days.map((s, i) => (
        <div key={i} className="whitespace-nowrap">🗓 {fmtDate(s.date || b.first_date)}{s.start && ` · ${t12(s.start)}${s.end ? ` – ${t12(s.end)}` : ""}`}</div>
      ))}
    </div>
  );
}

function Contact({ b }: { b: Booking }) {
  return (
    <div className="mt-1 space-y-0.5 text-xs">
      {b.phone ? <div>📞 <span className="text-black/80">{b.phone}</span></div> : <div className="text-black/40">📞 no phone</div>}
      <div className="break-all text-black/55">✉ {b.email}</div>
    </div>
  );
}
