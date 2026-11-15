import { requireUser } from "@/lib/auth";
import { listCoupons, describe } from "@/lib/coupons";
import { PageHead, Card, Table, Empty, Notice, inputCls, labelCls, btnGold, money } from "@/components/admin/ui";
import { SITE } from "@/lib/site";
import { addCoupon, toggleCoupon } from "./actions";

const day = (s: number | null) => (s ? new Date(s * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : "No end date");

export default async function CouponsPage({ searchParams }: { searchParams: Promise<{ ok?: string; err?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const rows = await listCoupons().catch(() => []);
  return (
    <div className="space-y-6">
      <PageHead title="Coupons" sub="Discount codes clients can use when they book online. Share a link and the code is applied automatically, or clients can type it at checkout." />
      {sp.ok && <Notice tone="green">{sp.ok}</Notice>}
      {sp.err && <Notice tone="red">{sp.err}</Notice>}
      <Card title="New coupon">
        <form action={addCoupon} className="grid gap-4 md:grid-cols-4">
          <div><label className={labelCls}>Code</label><input name="code" required placeholder="HOLIDAY12" className={`${inputCls} uppercase`} /></div>
          <div><label className={labelCls}>Discount</label><div className="flex gap-2"><input name="value" type="number" min="1" step="1" required placeholder="10" className={inputCls} /><select name="kind" className={inputCls}><option value="percent">% off</option><option value="amount">$ off</option></select></div></div>
          <div><label className={labelCls}>Book by (last day)</label><input name="expires" type="date" className={inputCls} /></div>
          <div><label className={labelCls}>Name (internal)</label><input name="name" placeholder="Holiday newsletter 2026" className={inputCls} /></div>
          <div><label className={labelCls}>Max uses (optional)</label><input name="max" type="number" min="1" className={inputCls} /></div>
          <div><label className={labelCls}>Minimum order $ (optional)</label><input name="min" type="number" min="1" className={inputCls} /></div>
          <label className="flex items-center gap-2 text-sm md:col-span-2"><input type="checkbox" name="first" /> New clients only (first booking)</label>
          <div className="md:col-span-4"><button className={btnGold}>Create coupon</button></div>
        </form>
      </Card>
      <Card title="All coupons">
        {rows.length ? (
          <Table head={["Code", "Discount", "Valid until", "Used", "Rules", "Share link", ""]}>
            {rows.map((c) => (
              <tr key={c.id} className={c.active ? "" : "opacity-50"}>
                <td className="px-3 py-2 font-mono font-semibold">{c.code}<div className="font-sans text-xs font-normal text-black/50">{c.name !== c.code ? c.name : ""}</div></td>
                <td className="px-3 py-2">{describe(c)}</td>
                <td className="px-3 py-2 text-sm">{day(c.expiresAt)}</td>
                <td className="px-3 py-2 text-sm">{c.timesRedeemed}{c.maxRedemptions ? ` of ${c.maxRedemptions}` : ""}</td>
                <td className="px-3 py-2 text-xs">{[c.firstTimeOnly && "New clients only", c.minAmount && `Min ${money(c.minAmount)}`].filter(Boolean).join(" · ") || "—"}</td>
                <td className="px-3 py-2 text-xs"><code className="select-all">{`${SITE.url}/book?coupon=${c.code}`}</code></td>
                <td className="px-3 py-2"><form action={toggleCoupon}><input type="hidden" name="id" value={c.id} /><input type="hidden" name="on" value={c.active ? "0" : "1"} /><button className="text-xs underline">{c.active ? "Turn off" : "Turn on"}</button></form></td>
              </tr>
            ))}
          </Table>
        ) : <Empty>No coupons yet.</Empty>}
      </Card>
    </div>
  );
}
