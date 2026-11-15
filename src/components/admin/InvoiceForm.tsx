"use client";
import { noReset } from "./noReset";
import { useActionState, useState } from "react";
import { createInvoice, type S } from "@/app/admin/(panel)/invoices/actions";
import { inputCls, labelCls, btnPrimary, btnGhost } from "./ui";

type Line = { desc: string; qty: string; price: string };
const RATE_LINES: Line[] = [
  { desc: "Photography: first hour", qty: "1", price: "250" },
  { desc: "Photography: additional hour", qty: "1", price: "100" },
  { desc: "Videography: first hour", qty: "1", price: "300" },
  { desc: "Videography: additional hour", qty: "1", price: "200" },
];

export type InvoiceInitial = { firstName?: string; lastName?: string; email?: string; phone?: string; company?: string; line1?: string; line2?: string; city?: string; state?: string; zip?: string; memo?: string; lines?: Line[] };

export default function InvoiceForm({ initial = {} }: { initial?: InvoiceInitial }) {
  const [s, act, pending] = useActionState<S, FormData>(createInvoice, undefined);
  const [lines, setLines] = useState<Line[]>(initial.lines?.length ? initial.lines : [{ desc: "", qty: "1", price: "" }]);
  const set = (i: number, k: keyof Line, v: string) => setLines((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const total = lines.reduce((a, l) => a + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  return (
    <form onSubmit={noReset(act)} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div><label className={labelCls} htmlFor="i-first">First name *</label><input id="i-first" name="firstName" defaultValue={initial.firstName} required maxLength={60} className={inputCls} autoComplete="given-name" /></div>
          <div><label className={labelCls} htmlFor="i-last">Last name *</label><input id="i-last" name="lastName" defaultValue={initial.lastName} required maxLength={60} className={inputCls} autoComplete="family-name" /></div>
        <div><label className={labelCls} htmlFor="i-email">Customer email *</label><input id="i-email" name="email" defaultValue={initial.email} type="email" required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="i-phone">Phone</label><input id="i-phone" name="phone" defaultValue={initial.phone} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className={labelCls} htmlFor="i-company">Bill to company (optional; shown as the invoice name, with “Attn:” the person above)</label><input id="i-company" name="company" defaultValue={initial.company} maxLength={200} className={inputCls} autoComplete="organization" /></div>
        <div className="sm:col-span-2"><label className={labelCls} htmlFor="i-a1">Billing address</label><input id="i-a1" name="line1" defaultValue={initial.line1} placeholder="Street address" maxLength={200} className={inputCls} autoComplete="address-line1" /></div>
        <div className="sm:col-span-2"><input id="i-a2" name="line2" defaultValue={initial.line2} placeholder="Suite / floor (optional)" aria-label="Address line 2" maxLength={200} className={inputCls} autoComplete="address-line2" /></div>
        <div><label className={labelCls} htmlFor="i-city">City</label><input id="i-city" name="city" defaultValue={initial.city} maxLength={100} className={inputCls} autoComplete="address-level2" /></div>
        <div className="grid grid-cols-2 gap-3"><div><label className={labelCls} htmlFor="i-state">State</label><input id="i-state" name="state" defaultValue={initial.state} maxLength={60} className={inputCls} autoComplete="address-level1" /></div><div><label className={labelCls} htmlFor="i-zip">ZIP</label><input id="i-zip" name="zip" defaultValue={initial.zip} maxLength={20} className={inputCls} autoComplete="postal-code" /></div></div>
      </div>
      <div>
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
          <p className={labelCls}>Line items</p>
          <div className="flex flex-wrap gap-1 text-xs">{RATE_LINES.map((r) => <button type="button" key={r.desc} onClick={() => setLines((l) => [...l.filter((x) => x.desc || x.price), r])} className="rounded border border-black/15 px-2 py-1 hover:border-black/40">+ {r.desc}</button>)}</div>
        </div>
        <div className="space-y-2">
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_70px_110px_28px] gap-2">
              <input name="desc" value={l.desc} onChange={(e) => set(i, "desc", e.target.value)} placeholder="e.g. Conference photography, Day 1 (8 hours)" className={inputCls} aria-label="Description" />
              <input name="qty" value={l.qty} onChange={(e) => set(i, "qty", e.target.value)} inputMode="numeric" className={inputCls} aria-label="Quantity" />
              <input name="price" value={l.price} onChange={(e) => set(i, "price", e.target.value)} inputMode="decimal" placeholder="Price $" className={inputCls} aria-label="Unit price" />
              <button type="button" onClick={() => setLines((x) => (x.length > 1 ? x.filter((_, j) => j !== i) : x))} aria-label="Remove line" className="text-black/40 hover:text-red-700">×</button>
            </div>
          ))}
        </div>
        <div className="mt-2 flex items-center justify-between">
          <button type="button" onClick={() => setLines((l) => [...l, { desc: "", qty: "1", price: "" }])} className={btnGhost}>+ Add line</button>
          <p className="font-serif text-2xl">Total ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-[1fr_200px]">
        <div><label className={labelCls} htmlFor="i-memo">Note on invoice</label><input id="i-memo" name="memo" defaultValue={initial.memo} placeholder="e.g. Annual Summit, March 3–5, Marriott Marquis" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="i-days">Due in (days)</label><input id="i-days" name="days" type="number" min={0} max={90} defaultValue={7} className={inputCls} /></div>
      </div>
      {s?.error && <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{s.error}</p>}
      <div className="flex flex-wrap gap-2">
        <button name="send" value="1" disabled={pending} className={btnPrimary}>{pending ? "Working…" : "Create & email invoice"}</button>
        <button name="send" value="0" disabled={pending} className={btnGhost}>Save as draft</button>
      </div>
      <p className="text-xs text-black/50">Stripe emails the customer an invoice with a secure “Pay online” link (card or bank transfer) and a PDF.</p>
    </form>
  );
}
