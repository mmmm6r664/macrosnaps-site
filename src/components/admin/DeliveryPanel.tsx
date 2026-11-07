"use client";
import { useActionState, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { upload } from "@vercel/blob/client";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnPrimary } from "./ui";
import { setStage, saveGallery, addPhotos, removePhoto, publishGallery, type DeliveryState } from "@/app/admin/(panel)/bookings/delivery-actions";

function Msg({ s }: { s: DeliveryState }) {
  if (!s) return null;
  return <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>;
}

type Stage = { id: string; label: string };
type Photo = { id: number; url: string; file_name: string };
type Gallery = { title: string; message: string; download_url: string | null; status: string } | null;

export function StageForm({ id, stage, stages }: { id: number; stage: string; stages: Stage[] }) {
  const [s, act, pending] = useActionState(setStage, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <div>
        <label className={labelCls} htmlFor="stage">Order stage (what the client sees)</label>
        <select id="stage" name="stage" defaultValue={stage} className={inputCls}>{stages.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select>
      </div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="notify" defaultChecked className="accent-[#a8963b]" />Email the client about this update</label>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Update stage"}</button>
    </form>
  );
}

export function GalleryManager({ id, gallery, photos, blobReady, hasPhone }: { id: number; gallery: Gallery; photos: Photo[]; blobReady: boolean; hasPhone: boolean }) {
  const router = useRouter();
  const [details, saveAct, saving] = useActionState(saveGallery, undefined);
  const [pub, pubAct, publishing] = useActionState(publishGallery, undefined);
  const [progress, setProgress] = useState<{ done: number; total: number; failed: number } | null>(null);
  const [, startTransition] = useTransition();
  const published = gallery?.status === "published";

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    const list = Array.from(files).slice(0, 200);
    setProgress({ done: 0, total: list.length, failed: 0 });
    const done: { url: string; pathname: string; name: string; size: number }[] = [];
    let failed = 0, i = 0;
    const worker = async () => {
      while (i < list.length) {
        const f = list[i++];
        const safe = f.name.replace(/[^\w.\- ()]/g, "_").slice(-120) || "photo.jpg";
        try {
          const r = await upload(`galleries/${id}/${safe}`, f, { access: "public", handleUploadUrl: "/api/admin/gallery-upload", contentType: f.type || undefined });
          done.push({ url: r.url, pathname: r.pathname, name: f.name, size: f.size });
        } catch { failed++; }
        setProgress({ done: done.length + failed, total: list.length, failed });
      }
    };
    await Promise.all([worker(), worker(), worker()]);
    // Keep the client's original file order.
    done.sort((a, b) => list.findIndex((f) => f.name === a.name) - list.findIndex((f) => f.name === b.name));
    if (done.length) await addPhotos(id, done);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      <p className="text-sm">{published ? <span className="rounded bg-emerald-50 px-2 py-1 font-semibold text-emerald-800">Published: the client can see it</span> : <span className="rounded bg-black/5 px-2 py-1">Draft: the client can&apos;t see it yet</span>}</p>
      <form onSubmit={noReset(saveAct)} className="space-y-3">
        <input type="hidden" name="id" value={id} />
        <div><label className={labelCls} htmlFor="g-title">Gallery title</label><input id="g-title" name="title" defaultValue={gallery?.title ?? ""} maxLength={120} className={inputCls} placeholder="e.g. Sarah & Ahmed's Wedding" /></div>
        <div><label className={labelCls} htmlFor="g-msg">Message to the client</label><textarea id="g-msg" name="message" rows={3} defaultValue={gallery?.message ?? ""} maxLength={2000} className={inputCls} placeholder="Optional note shown above the photos" /></div>
        <div><label className={labelCls} htmlFor="g-dl">&ldquo;Download all&rdquo; link (Google Drive, Dropbox…)</label><input id="g-dl" name="download_url" type="url" defaultValue={gallery?.download_url ?? ""} className={inputCls} placeholder="https://drive.google.com/…" /></div>
        <Msg s={details} />
        <button disabled={saving} className={btnPrimary}>{saving ? "Saving…" : "Save details"}</button>
      </form>

      <div className="border-t border-black/10 pt-4">
        <p className={labelCls}>Photos ({photos.length})</p>
        {blobReady ? (
          <label className="flex cursor-pointer flex-col items-center gap-1 rounded border-2 border-dashed border-black/15 px-4 py-6 text-center text-sm hover:border-[#a8963b]">
            <span className="font-semibold">Choose photos to upload</span>
            <span className="text-xs text-black/50">JPG, PNG, WEBP or HEIC · up to 50 MB each · up to 200 at a time</span>
            <input type="file" multiple accept="image/jpeg,image/png,image/webp,image/heic,image/heif" className="sr-only" onChange={(e) => { onFiles(e.target.files); e.target.value = ""; }} disabled={!!progress && progress.done < progress.total} />
          </label>
        ) : (
          <p className="rounded bg-amber-50 px-3 py-2 text-sm text-amber-900">Photo storage isn&apos;t connected yet. You can still add a &ldquo;Download all&rdquo; link above and publish.</p>
        )}
        {progress && <p className="mt-2 text-sm">{progress.done < progress.total ? `Uploading ${progress.done} / ${progress.total}…` : `Uploaded ${progress.total - progress.failed} of ${progress.total}.`}{progress.failed ? ` ${progress.failed} failed.` : ""}</p>}
        {photos.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {photos.map((p) => (
              <div key={p.id} className="group relative aspect-square overflow-hidden rounded bg-black/5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.url} alt={p.file_name} loading="lazy" className="h-full w-full object-cover" />
                <button type="button" onClick={() => { if (confirm("Remove this photo from the gallery?")) startTransition(async () => { await removePhoto(id, p.id); router.refresh(); }); }}
                  className="absolute right-1 top-1 rounded bg-black/70 px-1.5 text-xs text-white opacity-0 group-hover:opacity-100 focus:opacity-100" aria-label={`Remove ${p.file_name}`}>✕</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <form onSubmit={noReset(pubAct)} className="space-y-3 border-t border-black/10 pt-4">
        <input type="hidden" name="id" value={id} />
        <input type="hidden" name="publish" value={published ? "0" : "1"} />
        {!published && hasPhone && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="sms" className="accent-[#a8963b]" />Also text the client</label>}
        <Msg s={pub} />
        <button disabled={publishing} className={published ? "rounded border border-black/20 px-4 py-2 text-sm" : btnPrimary}>{publishing ? "Working…" : published ? "Hide gallery from client" : "Publish & email the client"}</button>
      </form>
    </div>
  );
}
