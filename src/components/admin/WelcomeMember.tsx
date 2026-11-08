"use client";
import { useActionState } from "react";
import { sendWelcome, type S } from "@/app/admin/(panel)/photographers/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnGold } from "./ui";

/** Send the "Welcome to MacroSnaps" onboarding email to a team member. */
export default function WelcomeMember({ team }: { team: { id: number; name: string; email: string; signed: boolean }[] }) {
  const [s, act, pending] = useActionState<S, FormData>(sendWelcome, undefined);
  return (
    <details className="mb-4 rounded-lg border border-black/10 bg-white p-4" open={!!s}>
      <summary className="cursor-pointer text-sm font-semibold">+ Send a “Welcome to MacroSnaps” email</summary>
      <p className="mt-2 text-sm text-black/60">For a new team member whose contract is done. It explains how shoots, file delivery and payments work, with a link to their crew portal.</p>
      <form onSubmit={noReset(act)} className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div><label className={labelCls} htmlFor="wm-u">Team member</label>
          <select id="wm-u" name="user" required defaultValue="" className={inputCls}>
            <option value="" disabled>Choose…</option>
            {team.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.email}){t.signed ? " · contract signed" : ""}</option>)}
          </select></div>
        <button disabled={pending} className={btnGold}>{pending ? "Sending…" : "Send welcome email"}</button>
        <label className="flex items-center gap-2 text-sm sm:col-span-2"><input type="checkbox" name="offline" className="accent-[#a8963b]" />Their contract was signed outside the portal (record it and cancel the open e-sign link)</label>
        {s && <p role="status" className={`rounded px-3 py-2 text-sm sm:col-span-2 ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
      </form>
    </details>
  );
}
