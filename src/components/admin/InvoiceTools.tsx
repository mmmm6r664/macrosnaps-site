"use client";
import { useActionState, useState } from "react";
import { invoiceEmailAction, type PreviewS } from "@/app/admin/(panel)/invoices/actions";
import { noReset } from "./noReset";
import { btnGold, btnGhost, previewDoc, PREVIEW_SANDBOX } from "./ui";

/** Copy-to-clipboard for the pay link, plus a ready-to-text message. */
export function CopyLink({ url, text }: { url: string; text: string }) {
  const [done, setDone] = useState("");
  const copy = (v: string, what: string) => navigator.clipboard?.writeText(v).then(() => { setDone(what); setTimeout(() => setDone(""), 2500); });
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <input readOnly value={url} className="min-w-0 flex-1 rounded border border-black/15 bg-black/[0.03] px-3 py-2 text-sm" onFocus={(e) => e.target.select()} aria-label="Pay link" />
        <button type="button" onClick={() => copy(url, "link")} className={btnGhost}>Copy link</button>
        <a href={url} target="_blank" rel="noopener" className={btnGhost}>Open ↗</a>
      </div>
      <div>
        <p className="mb-1 text-xs uppercase tracking-wider text-black/50">Text message</p>
        <textarea readOnly rows={3} value={text} className="w-full rounded border border-black/15 bg-black/[0.03] px-3 py-2 text-sm" aria-label="Text message" />
        <div className="mt-1 flex gap-2">
          <button type="button" onClick={() => copy(text, "message")} className={btnGhost}>Copy message</button>
          <a href={`sms:?&body=${encodeURIComponent(text)}`} className={btnGhost}>Open in Messages</a>
        </div>
      </div>
      {done && <p role="status" className="text-sm text-emerald-700">Copied the {done}.</p>}
    </div>
  );
}

/** Preview the MacroSnaps invoice email, then send it. */
export function InvoiceEmail({ id, draft }: { id: string; draft: boolean }) {
  const [s, act, pending] = useActionState<PreviewS, FormData>(invoiceEmailAction, undefined);
  return (
    <form onSubmit={noReset(act)}>
      <input type="hidden" name="id" value={id} />
      <div className="flex flex-wrap gap-2">
        <button name="mode" value="preview" disabled={pending} className={btnGhost}>{pending ? "Working…" : "Preview email"}</button>
        <button name="mode" value="send" disabled={pending || !s?.html} title={s?.html ? "" : "Preview first"} className={btnGold}>{draft ? "Finalize & email from MacroSnaps" : "Email from MacroSnaps"}</button>
      </div>
      {(s?.error || s?.ok) && <p role="status" className={`mt-3 rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
      {s?.html && (
        <div className="mt-4">
          <p className="text-sm"><b>From:</b> MacroSnaps &lt;info@e.macrosnaps.com&gt;<br /><b>To:</b> {s.to}<br /><b>Subject:</b> {s.subject}</p>
          {draft && <p className="mt-1 text-xs text-black/50">Preview of a draft: the invoice number and pay link are filled in when it&apos;s finalized.</p>}
          <iframe title="Invoice email preview" srcDoc={previewDoc(s.html)} sandbox={PREVIEW_SANDBOX} className="mt-2 h-[760px] w-full rounded border border-black/10" />
        </div>
      )}
    </form>
  );
}
