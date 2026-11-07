"use client";
import { noReset } from "./noReset";
import { useActionState, useState } from "react";
import { saveAnnouncement, saveHero, saveFaqs, saveReviewUrl, type S } from "@/app/admin/(panel)/website/actions";
import { inputCls, labelCls, btnPrimary, btnGhost } from "./ui";

const Msg = ({ s }: { s: S }) => (s ? <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p> : null);

export function AnnouncementForm({ v }: { v: { enabled: boolean; text: string; link: string; linkText: string } }) {
  const [s, act, pending] = useActionState<S, FormData>(saveAnnouncement, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" name="enabled" defaultChecked={v.enabled} className="h-4 w-4 accent-[#a8963b]" />Show the banner at the top of every page</label>
      <div><label className={labelCls} htmlFor="a-text">Message</label><input id="a-text" name="text" defaultValue={v.text} maxLength={200} className={inputCls} placeholder="Now booking 2027 weddings: Saturdays are filling fast" /></div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className={labelCls} htmlFor="a-link">Link (optional)</label><input id="a-link" name="link" defaultValue={v.link} className={inputCls} placeholder="/book or https://…" /></div>
        <div><label className={labelCls} htmlFor="a-lt">Link text</label><input id="a-lt" name="linkText" defaultValue={v.linkText} maxLength={40} className={inputCls} placeholder="Book now" /></div>
      </div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save banner"}</button>
    </form>
  );
}

export function HeroForm({ v }: { v: { headline: string } }) {
  const [s, act, pending] = useActionState<S, FormData>(saveHero, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <div><label className={labelCls} htmlFor="h-head">Homepage headline (the main H1 that Google reads)</label><input id="h-head" name="headline" defaultValue={v.headline} maxLength={120} required className={inputCls} /></div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save headline"}</button>
    </form>
  );
}

export function FaqsForm({ v, custom }: { v: { q: string; a: string }[]; custom: boolean }) {
  const [s, act, pending] = useActionState<S, FormData>(saveFaqs, undefined);
  const [rows, setRows] = useState(v);
  const move = (i: number, d: number) => setRows((r) => { const n = [...r]; const j = i + d; if (j < 0 || j >= n.length) return r; [n[i], n[j]] = [n[j], n[i]]; return n; });
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      {rows.map((f, i) => (
        <div key={i} className="rounded border border-black/10 p-3">
          <div className="mb-2 flex items-center justify-between text-xs text-black/50">
            <span>Question {i + 1}</span>
            <span className="flex gap-3"><button type="button" onClick={() => move(i, -1)}>↑</button><button type="button" onClick={() => move(i, 1)}>↓</button><button type="button" className="text-red-700" onClick={() => setRows((r) => r.filter((_, j) => j !== i))}>Remove</button></span>
          </div>
          <input name="q" value={f.q} onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, q: e.target.value } : x)))} className={`${inputCls} mb-2 font-semibold`} aria-label="Question" />
          <textarea name="a" value={f.a} onChange={(e) => setRows((r) => r.map((x, j) => (j === i ? { ...x, a: e.target.value } : x)))} rows={3} className={inputCls} aria-label="Answer" />
        </div>
      ))}
      <button type="button" onClick={() => setRows((r) => [...r, { q: "", a: "" }])} className={btnGhost}>+ Add question</button>
      <Msg s={s} />
      <div className="flex flex-wrap gap-2">
        <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save FAQs"}</button>
        {custom && <button name="reset" value="1" disabled={pending} className={btnGhost}>Restore original FAQs</button>}
      </div>
    </form>
  );
}

export function ReviewUrlForm({ v }: { v: string }) {
  const [s, act, pending] = useActionState<S, FormData>(saveReviewUrl, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <div>
        <label className={labelCls} htmlFor="rv-url">Google review link</label>
        <input id="rv-url" name="url" type="url" defaultValue={v} className={inputCls} placeholder="https://g.page/r/…/review" />
        <p className="mt-1 text-xs text-black/50">In your Google Business Profile, click &ldquo;Ask for reviews&rdquo; and copy the link. Clients who rate you 4 or 5 stars in their portal get an email asking for a Google review. Lower ratings come to you privately instead.</p>
      </div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Save link"}</button>
    </form>
  );
}
