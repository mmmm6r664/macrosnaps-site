"use client";
import { useState } from "react";
import type { Video } from "@/data/videos";

function LiteYouTube({ v }: { v: Video }) {
  const [play, setPlay] = useState(false);
  return (
    <figure>
      <div className="relative aspect-video overflow-hidden bg-black">
        {play ? (
          <iframe className="absolute inset-0 h-full w-full" src={`https://www.youtube-nocookie.com/embed/${v.id}?autoplay=1&rel=0`} title={v.title} allow="autoplay; encrypted-media; picture-in-picture; fullscreen" allowFullScreen />
        ) : (
          <button type="button" onClick={() => setPlay(true)} className="group absolute inset-0" aria-label={`Play video: ${v.title}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`https://i.ytimg.com/vi/${v.id}/hqdefault.jpg`} alt="" loading="lazy" className="h-full w-full object-cover opacity-90 transition group-hover:scale-105 group-hover:opacity-100" />
            <span className="absolute left-1/2 top-1/2 grid h-14 w-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-gold text-black shadow-lg transition group-hover:scale-110">
              <svg viewBox="0 0 24 24" className="ml-1 h-6 w-6" fill="currentColor" aria-hidden><path d="M8 5v14l11-7z" /></svg>
            </span>
          </button>
        )}
      </div>
      <figcaption className="mt-2 text-sm text-inherit opacity-90">{v.title}</figcaption>
    </figure>
  );
}

export default function VideoGrid({ videos }: { videos: Video[] }) {
  if (!videos.length) return null;
  return <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{videos.map((v) => <LiteYouTube key={v.id} v={v} />)}</div>;
}
