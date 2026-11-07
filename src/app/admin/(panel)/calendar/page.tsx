import Link from "next/link";
import { requireUser, isManager } from "@/lib/auth";
import { bookingsBetween } from "@/lib/adminData";
import { PageHead, btnGhost } from "@/components/admin/ui";

export const metadata = { title: "Calendar" };
const pad = (n: number) => String(n).padStart(2, "0");

export default async function Calendar({ searchParams }: { searchParams: Promise<{ m?: string }> }) {
  const u = await requireUser(["owner", "admin", "staff"]);
  const sp = await searchParams;
  const now = new Date();
  const [y, m] = /^\d{4}-\d{2}$/.test(sp.m ?? "") ? sp.m!.split("-").map(Number) : [now.getFullYear(), now.getMonth() + 1];
  const first = new Date(Date.UTC(y, m - 1, 1));
  const next = new Date(Date.UTC(y, m, 1));
  const prev = new Date(Date.UTC(y, m - 2, 1));
  const key = (d: Date) => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}`;
  const rows = await bookingsBetween(`${key(first)}-01`, `${key(next)}-01`, isManager(u) ? undefined : u.id);
  const byDay = new Map<string, { id: number; label: string; time: string }[]>();
  for (const b of rows) for (const s of b.schedule) {
    if (!s.date.startsWith(key(first))) continue;
    const list = byDay.get(s.date) ?? [];
    list.push({ id: b.id, label: `${b.service_name.replace(/ (Photography|Videography)$/, (x) => (x.includes("Photo") ? " photo" : " video"))} · ${b.customer_name}`, time: s.start });
    byDay.set(s.date, list);
  }
  const lead = first.getUTCDay();
  const days = new Date(Date.UTC(y, m, 0)).getUTCDate();
  const cells = [...Array(lead).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)];
  const todayKey = now.toISOString().slice(0, 10);
  return (
    <>
      <PageHead title={first.toLocaleString("en-US", { month: "long", year: "numeric", timeZone: "UTC" })} sub={isManager(u) ? "All scheduled shoots." : "Your assigned shoots."}
        actions={<><Link className={btnGhost} href={`/admin/calendar?m=${key(prev)}`}>← Prev</Link><Link className={btnGhost} href="/admin/calendar">Today</Link><Link className={btnGhost} href={`/admin/calendar?m=${key(next)}`}>Next →</Link></>} />
      <div className="grid grid-cols-7 overflow-hidden rounded-lg border border-black/10 bg-white text-sm">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="border-b border-black/10 bg-black/[.03] px-2 py-2 text-xs font-semibold uppercase text-black/50">{d}</div>)}
        {cells.map((d, i) => {
          const k = d ? `${key(first)}-${pad(d)}` : "";
          const items: { id: number; label: string; time: string }[] = (d && byDay.get(k)) || [];
          return (
            <div key={i} className={`min-h-[110px] border-b border-r border-black/5 p-1.5 ${k === todayKey ? "bg-[#ccba56]/10" : ""}`}>
              {d && <p className={`mb-1 text-xs ${k === todayKey ? "font-bold text-[#8a7a2b]" : "text-black/50"}`}>{d}</p>}
              {items.sort((a, z) => a.time.localeCompare(z.time)).map((it, j) => (
                <Link key={j} href={`/admin/bookings/${it.id}`} className="mb-1 block truncate rounded bg-[#1d1d1d] px-1.5 py-1 text-[11px] text-white hover:bg-black" title={it.label}>{it.time} {it.label}</Link>
              ))}
            </div>
          );
        })}
      </div>
    </>
  );
}
