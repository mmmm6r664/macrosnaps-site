import { requireStaff } from "@/lib/auth";
import { myShoots } from "@/lib/staffData";
import { PageHead, Empty, fmtDate } from "@/components/admin/ui";

export const metadata = { title: "My shoots" };

export default async function Shoots() {
  const u = await requireStaff();
  const shoots = await myShoots(u.id);
  const today = new Date().toISOString().slice(0, 10);
  const isUpcoming = (b: (typeof shoots)[number]) => b.schedule.some((s) => s.date >= today);
  const List = ({ rows }: { rows: typeof shoots }) => (
    <div className="space-y-3">
      {rows.map((b) => (
        <div key={b.id} className="rounded-lg border border-black/10 bg-white p-5 text-sm">
          <h3 className="font-serif text-xl">{b.service_name}{b.addon ? ` + ${b.addon}` : ""}</h3>
          <p className="text-black/60">{b.ref} · {b.city}</p>
          <ul className="mt-2">{b.schedule.map((s, i) => <li key={i}><b>{fmtDate(`${s.date}T12:00:00`)}</b> {s.start}–{s.end}{s.venue ? ` · ${s.venue}` : ""}</li>)}</ul>
          <p className="mt-2"><span className="text-black/50">Address:</span> {b.venue_address}</p>
          <p><span className="text-black/50">Client:</span> {b.customer_name}{b.phone ? ` · ${b.phone}` : ""}</p>
        </div>
      ))}
    </div>
  );
  const up = shoots.filter(isUpcoming).reverse(), past = shoots.filter((b) => !isUpcoming(b));
  return (
    <>
      <PageHead title="My shoots" sub="Shoots you're confirmed for. Upload your files under Upload photos after each one." />
      <h2 className="mb-3 font-serif text-2xl">Upcoming</h2>
      {up.length ? <List rows={up} /> : <Empty>No upcoming shoots.</Empty>}
      <h2 className="mb-3 mt-8 font-serif text-2xl">Past</h2>
      {past.length ? <List rows={past} /> : <Empty>No past shoots yet.</Empty>}
    </>
  );
}
