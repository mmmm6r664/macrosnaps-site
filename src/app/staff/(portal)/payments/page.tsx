import { requireStaff } from "@/lib/auth";
import { myPayouts } from "@/lib/staffData";
import { PageHead, Table, Empty, money, fmtDate } from "@/components/admin/ui";

export const metadata = { title: "Payments" };

export default async function Payments() {
  const u = await requireStaff();
  const pays = await myPayouts(u.id);
  const byYear = new Map<number, number>();
  for (const p of pays) { const y = new Date(p.paid_on).getFullYear(); byYear.set(y, (byYear.get(y) ?? 0) + p.amount_cents); }
  const total = pays.reduce((a, p) => a + p.amount_cents, 0);
  return (
    <>
      <PageHead title="Payments" sub={`Total paid to date: ${money(total)}`} />
      <div className="mb-6 flex flex-wrap gap-4">{[...byYear].map(([y, c]) => <div key={y} className="rounded-lg border border-black/10 bg-white px-5 py-4"><p className="text-xs uppercase tracking-wider text-black/50">{y}</p><p className="font-serif text-2xl">{money(c)}</p></div>)}</div>
      {pays.length ? <Table head={["Date", "Amount", "Method", "For"]}>{pays.map((p) => <tr key={p.id}><td className="px-4 py-3">{fmtDate(p.paid_on)}</td><td className="px-4 py-3 font-semibold">{money(p.amount_cents)}</td><td className="px-4 py-3">{p.method}</td><td className="px-4 py-3">{p.note}</td></tr>)}</Table> : <Empty>No payments yet.</Empty>}
    </>
  );
}
