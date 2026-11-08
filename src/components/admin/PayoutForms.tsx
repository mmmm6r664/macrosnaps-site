"use client";
import { useActionState } from "react";
import { addPayout, revealTin, type S } from "@/app/admin/(panel)/payouts/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnPrimary } from "./ui";

const Msg = ({ s }: { s: S }) => (s ? <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p> : null);

export function AddPayoutForm({ staff }: { staff: { id: number; name: string; payout: string }[] }) {
  const [s, act, pending] = useActionState<S, FormData>(addPayout, undefined);
  return (
    <form onSubmit={noReset(act)} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
      <div className="xl:col-span-2"><label className={labelCls} htmlFor="po-u">Paid to</label><select id="po-u" name="user_id" className={inputCls}><option value="">Choose…</option>{staff.map((x) => <option key={x.id} value={x.id}>{x.name}{x.payout ? ` (${x.payout})` : ""}</option>)}</select></div>
      <div><label className={labelCls} htmlFor="po-pn">…or name</label><input id="po-pn" name="payee_name" className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="po-pe">…and email</label><input id="po-pe" name="payee_email" type="email" className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="po-a">Amount $</label><input id="po-a" name="amount" inputMode="decimal" className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="po-d">Date paid</label><input id="po-d" name="paid_on" type="date" defaultValue={new Date().toISOString().slice(0, 10)} className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="po-m">Method</label><select id="po-m" name="method" className={inputCls}>{["Venmo", "PayPal", "Cash App", "Zelle", "Check", "Bank transfer", "Other"].map((m) => <option key={m}>{m}</option>)}</select></div>
      <div><label className={labelCls} htmlFor="po-b">Booking # (optional)</label><input id="po-b" name="booking_id" inputMode="numeric" className={inputCls} /></div>
      <div className="xl:col-span-2"><label className={labelCls} htmlFor="po-n">Note (shown in the email)</label><input id="po-n" name="note" placeholder="e.g. Smith wedding, 6 hours" className={inputCls} /></div>
      <label className="flex items-end gap-2 text-sm xl:col-span-2"><input type="checkbox" name="email_them" defaultChecked className="mb-1" /> Email them a payment confirmation</label>
      <div className="flex items-end xl:col-span-2"><button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Record payment"}</button></div>
      <div className="sm:col-span-2 xl:col-span-6"><Msg s={s} /></div>
    </form>
  );
}

export function RevealTin({ userId }: { userId: number }) {
  const [s, act, pending] = useActionState<S, FormData>(revealTin, undefined);
  if (s?.ok) return <span className="font-mono text-xs">{s.ok}</span>;
  return <form onSubmit={noReset(act)}><input type="hidden" name="user_id" value={userId} /><button disabled={pending} className="text-xs underline">{pending ? "…" : "Reveal"}</button>{s?.error && <span className="ml-2 text-xs text-red-700">{s.error}</span>}</form>;
}
