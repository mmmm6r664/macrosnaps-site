"use client";
import { noReset } from "./noReset";
import { useActionState, useState } from "react";
import { refundPayment, type S } from "@/app/admin/(panel)/payments/actions";
import { inputCls, btnDanger } from "./ui";

export default function PaymentRefund({ pi, leftCents }: { pi: string; leftCents: number }) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(true);
  const [s, act, pending] = useActionState<S, FormData>(refundPayment, undefined);
  if (s?.ok) return <span className="text-xs text-emerald-700">{s.ok}</span>;
  if (!open) return <button onClick={() => setOpen(true)} className="text-sm text-red-700 underline">Refund</button>;
  return (
    <form onSubmit={noReset(act)} className="w-64 space-y-2 rounded border border-black/10 bg-white p-3 text-left text-xs shadow">
      <input type="hidden" name="pi" value={pi} />
      <label className="flex items-center gap-2"><input type="radio" name="full" value="1" checked={full} onChange={() => setFull(true)} />Full ${(leftCents / 100).toFixed(2)}</label>
      <label className="flex items-center gap-2"><input type="radio" name="full" value="0" checked={!full} onChange={() => setFull(false)} />Partial</label>
      {!full && <input name="amount" inputMode="decimal" placeholder="Amount" className={inputCls} />}
      <label className="flex items-start gap-2"><input type="checkbox" name="confirm" className="mt-0.5" />Confirm. This can&apos;t be undone.</label>
      {s?.error && <p className="text-red-700">{s.error}</p>}
      <div className="flex gap-2"><button disabled={pending} className={`${btnDanger} !px-3 !py-1.5 !text-xs`}>{pending ? "…" : "Refund"}</button><button type="button" onClick={() => setOpen(false)} className="underline">Cancel</button></div>
    </form>
  );
}
