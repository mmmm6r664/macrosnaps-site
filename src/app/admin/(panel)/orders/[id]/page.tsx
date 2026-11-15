import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Card, Table, Badge, Notice, fmtDate, money, btnGhost, btnPrimary, inputCls, labelCls } from "@/components/admin/ui";
import ConfirmButton from "@/components/admin/ConfirmButton";
import { updateOrder, deleteOrder } from "../actions";

export type OrderRow = {
  id: number; source: string; number: string | null; client_id: number | null; name: string; email: string | null; phone: string | null; company: string | null;
  event: string | null; location: string | null; event_date: string | null; notes: string | null; status: string | null; payment_status: string | null; fulfillment_status: string | null;
  channel: string | null; subtotal_cents: number; tax_cents: number; discount_cents: number; total_cents: number; paid_cents: number; refunded_cents: number; balance_cents: number;
  items: { name: string; qty: number; price_cents: number; options?: string }[]; created_at: Date;
};

export default async function OrderPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ saved?: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const [o] = await q<OrderRow[]>`select * from orders where id = ${id}`;
  if (!o) notFound();
  const sp = await searchParams;
  const d = (c: number) => (c / 100).toFixed(2);
  return (
    <>
      <PageHead title={`Order #${o.number ?? o.id}${o.event ? ` · ${o.event}` : ""}`} sub={`${o.source}${o.channel === "WIX_INVOICES" ? " invoice" : " order"} · ${fmtDate(o.created_at, true)}`}
        actions={<div className="flex flex-wrap gap-2"><a href={`/api/admin/orders/${o.id}`} className={btnGhost}>Download PDF</a>{o.client_id ? <Link href={`/admin/clients/${o.client_id}`} className={btnGhost}>Client</Link> : null}<Link href="/admin/orders" className={btnGhost}>← Past orders</Link></div>} />
      {sp.saved && <Notice tone="green">Saved.</Notice>}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] [&>*]:min-w-0">
        <div className="space-y-6">
          <Card title="Items">
            <Table head={["Item", "Qty", "Price"]}>
              {o.items.map((i, k) => (
                <tr key={k} className="align-top"><td className="px-4 py-3"><div className="font-medium">{i.name}</div>{i.options ? <div className="mt-1 whitespace-pre-wrap text-xs text-black/60">{i.options.replace(/; /g, "\n")}</div> : null}</td><td className="px-4 py-3">{i.qty}</td><td className="px-4 py-3">{money(i.price_cents)}</td></tr>
              ))}
            </Table>
            <dl className="mt-4 grid max-w-xs grid-cols-2 gap-y-1 text-sm">
              <dt className="text-black/55">Subtotal</dt><dd>{money(o.subtotal_cents)}</dd>
              {o.discount_cents ? <><dt className="text-black/55">Discount</dt><dd>-{money(o.discount_cents)}</dd></> : null}
              {o.tax_cents ? <><dt className="text-black/55">Tax / fees</dt><dd>{money(o.tax_cents)}</dd></> : null}
              <dt className="font-semibold">Total</dt><dd className="font-semibold">{money(o.total_cents)}</dd>
              <dt className="text-black/55">Paid</dt><dd>{money(o.paid_cents)}</dd>
              {o.refunded_cents ? <><dt className="text-black/55">Refunded</dt><dd>{money(o.refunded_cents)}</dd></> : null}
              {o.balance_cents ? <><dt className="text-black/55">Balance due</dt><dd>{money(o.balance_cents)}</dd></> : null}
            </dl>
            <p className="mt-3"><Badge status={(o.payment_status ?? "").toLowerCase()} /></p>
          </Card>
          {o.notes ? <Card title="Notes"><p className="whitespace-pre-wrap text-sm">{o.notes}</p></Card> : null}
        </div>
        <Card title="Edit order">
          <form action={updateOrder} className="space-y-3">
            <input type="hidden" name="id" value={o.id} />
            <div><label className={labelCls} htmlFor="o-event">Event / conference</label><input id="o-event" name="event" defaultValue={o.event ?? ""} className={inputCls} /></div>
            <div><label className={labelCls} htmlFor="o-company">Company</label><input id="o-company" name="company" defaultValue={o.company ?? ""} className={inputCls} /></div>
            <div><label className={labelCls} htmlFor="o-loc">Venue / location</label><input id="o-loc" name="location" defaultValue={o.location ?? ""} className={inputCls} /></div>
            <div><label className={labelCls} htmlFor="o-date">Event date</label><input id="o-date" name="event_date" defaultValue={o.event_date ?? ""} className={inputCls} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls} htmlFor="o-name">Client name</label><input id="o-name" name="name" defaultValue={o.name} className={inputCls} /></div>
              <div><label className={labelCls} htmlFor="o-phone">Phone</label><input id="o-phone" name="phone" defaultValue={o.phone ?? ""} className={inputCls} /></div>
            </div>
            <div><label className={labelCls} htmlFor="o-email">Email</label><input id="o-email" name="email" defaultValue={o.email ?? ""} className={inputCls} /></div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls} htmlFor="o-total">Total $</label><input id="o-total" name="total" defaultValue={d(o.total_cents)} className={inputCls} /></div>
              <div><label className={labelCls} htmlFor="o-paid">Paid $</label><input id="o-paid" name="paid" defaultValue={d(o.paid_cents)} className={inputCls} /></div>
              <div><label className={labelCls} htmlFor="o-pay">Payment</label>
                <select id="o-pay" name="payment_status" defaultValue={o.payment_status ?? ""} className={inputCls}>{["PAID", "NOT_PAID", "PARTIALLY_PAID", "FULLY_REFUNDED", "PARTIALLY_REFUNDED"].map((x) => <option key={x} value={x}>{x.replace(/_/g, " ").toLowerCase()}</option>)}</select></div>
            </div>
            <div><label className={labelCls} htmlFor="o-notes">Notes</label><textarea id="o-notes" name="notes" rows={4} defaultValue={o.notes ?? ""} className={inputCls} /></div>
            <button className={btnPrimary}>Save</button>
          </form>
          <form action={deleteOrder} className="mt-5 border-t border-black/10 pt-4">
            <input type="hidden" name="id" value={o.id} />
            <ConfirmButton message="Delete this order from the CRM? This can't be undone." className="text-sm font-semibold text-red-700 underline">Delete order</ConfirmButton>
          </form>
        </Card>
      </div>
    </>
  );
}
