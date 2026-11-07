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

export default function InvoiceForm() {
  const [s, act, pending] = useActionState<S, FormData>(createInvoice, undefined);
  const [lines, setLines] = useState<Line[]>([{ desc: "", qty: "1", price: "" }]);
  const set = (i: number, k: keyof Line, v: string) => setLines((l) => l.map((x, j) => (j === i ? { ...x, [k]: v } : x)));
  const total = lines.reduce((a, l) => a + (Number(l.qty) || 0) * (Number(l.price) || 0), 0);
  return (
    <form onSubmit={noReset(act)} className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className={labelCls} htmlFor="i-name">Customer name *</label><input id="i-name" name="name" required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="i-email">Customer email *</label><input id="i-email" name="email" type="email" required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="i-phone">Phone</label><input id="i-phone" name="phone" className={inputCls} /></div>
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
        <div><label className={labelCls} htmlFor="i-memo">Note on invoice</label><input id="i-memo" name="memo" placeholder="e.g. Annual Summit, March 3–5, Marriott Marquis" className={inputCls} /></div>
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
