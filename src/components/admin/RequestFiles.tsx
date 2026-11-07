"use client";
import { useActionState } from "react";
import { requestFiles, type S } from "@/app/admin/(panel)/photographers/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnGold } from "./ui";

export type FileRequestRow = { id: number; name: string; email: string; shoot: string; shoot_date: string; due: string; link: string | null };

/** Ask any photographer/videographer for a shoot's Google Drive link (due in 24 hours), and see what has come in. */
export default function RequestFiles({ rows }: { rows: FileRequestRow[] }) {
  const [s, act, pending] = useActionState<S, FormData>(requestFiles, undefined);
  return (
    <details className="mb-4 rounded-lg border border-black/10 bg-white p-4" open={!!s}>
      <summary className="cursor-pointer text-sm font-semibold">+ Request files (Google Drive link, due in 24 hours)</summary>
      <p className="mt-2 text-sm text-black/60">Shoots booked through the website ask their assigned crew automatically about an hour after the shoot ends. Use this for anyone else.</p>
      <form onSubmit={noReset(act)} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div><label className={labelCls} htmlFor="rf-n">Name</label><input id="rf-n" name="name" required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="rf-e">Email</label><input id="rf-e" name="email" type="email" required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="rf-s">Shoot</label><input id="rf-s" name="shoot" defaultValue="Event photography" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="rf-d">Shoot date</label><input id="rf-d" name="date" type="date" required className={inputCls} /></div>
        <button disabled={pending} className={`${btnGold} self-end`}>{pending ? "Sending…" : "Send request"}</button>
        {s && <p role="status" className={`rounded px-3 py-2 text-sm sm:col-span-2 xl:col-span-5 ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
      </form>
      {rows.length > 0 && (
        <table className="mt-5 w-full text-sm">
          <thead><tr className="text-left text-xs uppercase tracking-wider text-black/50"><th className="py-2">Who</th><th>Shoot</th><th>Due</th><th>Drive link</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id} className="border-t border-black/5"><td className="py-2">{r.name}<div className="text-xs text-black/50">{r.email}</div></td><td>{r.shoot} · {r.shoot_date}</td><td>{r.due}</td>
              <td>{r.link ? <a className="underline" href={r.link} target="_blank" rel="noopener noreferrer">Open folder</a> : <span className="text-black/50">Waiting</span>}</td></tr>
          ))}</tbody>
        </table>
      )}
    </details>
  );
}
