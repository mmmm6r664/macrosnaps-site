"use client";
// Portfolio album cards with category filters.
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";

type Card = { slug: string; title: string; group: string; count: number; cover?: string; eventType: string };

export default function AlbumGrid({ albums }: { albums: Card[] }) {
  const groups = ["All", ...Array.from(new Set(albums.map((a) => a.group)))];
  const [g, setG] = useState("All");
  const list = g === "All" ? albums : albums.filter((a) => a.group === g);
  return (
    <div>
      <div className="mb-8 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter galleries">
        {groups.map((x) => (
          <button key={x} type="button" role="tab" aria-selected={g === x} onClick={() => setG(x)}
            className={`border px-4 py-2 font-sans text-xs font-semibold uppercase tracking-widest transition ${g === x ? "border-black bg-black text-gold" : "border-black/15 bg-white hover:border-gold"}`}>
            {x} {x !== "All" && <span className="text-muted">({albums.filter((a) => a.group === x).length})</span>}
          </button>
        ))}
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((a) => (
          <Link key={a.slug} href={`/portfolio/${a.slug}`} className="group block bg-white shadow-sm transition hover:shadow-lg">
            <div className="relative aspect-[4/3] overflow-hidden bg-black/5">
              {a.cover && <Image src={a.cover} alt={a.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" className="object-cover transition duration-500 group-hover:scale-105" />}
            </div>
            <div className="p-5">
              <p className="text-xs font-semibold uppercase tracking-[.2em] text-gold-dark">{a.eventType}</p>
              <h3 className="mt-1 font-serif text-xl leading-snug">{a.title}</h3>
              <p className="mt-1 text-sm text-muted">{a.count} photos · View gallery →</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
