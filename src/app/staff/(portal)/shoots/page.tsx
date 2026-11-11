import { requireStaff } from "@/lib/auth";
import { myShoots, myAssignments, type Assigned } from "@/lib/staffData";
import { PageHead, Empty, fmtDate } from "@/components/admin/ui";

export const metadata = { title: "My shoots" };

export default async function Shoots() {
  const u = await requireStaff();
  const [shoots, assigned] = await Promise.all([myShoots(u.id), myAssignments(u.id, u.email)]);
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
  const aUp = assigned.filter((a) => !a.shoot_date || a.shoot_date >= today).reverse(), aPast = assigned.filter((a) => a.shoot_date && a.shoot_date < today);
  const AList = ({ rows }: { rows: Assigned[] }) => (
    <div className="mb-3 space-y-3">
      {rows.map((a) => (
        <div key={`a${a.id}`} className="rounded-lg border border-black/10 bg-white p-5 text-sm">
          <h3 className="font-serif text-xl">{a.type}</h3>
          <p className="text-black/60">{a.dates}{a.city ? ` · ${a.city}` : ""}</p>
          <ul className="mt-2">{a.sessions.map((s, i) => <li key={i}><b>{s.day}</b>{s.time ? ` ${s.time}` : ""}</li>)}</ul>
          <p className="mt-2 whitespace-pre-line"><span className="text-black/50">Location:</span> {a.location}</p>
          <p><span className="text-black/50">Compensation:</span> {a.pay}</p>
          {a.scope.length > 0 && (
            <details className="mt-2"><summary className="cursor-pointer text-black/60">Scope of work</summary>
              <ul className="mt-1 list-disc pl-5">{a.scope.map((x, i) => <li key={i}>{x}</li>)}</ul></details>
          )}
          {a.delivered && <p className="mt-2 text-emerald-700">Files delivered. Thank you!</p>}
        </div>
      ))}
    </div>
  );
  return (
    <>
      <PageHead title="My shoots" sub="Shoots you're confirmed for. Upload your files under Upload photos after each one." />
      <h2 className="mb-3 font-serif text-2xl">Upcoming</h2>
      {aUp.length > 0 && <AList rows={aUp} />}
      {up.length ? <List rows={up} /> : !aUp.length && <Empty>No upcoming shoots.</Empty>}
      <h2 className="mb-3 mt-8 font-serif text-2xl">Past</h2>
      {aPast.length > 0 && <AList rows={aPast} />}
      {past.length ? <List rows={past} /> : !aPast.length && <Empty>No past shoots yet.</Empty>}
    </>
  );
}
