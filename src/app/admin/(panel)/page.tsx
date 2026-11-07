import Link from "next/link";
import { requireUser, isManager } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookingsBetween, type Booking } from "@/lib/adminData";
import { PageHead, Card, Badge, Empty, money, fmtDate, Notice } from "@/components/admin/ui";
import { stripe } from "@/lib/stripe";

export const metadata = { title: "Dashboard" };
const ymd = (d: Date) => d.toISOString().slice(0, 10);

function Upcoming({ rows }: { rows: Booking[] }) {
  const days = rows.flatMap((b) => b.schedule.filter((s) => s.date >= ymd(new Date())).map((s) => ({ b, s }))).sort((a, z) => (a.s.date + a.s.start).localeCompare(z.s.date + z.s.start));
  if (!days.length) return <Empty>No shoots scheduled in the next 30 days.</Empty>;
  return (
    <ul className="divide-y divide-black/5">
      {days.slice(0, 15).map(({ b, s }, i) => (
        <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
          <span className="w-28 font-semibold">{fmtDate(`${s.date}T12:00:00`)}</span>
          <span className="flex-1"><Link href={`/admin/bookings/${b.id}`} className="underline-offset-2 hover:underline">{b.service_name} · {b.customer_name}</Link><span className="block text-xs text-black/50">{s.start}–{s.end} · {b.city}</span></span>
          <Badge status={b.status} />
        </li>
      ))}
    </ul>
  );
}

export default async function Dashboard() {
  const u = await requireUser(["owner", "admin", "staff"]);
  const today = new Date();
  const in30 = new Date(Date.now() + 30 * 864e5);
  if (!isManager(u)) {
    const mine = await bookingsBetween(ymd(today), ymd(in30), u.id);
    return (<><PageHead title={`Hi ${u.name.split(" ")[0]}`} sub="Your shoots for the next 30 days." /><Card><Upcoming rows={mine} /></Card></>);
  }
  const sql = await db();
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const [stats] = await sql<{ newb: number; revenue: number; inq: number; subs: number; requested: number }[]>`
    select
      (select count(*)::int from bookings where created_at > now() - interval '7 days') as newb,
      (select coalesce(sum(total_cents - amount_refunded_cents), 0)::int from bookings where status in ('paid','confirmed','completed','partially_refunded') and created_at >= ${monthStart}) as revenue,
      (select count(*)::int from inquiries where status = 'new') as inq,
      (select count(*)::int from subscribers where status = 'subscribed') as subs,
      (select count(*)::int from bookings where status = 'requested') as requested`;
  const upcoming = await bookingsBetween(ymd(today), ymd(in30));
  const tiles: [string, string, string][] = [
    ["Bookings, last 7 days", String(stats.newb), "/admin/bookings"],
    ["Revenue this month", money(stats.revenue), "/admin/payments"],
    ["Unpaid booking requests", String(stats.requested), "/admin/bookings?status=requested"],
    ["New messages & applications", String(stats.inq), "/admin/inbox"],
    ["Newsletter subscribers", String(stats.subs), "/admin/subscribers"],
  ];
  return (
    <>
      <PageHead title="Dashboard" sub={`Welcome back, ${u.name.split(" ")[0]}.`} />
      {!stripe && <Notice>Stripe isn&apos;t connected yet, so customers can only send booking requests, and payments, refunds and invoices are off. Add STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET in Vercel.</Notice>}
      {!process.env.RESEND_API_KEY && <Notice>Email isn&apos;t connected yet, so booking emails and newsletters can&apos;t be sent. Add RESEND_API_KEY in Vercel.</Notice>}
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {tiles.map(([label, value, href]) => (
          <Link key={label} href={href} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm transition hover:border-[#a8963b]">
            <p className="text-xs uppercase tracking-wider text-black/50">{label}</p>
            <p className="mt-2 font-serif text-3xl">{value}</p>
          </Link>
        ))}
      </div>
      <Card title="Upcoming shoots (30 days)" actions={<Link href="/admin/calendar" className="text-sm underline">Calendar</Link>}><Upcoming rows={upcoming} /></Card>
    </>
  );
}
