import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { PageHead, Card, Table, money, Notice } from "@/components/admin/ui";

export const metadata = { title: "Analytics" };
export const dynamic = "force-dynamic";

const RANGES = [["today", "Today"], ["yesterday", "Yesterday"], ["7d", "Last 7 days"], ["30d", "Last 30 days"], ["90d", "Last 90 days"], ["ytd", "This year"], ["lastyear", "Last year"], ["12m", "Last 12 months"]] as const;
type R = (typeof RANGES)[number][0];

/** Range boundaries in New York time, plus the same-length period before it for comparison. */
function bounds(r: R) {
  const tz = "America/New_York";
  const nyNow = new Date(new Date().toLocaleString("en-US", { timeZone: tz }));
  const offset = Date.now() - nyNow.getTime(); // NY wall clock -> UTC
  const day0 = new Date(nyNow); day0.setHours(0, 0, 0, 0);
  const at = (d: Date) => new Date(d.getTime() + offset);
  const days = (n: number) => { const d = new Date(day0); d.setDate(d.getDate() - n); return d; };
  let from: Date, to: Date;
  switch (r) {
    case "today": from = day0; to = days(-1); break;
    case "yesterday": from = days(1); to = day0; break;
    case "7d": from = days(6); to = days(-1); break;
    case "30d": from = days(29); to = days(-1); break;
    case "90d": from = days(89); to = days(-1); break;
    case "ytd": from = new Date(day0.getFullYear(), 0, 1); to = days(-1); break;
    case "lastyear": from = new Date(day0.getFullYear() - 1, 0, 1); to = new Date(day0.getFullYear(), 0, 1); break;
    default: from = days(364); to = days(-1);
  }
  const len = to.getTime() - from.getTime();
  return { from: at(from), to: at(to), pFrom: at(new Date(from.getTime() - len)), pTo: at(from), byDay: len > 2 * 86400000 };
}

const fmtDur = (ms: number) => { const s = Math.round(ms / 1000); return s < 60 ? `${s}s` : `${Math.floor(s / 60)}m ${s % 60}s`; };
const delta = (a: number, b: number) => (b ? Math.round(((a - b) / b) * 100) : a ? 100 : 0);

async function sales(from: Date, to: Date) {
  const [b] = await q<{ n: number; v: number; paid: number; pv: number }[]>`select count(*)::int as n, coalesce(sum(total_cents),0)::bigint::int as v,
      count(*) filter (where status in ('paid','confirmed','completed','partially_refunded'))::int as paid,
      coalesce(sum(total_cents) filter (where status in ('paid','confirmed','completed','partially_refunded')),0)::bigint::int as pv
    from bookings where created_at >= ${from} and created_at < ${to}`;
  const [o] = await q<{ n: number; v: number }[]>`select count(*)::int as n, coalesce(sum(paid_cents),0)::bigint::int as v from orders where created_at >= ${from} and created_at < ${to}`;
  let inv = { n: 0, v: 0 };
  if (stripe) {
    try {
      const list = await stripe.invoices.list({ status: "paid", created: { gte: Math.floor(from.getTime() / 1000), lt: Math.floor(to.getTime() / 1000) }, limit: 100 });
      inv = { n: list.data.length, v: list.data.reduce((a, i) => a + i.amount_paid, 0) };
    } catch (e) { console.error(e); }
  }
  return { bookings: b, orders: o, invoices: inv, revenue: b.pv + o.v + inv.v, count: b.paid + o.n + inv.n };
}

export default async function AnalyticsPage({ searchParams }: { searchParams: Promise<{ r?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const r = (RANGES.find(([k]) => k === sp.r)?.[0] ?? "30d") as R;
  const { from, to, pFrom, pTo, byDay } = bounds(r);

  const kpi = (a: Date, b: Date) => q<{ visitors: number; sessions: number; views: number; avg: number; bounce: number }[]>`
    with s as (select sid, count(*) as pages, sum(duration_ms) as ms from site_visits where created_at >= ${a} and created_at < ${b} group by sid)
    select (select count(distinct vid) from site_visits where created_at >= ${a} and created_at < ${b})::int as visitors,
      count(*)::int as sessions, coalesce(sum(pages),0)::int as views, coalesce(avg(ms),0)::int as avg,
      coalesce(round(100.0 * count(*) filter (where pages = 1) / nullif(count(*),0)),0)::int as bounce from s`;
  const [[cur], [prev], sources, mediums, pages, places, devices, series, s1, s0, firstVisit] = await Promise.all([
    kpi(from, to), kpi(pFrom, pTo),
    q<{ source: string; medium: string; visitors: number; sessions: number; avg: number }[]>`
      with s as (select sid, min(source) as source, min(medium) as medium, max(vid) as vid, sum(duration_ms) as ms from site_visits where created_at >= ${from} and created_at < ${to} group by sid)
      select source, medium, count(distinct vid)::int as visitors, count(*)::int as sessions, avg(ms)::int as avg from s group by 1, 2 order by sessions desc limit 25`,
    q<{ medium: string; sessions: number }[]>`select medium, count(distinct sid)::int as sessions from site_visits where created_at >= ${from} and created_at < ${to} group by 1 order by 2 desc`,
    q<{ path: string; views: number; visitors: number; avg: number }[]>`select path, count(*)::int as views, count(distinct vid)::int as visitors, avg(duration_ms)::int as avg from site_visits where created_at >= ${from} and created_at < ${to} group by 1 order by 2 desc limit 25`,
    q<{ place: string; visitors: number }[]>`select concat_ws(', ', nullif(city,''), nullif(region,''), country) as place, count(distinct vid)::int as visitors from site_visits where created_at >= ${from} and created_at < ${to} group by 1 order by 2 desc limit 15`,
    q<{ device: string; visitors: number }[]>`select device, count(distinct vid)::int as visitors from site_visits where created_at >= ${from} and created_at < ${to} group by 1 order by 2 desc`,
    byDay
      ? q<{ bucket: string; visitors: number }[]>`select to_char(d, 'Mon DD') as bucket, n as visitors from (select date_trunc('day', created_at at time zone 'America/New_York') as d, count(distinct vid)::int as n from site_visits where created_at >= ${from} and created_at < ${to} group by 1) x order by d`
      : q<{ bucket: string; visitors: number }[]>`select to_char(d, 'HH12am') as bucket, n as visitors from (select date_trunc('hour', created_at at time zone 'America/New_York') as d, count(distinct vid)::int as n from site_visits where created_at >= ${from} and created_at < ${to} group by 1) x order by d`,
    sales(from, to), sales(pFrom, pTo),
    q<{ d: Date | null }[]>`select min(created_at) as d from site_visits`,
  ]);
  const max = Math.max(1, ...series.map((x) => x.visitors));
  const totalMed = mediums.reduce((a, m) => a + m.sessions, 0) || 1;
  const MED: Record<string, string> = { organic: "Search (Google, Bing…)", social: "Social media", direct: "Direct / typed in", referral: "Other websites", paid: "Paid ads", email: "Email", ai: "AI assistants (ChatGPT…)" };
  const Stat = ({ k, v, d }: { k: string; v: string | number; d?: number }) => (
    <div className="rounded-lg border border-black/10 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-black/50">{k}</p><p className="mt-1 text-2xl font-semibold">{v}</p>
      {d !== undefined ? <p className={`text-xs ${d >= 0 ? "text-emerald-700" : "text-red-700"}`}>{d >= 0 ? "▲" : "▼"} {Math.abs(d)}% vs previous period</p> : null}</div>
  );
  return (
    <>
      <PageHead title="Analytics" sub="Website visitors, where they came from, and sales." />
      <div className="mb-6 flex flex-wrap gap-2">
        {RANGES.map(([k, l]) => <Link key={k} href={`/admin/analytics?r=${k}`} className={`rounded-full border px-3 py-1.5 text-sm ${k === r ? "border-black bg-black text-white" : "border-black/15 bg-white hover:border-black/40"}`}>{l}</Link>)}
      </div>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-black/55">Sales</h2>
      <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat k="Revenue" v={money(s1.revenue)} d={delta(s1.revenue, s0.revenue)} />
        <Stat k="Paid orders" v={s1.count} d={delta(s1.count, s0.count)} />
        <Stat k="Average order" v={s1.count ? money(Math.round(s1.revenue / s1.count)) : "—"} />
        <Stat k="Booking requests" v={s1.bookings.n} d={delta(s1.bookings.n, s0.bookings.n)} />
      </div>
      <p className="-mt-6 mb-8 text-xs text-black/50">Revenue = paid online bookings ({money(s1.bookings.pv)}) + paid Stripe invoices ({money(s1.invoices.v)}, {s1.invoices.n}) + past Wix orders ({money(s1.orders.v)}, {s1.orders.n}).</p>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-black/55">Website</h2>
      {firstVisit[0]?.d && new Date(firstVisit[0].d) > from ? <Notice>Visitor tracking started {new Date(firstVisit[0].d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}; earlier visits aren&apos;t counted here (Google Analytics has the older history).</Notice> : null}
      <div className="mb-6 grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat k="Visitors" v={cur.visitors} d={delta(cur.visitors, prev.visitors)} />
        <Stat k="Visits" v={cur.sessions} d={delta(cur.sessions, prev.sessions)} />
        <Stat k="Page views" v={cur.views} d={delta(cur.views, prev.views)} />
        <Stat k="Avg. time on site" v={fmtDur(cur.avg)} d={delta(cur.avg, prev.avg)} />
        <Stat k="Bounce rate" v={`${cur.bounce}%`} />
      </div>

      <Card title="Visitors over time" className="mb-6">
        {series.length ? (
          <div className="flex h-40 items-end gap-[2px] overflow-x-auto">
            {series.map((x) => <div key={x.bucket} className="group relative flex min-w-[8px] flex-1 flex-col items-center justify-end"><div className="w-full rounded-t bg-[#ccba56]" style={{ height: `${(x.visitors / max) * 100}%` }} title={`${x.bucket}: ${x.visitors}`} /></div>)}
          </div>
        ) : <p className="text-sm text-black/50">No visits in this period yet.</p>}
        {series.length ? <div className="mt-1 flex justify-between text-[10px] text-black/45"><span>{series[0].bucket}</span><span>{series[series.length - 1].bucket}</span></div> : null}
      </Card>

      <div className="mb-6 grid gap-6 lg:grid-cols-2 [&>*]:min-w-0">
        <Card title="How people found you">
          {mediums.map((m) => (
            <div key={m.medium} className="mb-2">
              <div className="flex justify-between text-sm"><span>{MED[m.medium] ?? m.medium}</span><span>{m.sessions} · {Math.round((m.sessions / totalMed) * 100)}%</span></div>
              <div className="h-2 rounded bg-black/5"><div className="h-2 rounded bg-[#ccba56]" style={{ width: `${(m.sessions / totalMed) * 100}%` }} /></div>
            </div>
          ))}
          {!mediums.length && <p className="text-sm text-black/50">No data yet.</p>}
        </Card>
        <Card title="Devices and places">
          <p className="mb-2 text-sm">{devices.map((d) => `${d.device} ${d.visitors}`).join(" · ") || "—"}</p>
          <Table head={["Location", "Visitors"]}>{places.map((p) => <tr key={p.place}><td className="px-4 py-2">{p.place || "Unknown"}</td><td className="px-4 py-2">{p.visitors}</td></tr>)}</Table>
        </Card>
      </div>

      <Card title="Sources" className="mb-6">
        <Table head={["Source", "Type", "Visitors", "Visits", "Avg. time"]}>
          {sources.map((x) => <tr key={`${x.source}${x.medium}`}><td className="px-4 py-2">{x.source}</td><td className="px-4 py-2 text-black/60">{MED[x.medium] ?? x.medium}</td><td className="px-4 py-2">{x.visitors}</td><td className="px-4 py-2">{x.sessions}</td><td className="px-4 py-2">{fmtDur(x.avg)}</td></tr>)}
        </Table>
      </Card>
      <Card title="Top pages">
        <Table head={["Page", "Views", "Visitors", "Avg. time"]}>
          {pages.map((x) => <tr key={x.path}><td className="max-w-md break-all px-4 py-2"><a className="underline" href={x.path} target="_blank" rel="noreferrer">{x.path}</a></td><td className="px-4 py-2">{x.views}</td><td className="px-4 py-2">{x.visitors}</td><td className="px-4 py-2">{fmtDur(x.avg)}</td></tr>)}
        </Table>
      </Card>
    </>
  );
}
