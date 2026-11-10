"use client";
import { useActionState } from "react";
import { updatePhone } from "@/app/admin/(panel)/photographers/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnGhost } from "./ui";

/** Fix a team member's phone number (profile, application and contracts). */
export default function UpdatePhone({ team }: { team: { id: number; name: string; email: string; phone: string | null }[] }) {
  const [s, act, pending] = useActionState(updatePhone, undefined);
  return (
    <details className="mb-4 rounded-lg border border-black/10 bg-white p-4" open={!!s}>
      <summary className="cursor-pointer text-sm font-semibold">Update a team member&apos;s phone number</summary>
      <form onSubmit={noReset(act)} className="mt-4 grid gap-3 sm:grid-cols-3">
        <div className="sm:col-span-2"><label className={labelCls} htmlFor="up-m">Team member</label>
          <select id="up-m" name="member" className={inputCls} defaultValue=""><option value="">Choose…</option>{team.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.email}){t.phone ? ` · now ${t.phone}` : ""}</option>)}</select></div>
        <div><label className={labelCls} htmlFor="up-p">New phone</label><input id="up-p" name="phone" type="tel" className={inputCls} /></div>
        <div className="sm:col-span-3 flex items-center gap-3"><button disabled={pending} className={btnGhost}>{pending ? "Saving…" : "Save phone"}</button>
          {(s?.error || s?.ok) && <p role="status" className={`text-sm ${s.error ? "text-red-700" : "text-emerald-700"}`}>{s.error ?? s.ok}</p>}</div>
      </form>
    </details>
  );
}
