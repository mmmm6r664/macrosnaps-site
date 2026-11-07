"use client";
// Pixieset-style gallery: masonry grid, full-screen viewer with keyboard/swipe navigation, per-photo download.
import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Photo = { id: number; url: string; file_name: string };
const thumb = (u: string) => u; // Blob URLs are served as-is; next/image is skipped for private client files.

export default function GalleryView({ photos, title }: { photos: Photo[]; title: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const touch = useRef<number | null>(null);
  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + photos.length) % photos.length)), [photos.length]);
  useEffect(() => {
    if (open === null) return;
    const k = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(null); if (e.key === "ArrowRight") go(1); if (e.key === "ArrowLeft") go(-1); };
    window.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { window.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, go]);

  return (
    <>
      <div className="columns-2 gap-2 md:columns-3 lg:columns-4">
        {photos.map((p, i) => (
          <button key={p.id} type="button" onClick={() => setOpen(i)} className="group relative mb-2 block w-full overflow-hidden bg-black/5" aria-label={`Open photo ${i + 1}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={thumb(p.url)} alt={`${title}, photo ${i + 1}`} loading="lazy" className="w-full transition duration-300 group-hover:scale-[1.02] group-hover:opacity-90" />
          </button>
        ))}
      </div>
      {open !== null && typeof document !== "undefined" &&
        createPortal(
          <div className="fixed inset-0 z-[1000] flex flex-col bg-black/95 text-white" role="dialog" aria-modal="true" aria-label="Photo viewer"
            onTouchStart={(e) => (touch.current = e.touches[0].clientX)}
            onTouchEnd={(e) => { if (touch.current === null) return; const dx = e.changedTouches[0].clientX - touch.current; if (Math.abs(dx) > 50) go(dx < 0 ? 1 : -1); touch.current = null; }}>
            <div className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
              <span className="text-white/70">{open + 1} / {photos.length}</span>
              <div className="flex items-center gap-2">
                <a href={`${photos[open].url}?download=1`} download={photos[open].file_name || `macrosnaps-${open + 1}.jpg`} className="border border-white/30 px-3 py-1.5 hover:border-gold hover:text-gold">Download</a>
                <button type="button" onClick={() => setOpen(null)} className="px-3 py-1.5 text-2xl leading-none hover:text-gold" aria-label="Close">×</button>
              </div>
            </div>
            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 pb-4 md:px-16">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={photos[open].url} alt={`${title}, photo ${open + 1}`} className="max-h-full max-w-full object-contain" />
              {photos.length > 1 && (
                <>
                  <button type="button" onClick={() => go(-1)} className="absolute left-1 top-1/2 hidden -translate-y-1/2 p-3 text-4xl text-white/70 hover:text-gold md:block" aria-label="Previous photo">‹</button>
                  <button type="button" onClick={() => go(1)} className="absolute right-1 top-1/2 hidden -translate-y-1/2 p-3 text-4xl text-white/70 hover:text-gold md:block" aria-label="Next photo">›</button>
                </>
              )}
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}
