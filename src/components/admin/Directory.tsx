"use client";
import { useActionState, useState } from "react";
import { messagePeople, createOffer, type S } from "@/app/admin/(panel)/photographers/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnPrimary, btnGold, Badge } from "./ui";

type P = { key: string; kind: string; name: string; email: string; phone: string | null; city: string; radius: number; miles?: number; roles: string; shootTypes: string[]; experience?: string; portfolio?: string; camera?: string; gear?: string };
const Msg = ({ s }: { s: S }) => (s ? <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p> : null);

export default function Directory({ people, offer }: { people: P[]; offer?: { title: string; city: string; date: string; details: string; bookingId?: number } }) {
  const [sel, setSel] = useState<Set<string>>(new Set());
  const [tab, setTab] = useState<"offer" | "message">(offer ? "offer" : "message");
  const [ms, mAct, mPending] = useActionState<S, FormData>(messagePeople, undefined);
  const [os, oAct, oPending] = useActionState<S, FormData>(createOffer, undefined);
  const toggle = (k: string) => setSel((s) => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n; });
  const all = people.length > 0 && sel.size === people.length;
  const hidden = [...sel].map((k) => <input key={k} type="hidden" name="p" value={k} />);
  return (
    <div className="grid gap-5 2xl:grid-cols-[1fr_400px]">
      <div className="overflow-x-auto rounded-lg border border-black/10 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-black/[.03] text-xs uppercase tracking-wider text-black/55">
            <tr>
              <th className="px-3 py-3"><input type="checkbox" aria-label="Select all" checked={all} onChange={() => setSel(all ? new Set() : new Set(people.map((p) => p.key)))} /></th>
              {["Name", "Contact", "Area", "Does", "Portfolio", "Camera gear", "Shoot types"].map((h) => <th key={h} className="px-3 py-3 font-semibold">{h}</th>)}
            </tr>
          </thead>
          <tbody className="divide-y divide-black/5">
            {people.map((p) => (
              <tr key={p.key} className={sel.has(p.key) ? "bg-[#ccba56]/10" : ""}>
                <td className="px-3 py-3 align-top"><input type="checkbox" aria-label={`Select ${p.name}`} checked={sel.has(p.key)} onChange={() => toggle(p.key)} /></td>
                <td className="px-3 py-3 align-top"><span className="font-semibold">{p.name}</span><div className="mt-1"><Badge status={p.kind === "staff" ? "done" : "new"}>{p.kind === "staff" ? "Team" : "Applicant"}</Badge></div></td>
                <td className="px-3 py-3 align-top"><a className="underline" href={`mailto:${p.email}`}>{p.email}</a>{p.phone && <div><a className="underline" href={`tel:${p.phone}`}>{p.phone}</a></div>}</td>
                <td className="px-3 py-3 align-top">{p.city || "—"}<div className="text-xs text-black/50">{p.miles != null ? `${p.miles} mi away · ` : ""}travels {p.radius >= 500 ? "anywhere" : `${p.radius} mi`}</div></td>
                <td className="px-3 py-3 align-top">{p.roles}{p.experience && <div className="text-xs text-black/50">{p.experience}</div>}</td>
                <td className="max-w-[180px] px-3 py-3 align-top text-xs">{p.portfolio ? (/^https?:\/\//.test(p.portfolio) ? <a className="break-all font-semibold text-[#8a7a2b] underline" href={p.portfolio} target="_blank" rel="noopener noreferrer">{p.portfolio.replace(/^https?:\/\/(www\.)?/, "").slice(0, 40)}</a> : p.portfolio) : "—"}</td>
                <td className="max-w-[240px] px-3 py-3 align-top text-xs">
                  {p.camera && <div className="font-semibold">{p.camera}</div>}
                  {p.gear ? <details><summary className="cursor-pointer text-black/60">Full kit</summary><p className="mt-1 whitespace-pre-wrap text-black/70">{p.gear}</p></details> : !p.camera && "—"}
                </td>
                <td className="max-w-xs px-3 py-3 align-top text-xs text-black/70">{p.shootTypes.join(", ") || "—"}</td>
              </tr>
            ))}
            {!people.length && <tr><td colSpan={8} className="px-3 py-10 text-center text-black/50">Nobody matches these filters.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="space-y-3">
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab("offer")} className={`rounded px-3 py-2 text-sm ${tab === "offer" ? "bg-black text-white" : "border border-black/15 bg-white"}`}>Offer a shoot</button>
          <button type="button" onClick={() => setTab("message")} className={`rounded px-3 py-2 text-sm ${tab === "message" ? "bg-black text-white" : "border border-black/15 bg-white"}`}>Email / text</button>
          <span className="ml-auto self-center text-sm text-black/60">{sel.size} selected</span>
        </div>
        {tab === "message" ? (
          <form onSubmit={noReset(mAct)} className="space-y-3 rounded-lg border border-black/10 bg-white p-4">
            {hidden}
            <div className="flex gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" name="viaEmail" defaultChecked />Email</label><label className="flex items-center gap-2"><input type="checkbox" name="viaSms" />Text message</label></div>
            <div><label className={labelCls} htmlFor="m-sub">Subject (email)</label><input id="m-sub" name="subject" className={inputCls} /></div>
            <div><label className={labelCls} htmlFor="m-body">Message</label><textarea id="m-body" name="body" rows={6} className={inputCls} /></div>
            <Msg s={ms} />
            <button disabled={mPending || !sel.size} className={btnPrimary}>{mPending ? "Sending…" : `Send to ${sel.size}`}</button>
          </form>
        ) : (
          <form onSubmit={noReset(oAct)} className="space-y-3 rounded-lg border border-black/10 bg-white p-4">
            {hidden}
            {offer?.bookingId && <input type="hidden" name="booking_id" value={offer.bookingId} />}
            <div><label className={labelCls} htmlFor="o-t">Shoot</label><input id="o-t" name="title" defaultValue={offer?.title} placeholder="Muslim wedding, 6 hours photography" className={inputCls} /></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div><label className={labelCls} htmlFor="o-d">Date & time</label><input id="o-d" name="date" defaultValue={offer?.date} placeholder="Sat Mar 14, 2–8 PM" className={inputCls} /></div>
              <div><label className={labelCls} htmlFor="o-c">City</label><input id="o-c" name="city" defaultValue={offer?.city} className={inputCls} /></div>
            </div>
            <div><label className={labelCls} htmlFor="o-p">Pay (shown to them)</label><input id="o-p" name="pay" placeholder="e.g. $X for 6 hours" className={inputCls} /></div>
            <div><label className={labelCls} htmlFor="o-de">Details</label><textarea id="o-de" name="details" rows={4} defaultValue={offer?.details} className={inputCls} /></div>
            <div className="flex gap-4 text-sm"><label className="flex items-center gap-2"><input type="checkbox" name="viaEmail" defaultChecked />Email</label><label className="flex items-center gap-2"><input type="checkbox" name="viaSms" defaultChecked />Text message</label></div>
            <p className="text-xs text-black/50">Team members also get a notification in their staff portal. Everyone gets Accept / Decline buttons, and you&apos;re alerted when someone accepts.</p>
            <Msg s={os} />
            <button disabled={oPending || !sel.size} className={btnGold}>{oPending ? "Sending…" : `Offer to ${sel.size}`}</button>
          </form>
        )}
      </div>
    </div>
  );
}
