"use client";
import { cleanTyped, MAX_QUERY } from "@/lib/safeInput";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Hit = { slug: string; label: string; type: "city" | "region" };

export default function CitySearch({ dark = true, placeholder = "Find your city or state…" }: { dark?: boolean; placeholder?: string }) {
  const [q, setQ] = useState("");
  const [hits, setHits] = useState<Hit[]>([]);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timer.current) clearTimeout(timer.current);
    if (q.trim().length < 2) { setHits([]); return; }
    timer.current = setTimeout(async () => {
      try {
        const r = await fetch(`/api/cities?q=${encodeURIComponent(q)}`);
        setHits(await r.json());
        setActive(0);
      } catch { setHits([]); }
    }, 150);
  }, [q]);

  const go = (h?: Hit) => { if (h) { router.push(`/photographers/${h.slug}`); setQ(""); setHits([]); } };

  return (
    <div className="relative">
      <input
        value={q}
        onChange={(e) => setQ(cleanTyped(e.target.value))}
          maxLength={MAX_QUERY}
          spellCheck={false}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, hits.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
          if (e.key === "Enter") { e.preventDefault(); go(hits[active]); }
        }}
        placeholder={placeholder}
        aria-label="Search cities"
        className={`w-full border px-4 py-3 text-sm outline-none ${dark ? "border-white/25 bg-white/5 text-white placeholder:text-white/50 focus:border-gold" : "border-black/20 bg-white text-ink focus:border-gold-dark"}`}
      />
      {hits.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-50 mt-1 max-h-80 overflow-auto border border-black/10 bg-white text-ink shadow-xl">
          {hits.map((h, i) => (
            <li key={h.slug}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); go(h); }} onMouseEnter={() => setActive(i)}
                className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm ${i === active ? "bg-gold/20" : ""}`}>
                <span>{h.label}</span><span className="text-xs text-muted">{h.type === "region" ? "State / province" : "City"}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
