"use client";
import { useActionState, useRef } from "react";
import { updateTicket, type UState } from "@/app/admin/(panel)/support/actions";
import { inputCls, labelCls, btnPrimary } from "./ui";
import { noReset } from "./noReset";

const OPTIONS: [string, string][] = [["open", "Open"], ["in_progress", "In progress"], ["waiting", "Waiting on customer"], ["resolved", "Resolved"], ["closed", "Closed (no email)"]];

export default function TicketReply({ id, status }: { id: number; status: string }) {
  const ref = useRef<HTMLFormElement>(null);
  const [s, act, pending] = useActionState<UState, FormData>(async (prev, fd) => { const r = await updateTicket(prev, fd); if (r?.ok) ref.current?.querySelectorAll("textarea").forEach((t) => (t.value = "")); return r; }, undefined);
  return (
    <form ref={ref} onSubmit={noReset(act)} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div><label className={labelCls} htmlFor="tr-r">Reply to customer (emailed)</label><textarea id="tr-r" name="reply" rows={5} className={inputCls} placeholder="Write your reply… (your sign-off is added automatically)" /></div>
      <div><label className={labelCls} htmlFor="tr-n">Internal note (only your team sees this)</label><textarea id="tr-n" name="note" rows={2} className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="tr-s">Status</label>
        <select id="tr-s" name="status" defaultValue={status} key={status} className={inputCls}>{OPTIONS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
      <p className="text-xs text-black/50">The customer is emailed when you reply or change the status (open, in progress, waiting, resolved). Sending a reply on an open ticket moves it to “In progress”.</p>
      <button disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Saving…" : "Save & send"}</button>
      {s && <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
    </form>
  );
}
