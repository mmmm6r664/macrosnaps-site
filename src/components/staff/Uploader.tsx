"use client";
import { useState } from "react";
import { inputCls, labelCls, btnGold } from "@/components/admin/ui";

type Shoot = { id: number; label: string };
type Row = { name: string; size: number; pct: number; status: "waiting" | "uploading" | "done" | "error"; error?: string };
const CHUNK = 8 * 1024 * 1024; // 8 MB pieces (a multiple of 256 KB, as Google requires)

async function putResumable(url: string, file: File, onPct: (p: number) => void) {
  let start = 0;
  while (start < file.size) {
    const end = Math.min(start + CHUNK, file.size);
    const r = await fetch(url, { method: "PUT", headers: { "Content-Range": `bytes ${start}-${end - 1}/${file.size}` }, body: file.slice(start, end) });
    if (r.status === 308) { const range = r.headers.get("Range"); start = range ? Number(range.split("-")[1]) + 1 : end; }
    else if (r.ok) { onPct(100); return; }
    else throw new Error(`Upload failed (${r.status})`);
    onPct(Math.round((start / file.size) * 100));
  }
}

export default function Uploader({ shoots }: { shoots: Shoot[] }) {
  const [bookingId, setBookingId] = useState(shoots[0]?.id ?? 0);
  const [files, setFiles] = useState<File[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [busy, setBusy] = useState(false);
  const set = (i: number, p: Partial<Row>) => setRows((r) => r.map((x, j) => (j === i ? { ...x, ...p } : x)));

  async function start() {
    setBusy(true);
    setRows(files.map((f) => ({ name: f.name, size: f.size, pct: 0, status: "waiting" })));
    let ok = 0;
    for (let i = 0; i < files.length; i++) {
      const f = files[i];
      set(i, { status: "uploading" });
      try {
        const r = await fetch("/api/staff/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, name: f.name, type: f.type || "application/octet-stream", size: f.size }) });
        const j = await r.json();
        if (!r.ok) throw new Error(j.error || "Couldn't start the upload");
        await putResumable(j.url, f, (pct) => set(i, { pct }));
        set(i, { status: "done", pct: 100 });
        ok++;
      } catch (e) {
        set(i, { status: "error", error: e instanceof Error ? e.message : "Failed" });
      }
    }
    if (ok) await fetch("/api/staff/upload", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ bookingId, done: true, count: ok }) });
    setBusy(false);
    setFiles([]);
  }

  if (!shoots.length) return <p className="rounded border border-dashed border-black/15 p-8 text-center text-sm text-black/50">You can upload files once you&apos;re confirmed for a shoot.</p>;
  return (
    <div className="space-y-4 rounded-lg border border-black/10 bg-white p-5">
      <div><label className={labelCls} htmlFor="bk">Shoot</label><select id="bk" value={bookingId} onChange={(e) => setBookingId(Number(e.target.value))} className={inputCls}>{shoots.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}</select></div>
      <div><label className={labelCls} htmlFor="files">Files (RAW, JPG, video or zip)</label><input id="files" type="file" multiple onChange={(e) => setFiles([...(e.target.files ?? [])])} className="block w-full text-sm" disabled={busy} /></div>
      {files.length > 0 && <p className="text-sm text-black/60">{files.length} file{files.length === 1 ? "" : "s"}, {(files.reduce((a, f) => a + f.size, 0) / 1024 ** 3).toFixed(2)} GB</p>}
      <button onClick={start} disabled={busy || !files.length} className={btnGold}>{busy ? "Uploading… keep this page open" : "Upload to MacroSnaps"}</button>
      {rows.length > 0 && (
        <ul className="space-y-1 text-sm">
          {rows.map((r, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-56 truncate">{r.name}</span>
              <span className="h-2 flex-1 overflow-hidden rounded bg-black/10"><span className={`block h-full ${r.status === "error" ? "bg-red-500" : "bg-[#ccba56]"}`} style={{ width: `${r.pct}%` }} /></span>
              <span className="w-28 text-right text-xs">{r.status === "error" ? <span className="text-red-700">{r.error}</span> : r.status === "done" ? "Done" : r.status === "uploading" ? `${r.pct}%` : "Waiting"}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
