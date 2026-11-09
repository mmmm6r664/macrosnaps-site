"use client";
import { useActionState } from "react";
import { sendAssignment, type AssignS } from "@/app/admin/(panel)/photographers/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnGold, btnGhost, previewDoc, PREVIEW_SANDBOX } from "./ui";

type Member = { id: number; name: string; email: string };

/** Compose the "[CONFIRMED] …" assignment email for a photographer, preview it, then send. */
export default function SendAssignment({ team, defaultScope }: { team: Member[]; defaultScope: string[] }) {
  const [s, act, pending] = useActionState<AssignS, FormData>(sendAssignment, undefined);
  return (
    <details className="mb-4 rounded-lg border border-black/10 bg-white p-4" open={!!s}>
      <summary className="cursor-pointer text-sm font-semibold">+ Send shoot assignment (confirmation email to a photographer)</summary>
      <p className="mt-2 text-sm text-black/60">Fill in the shoot, press <b>Preview</b> to see exactly what they&apos;ll get, then <b>Send</b>.</p>
      <form onSubmit={noReset(act)} className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="sm:col-span-2 grid gap-3 sm:grid-cols-3">
          <div><label className={labelCls} htmlFor="sa-m">Team member</label>
            <select id="sa-m" name="member" className={inputCls} defaultValue=""><option value="">Choose…</option>{team.map((t) => <option key={t.id} value={t.id}>{t.name} ({t.email})</option>)}</select></div>
          <div><label className={labelCls} htmlFor="sa-n">…or name</label><input id="sa-n" name="name" className={inputCls} /></div>
          <div><label className={labelCls} htmlFor="sa-e">…and email</label><input id="sa-e" name="email" type="email" className={inputCls} /></div>
        </div>
        <div><label className={labelCls} htmlFor="sa-t">Type</label><input id="sa-t" name="type" defaultValue="Conference Photography" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="sa-d">Dates</label><input id="sa-d" name="dates" placeholder="Friday & Saturday, Oct 16–17" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="sa-c">City (for the subject line)</label><input id="sa-c" name="city" placeholder="New York, NY" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="sa-p">Compensation</label><input id="sa-p" name="pay" placeholder="$350" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="sa-s">Schedule (one line per day: Day | Time)</label>
          <textarea id="sa-s" name="sessions" rows={3} placeholder={"Friday 16th October | 3:00 PM – 5:00 PM (2 hours)\nSaturday 17th October | 10:00 AM – 2:00 PM (4 hours)"} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="sa-l">Location (one line each)</label>
          <textarea id="sa-l" name="location" rows={3} placeholder={"Convene at One Liberty Plaza\n165 Broadway\nNew York, NY 10006"} className={inputCls} /></div>
        <div className="sm:col-span-2"><label className={labelCls} htmlFor="sa-w">Scope of work (one bullet per line)</label>
          <textarea id="sa-w" name="scope" rows={6} defaultValue={defaultScope.join("\n")} className={inputCls} /></div>
        <div className="flex gap-2 sm:col-span-2">
          <button name="mode" value="preview" disabled={pending} className={btnGhost}>{pending ? "Working…" : "Preview"}</button>
          <button name="mode" value="send" disabled={pending || !s?.preview} title={s?.preview ? "" : "Preview first"} className={btnGold}>Send</button>
        </div>
        {(s?.error || s?.ok) && <p role="status" className={`rounded px-3 py-2 text-sm sm:col-span-2 ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
      </form>
      {s?.preview && (
        <div className="mt-4">
          <p className="text-sm"><b>To:</b> {s.preview.to}<br /><b>Subject:</b> {s.preview.subject}</p>
          <iframe title="Email preview" srcDoc={previewDoc(s.preview.html)} className="mt-2 h-[700px] w-full rounded border border-black/10" sandbox={PREVIEW_SANDBOX} />
        </div>
      )}
    </details>
  );
}
