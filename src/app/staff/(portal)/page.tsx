import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { myNotifications, myOffers, myShoots, myPayouts } from "@/lib/staffData";
import { PageHead, Card, Empty, money, fmtDate, btnGhost } from "@/components/admin/ui";
import { markRead } from "./actions";

export const metadata = { title: "Home" };

export default async function StaffHome() {
  const u = await requireStaff();
  const [notes, offers, shoots, pays] = await Promise.all([myNotifications(u.id), myOffers(u.id), myShoots(u.id), myPayouts(u.id)]);
  const today = new Date().toISOString().slice(0, 10);
  const upcoming = shoots.flatMap((b) => b.schedule.filter((s) => s.date >= today).map((s) => ({ b, s }))).sort((a, z) => a.s.date.localeCompare(z.s.date));
  const open = offers.filter((o) => o.status === "open" && o.response === "pending");
  const year = new Date().getFullYear();
  const ytd = pays.filter((p) => new Date(p.paid_on).getFullYear() === year).reduce((a, p) => a + p.amount_cents, 0);
  const total = pays.reduce((a, p) => a + p.amount_cents, 0);
  const unread = notes.filter((n) => !n.read_at).length;
  return (
    <>
      <PageHead title={`Hi ${u.name.split(" ")[0]}`} sub="Your MacroSnaps staff portal." />
      <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {([["Available shoots", String(open.length), "/staff/offers"], ["Upcoming shoots", String(upcoming.length), "/staff/shoots"], [`Paid in ${year}`, money(ytd), "/staff/payments"], ["Paid to date", money(total), "/staff/payments"]] as const).map(([l, v, h]) => (
          <Link key={l} href={h} className="rounded-lg border border-black/10 bg-white p-4 shadow-sm hover:border-[#a8963b]"><p className="text-xs uppercase tracking-wider text-black/50">{l}</p><p className="mt-2 font-serif text-3xl">{v}</p></Link>
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Notifications" actions={unread > 0 && <form action={markRead}><button className={btnGhost}>Mark all read</button></form>}>
          {notes.length ? (
            <ul className="divide-y divide-black/5">
              {notes.map((n) => (
                <li key={n.id} className="py-2.5 text-sm">
                  <div className="flex items-start gap-2">{!n.read_at && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#ccba56]" aria-label="unread" />}<div>
                    {n.link ? <Link href={n.link} className="font-semibold hover:underline">{n.title}</Link> : <span className="font-semibold">{n.title}</span>}
                    {n.body && <p className="text-black/60">{n.body}</p>}<p className="text-xs text-black/40">{fmtDate(n.created_at, true)}</p></div></div>
                </li>
              ))}
            </ul>
          ) : <Empty>No notifications yet.</Empty>}
        </Card>
        <Card title="Next shoots" actions={<Link href="/staff/shoots" className="text-sm underline">All shoots</Link>}>
          {upcoming.length ? <ul className="divide-y divide-black/5">{upcoming.slice(0, 8).map(({ b, s }, i) => <li key={i} className="py-2.5 text-sm"><b>{fmtDate(`${s.date}T12:00:00`)}</b> · {s.start}–{s.end}<div>{b.service_name} · {b.city}</div></li>)}</ul> : <Empty>No upcoming shoots yet. Check Available shoots.</Empty>}
        </Card>
      </div>
    </>
  );
}
