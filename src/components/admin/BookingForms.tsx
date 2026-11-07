"use client";
import { noReset } from "./noReset";
import { useActionState, useState } from "react";
import { updateBooking, refundBooking, type ActionState } from "@/app/admin/(panel)/bookings/actions";
import { inputCls, labelCls, btnPrimary, btnDanger } from "./ui";

function Msg({ s }: { s: ActionState }) {
  if (!s) return null;
  return <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>;
}

export function BookingEditForm({ id, status, statuses, notes, crew, staff }: { id: number; status: string; statuses: readonly string[]; notes: string; crew: number[]; staff: { id: number; name: string; role: string }[] }) {
  const [s, act, pending] = useActionState(updateBooking, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className={labelCls} htmlFor="status">Status</label>
        <select id="status" name="status" defaultValue={status} className={inputCls}>{statuses.map((x) => <option key={x} value={x}>{x.replace(/_/g, " ")}</option>)}</select>
      </div>
      <fieldset>
        <legend className={labelCls}>Assigned crew</legend>
        {staff.length ? (
          <div className="grid gap-2 sm:grid-cols-2">
            {staff.map((u) => (
              <label key={u.id} className="flex items-center gap-2 rounded border border-black/10 px-3 py-2 text-sm">
                <input type="checkbox" name="crew" value={u.id} defaultChecked={crew.includes(u.id)} className="accent-[#a8963b]" />{u.name} <span className="text-xs text-black/40">{u.role}</span>
              </label>
            ))}
          </div>
        ) : <p className="text-sm text-black/50">Add photographers and videographers under Team to assign them.</p>}
      </fieldset>
      <div>
        <label className={labelCls} htmlFor="internal_notes">Internal notes</label>
        <textarea id="internal_notes" name="internal_notes" rows={5} defaultValue={notes} className={inputCls} placeholder="Only your team sees these" />
      </div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save changes"}</button>
    </form>
  );
}

export function RefundForm({ id, leftCents }: { id: number; leftCents: number }) {
  const [s, act, pending] = useActionState(refundBooking, undefined);
  const [full, setFull] = useState(true);
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div className="flex gap-4 text-sm">
        <label className="flex items-center gap-2"><input type="radio" name="full" value="1" checked={full} onChange={() => setFull(true)} />Full (${(leftCents / 100).toFixed(2)})</label>
        <label className="flex items-center gap-2"><input type="radio" name="full" value="0" checked={!full} onChange={() => setFull(false)} />Partial</label>
      </div>
      {!full && <div><label className={labelCls} htmlFor="amount">Amount (USD)</label><input id="amount" name="amount" inputMode="decimal" className={inputCls} placeholder="100.00" /></div>}
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" className="mt-1" />I confirm this refund. It can&apos;t be undone.</label>
      <Msg s={s} />
      <button disabled={pending} className={btnDanger}>{pending ? "Refunding…" : "Issue refund"}</button>
    </form>
  );
}
