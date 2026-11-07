"use client";
import { useState } from "react";
import { TOUR_CATEGORIES } from "@/data/virtualTours";

/** Live Matterport tours. Each loads only when clicked, so the page stays fast. */
function Tour({ id, label }: { id: string; label: string }) {
  const [on, setOn] = useState(false);
  return (
    <div className="relative aspect-video overflow-hidden bg-black shadow-sm">
      {on ? (
        <iframe src={`https://my.matterport.com/show/?m=${id}&play=1&qs=1`} title={label} allow="xr-spatial-tracking; fullscreen" allowFullScreen className="absolute inset-0 h-full w-full border-0" />
      ) : (
        <button onClick={() => setOn(true)} className="group absolute inset-0 flex items-center justify-center" aria-label={`Open the ${label} 3D tour`}>
          {/* eslint-disable-next-line @next/next/no-img-element -- Matterport's own thumbnail */}
          <img src={`https://my.matterport.com/api/v1/player/models/${id}/thumb?width=800`} alt={label} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-80 transition group-hover:scale-105 group-hover:opacity-100" />
          <span className="relative rounded-full bg-black/70 px-5 py-3 text-sm font-semibold uppercase tracking-widest text-white ring-1 ring-gold transition group-hover:bg-gold group-hover:text-black">▶ Explore in 3D</span>
        </button>
      )}
    </div>
  );
}

export default function TourGallery() {
  const [cat, setCat] = useState(0);
  return (
    <div>
      <div className="mb-6 flex flex-wrap justify-center gap-2" role="tablist">
        {TOUR_CATEGORIES.map((c, i) => (
          <button key={c.name} role="tab" aria-selected={i === cat} onClick={() => setCat(i)} className={`border px-4 py-2 text-sm uppercase tracking-wider transition ${i === cat ? "border-gold bg-gold text-black" : "border-black/15 hover:border-gold-dark"}`}>{c.name}</button>
        ))}
      </div>
      <div className="grid gap-5 md:grid-cols-2">
        {TOUR_CATEGORIES[cat].tours.map((id, i) => <Tour key={id} id={id} label={`${TOUR_CATEGORIES[cat].name} tour ${i + 1}`} />)}
      </div>
    </div>
  );
}
