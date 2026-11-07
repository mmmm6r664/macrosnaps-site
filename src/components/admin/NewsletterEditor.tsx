"use client";
import { noReset } from "./noReset";
import { useActionState, useState } from "react";
import { saveNewsletter, type S } from "@/app/admin/(panel)/newsletters/actions";
import { inputCls, labelCls, btnPrimary, btnGhost, btnGold } from "./ui";

export default function NewsletterEditor({ n, previewHtml, subscribers, locked }: { n: { id: number; subject: string; preheader: string; body: string; status: string; scheduled_at: string | null }; previewHtml: string; subscribers: number; locked: boolean }) {
  const [s, act, pending] = useActionState<S, FormData>(saveNewsletter, undefined);
  const [tab, setTab] = useState<"write" | "preview">("write");
  return (
    <form onSubmit={noReset(act)} className="grid gap-5 xl:grid-cols-[1fr_320px]">
      <input type="hidden" name="id" value={n.id} />
      <div className="space-y-4 rounded-lg border border-black/10 bg-white p-5">
        <div><label className={labelCls} htmlFor="subject">Subject line</label><input id="subject" name="subject" defaultValue={n.subject} disabled={locked} required maxLength={200} className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="preheader">Preview text (shown after the subject in inboxes)</label><input id="preheader" name="preheader" defaultValue={n.preheader} disabled={locked} maxLength={200} className={inputCls} /></div>
        <div className="flex gap-2 border-b border-black/10">
          {(["write", "preview"] as const).map((t) => <button type="button" key={t} onClick={() => setTab(t)} className={`-mb-px border-b-2 px-3 py-2 text-sm capitalize ${tab === t ? "border-black font-semibold" : "border-transparent text-black/50"}`}>{t === "preview" ? "Preview (last saved)" : "Write"}</button>)}
        </div>
        <div className={tab === "write" ? "" : "hidden"}>
          <textarea name="body" defaultValue={n.body} disabled={locked} rows={22} className={`${inputCls} font-mono text-sm`} placeholder={"# Spring wedding dates are filling up\n\nHi there,\n\nWe have a few **Saturday** dates left in May and June.\n\n![Wedding couple](https://…/photo.jpg)\n\n[[Book your date|https://macrosnaps.com/book]]"} />
          <p className="mt-2 text-xs leading-relaxed text-black/55">Formatting (leave a blank line between blocks): <code># Big heading</code> · <code>## Section heading</code> · <code>**bold**</code> · <code>[link text](https://…)</code> · <code>![caption](https://image)</code> full-width photo · <code>- bullet</code> · <code>&gt; quote</code> · <code>---</code> divider · <code>[[Button text|https://…]]</code> · <code>{"{{"}Title | text | https://image | https://link{"}}"}</code> feature card (2 per row)</p>
        </div>
        {tab === "preview" && <iframe title="Preview" srcDoc={previewHtml} sandbox="" className="h-[640px] w-full rounded border border-black/10 bg-[#f3f1ec]" />}
      </div>
      <div className="space-y-4">
        <div className="rounded-lg border border-black/10 bg-white p-5 text-sm">
          <p><span className="text-black/50">Status:</span> <b className="capitalize">{n.status}</b>{n.scheduled_at && n.status === "scheduled" ? ` for ${n.scheduled_at.slice(0, 10)}` : ""}</p>
          <p className="mt-1"><span className="text-black/50">Subscribers:</span> <b>{subscribers}</b></p>
        </div>
        {s && <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
        {!locked && (
          <>
            <div className="flex flex-wrap gap-2">
              <button name="op" value="save" disabled={pending} className={btnPrimary}>Save</button>
              <button name="op" value="test" disabled={pending} className={btnGhost}>Save & send me a test</button>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <p className={labelCls}>Schedule</p>
              {n.status === "scheduled" ? <button name="op" value="unschedule" disabled={pending} className={btnGhost}>Cancel schedule</button> : (
                <div className="flex gap-2"><input type="date" name="date" className={inputCls} /><button name="op" value="schedule" disabled={pending} className={btnGhost}>Schedule</button></div>
              )}
              <p className="mt-2 text-xs text-black/50">Scheduled newsletters go out at about 8–9 AM Eastern on that day.</p>
            </div>
            <div className="rounded-lg border border-black/10 bg-white p-5">
              <p className={labelCls}>Send now</p>
              <label className="mb-3 flex items-start gap-2 text-sm"><input type="checkbox" name="confirm" className="mt-1" />Send to all {subscribers} subscribers now</label>
              <button name="op" value="send" disabled={pending} className={btnGold}>{pending ? "Working…" : "Save & send now"}</button>
            </div>
          </>
        )}
      </div>
    </form>
  );
}
