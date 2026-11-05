"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const EXAMPLES = [
  "I need a conference photographer for my event in San Francisco",
  "Videographer for our 2-day summit in New York City",
  "Photos of our dishes for the new menu at our restaurant in Chicago",
  "Indian wedding photography in Edison, NJ",
  "Corporate holiday party photographer in Washington, DC",
  "Video ads for our dental practice in Houston",
  "Bar Mitzvah photographer and videographer in Boca Raton",
  "Trade show booth photos at the Las Vegas Convention Center",
  "Real estate photos and a 3D tour for a listing in Arlington, VA",
  "Live stream our keynote in Toronto",
];

type Result = { headline: string; url: string; bookUrl?: string; priceFrom?: number; note?: string; links: { label: string; href: string }[] };

export default function AskBox({ variant = "light", title = "Tell us what you need" }: { variant?: "light" | "dark"; title?: string }) {
  const [q, setQ] = useState("");
  const [ph, setPh] = useState("");
  const [res, setRes] = useState<Result | null>(null);
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const focused = useRef(false);

  // Typewriter placeholder cycling through example requests
  useEffect(() => {
    let i = 0, ch = 0, del = false, t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const full = EXAMPLES[i];
      if (!del) { ch++; if (ch > full.length) { del = true; t = setTimeout(tick, 1800); return; } }
      else { ch -= 2; if (ch <= 0) { del = false; ch = 0; i = (i + 1) % EXAMPLES.length; } }
      setPh(full.slice(0, Math.max(ch, 0)));
      t = setTimeout(tick, del ? 18 : 38);
    };
    t = setTimeout(tick, 600);
    return () => clearTimeout(t);
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const text = q.trim() || ph;
    if (text.length < 3) return;
    setBusy(true); setErr("");
    try {
      const r = await fetch(`/api/match?q=${encodeURIComponent(text)}`);
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setRes(j);
    } catch (x) { setErr(x instanceof Error ? x.message : "Please try again"); } finally { setBusy(false); }
  }

  const dark = variant === "dark";
  return (
    <div className="w-full">
      {title && <p className={`mb-3 font-serif text-2xl md:text-3xl ${dark ? "text-white" : "text-ink"}`}>{title}</p>}
      <form onSubmit={submit} className={`flex items-center gap-2 rounded-full border p-2 pl-6 shadow-xl transition focus-within:ring-2 focus-within:ring-gold ${dark ? "border-white/20 bg-white/95" : "border-black/10 bg-white"}`}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-gold-dark" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><circle cx="11" cy="11" r="7" /><path d="m20 20-3.5-3.5" /></svg>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onFocus={() => (focused.current = true)}
          placeholder={ph}
          aria-label="Describe the photography or videography you need"
          className="min-w-0 flex-1 bg-transparent py-3 text-base text-ink outline-none placeholder:text-muted"
        />
        <button disabled={busy} className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-gold text-black transition hover:scale-105 hover:bg-[#ddcb67] disabled:opacity-60" aria-label="Find the right service">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden><path d="M3 20.5 21 12 3 3.5l.01 6.6L15 12 3.01 13.9z" /></svg>
        </button>
      </form>
      {err && <p className="mt-3 text-sm text-red-600">{err}</p>}
      {res && (
        <div className="mt-4 rounded-2xl border border-gold/50 bg-white p-5 text-left text-ink shadow-lg" role="status">
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-gold-dark">Best match</p>
          <p className="mt-1 font-serif text-2xl">{res.headline}</p>
          {res.priceFrom && <p className="mt-1 text-sm text-muted">From ${res.priceFrom} for 2 hours · same published price for every client</p>}
          {res.note && <p className="mt-1 text-sm text-muted">{res.note}</p>}
          <div className="mt-4 flex flex-wrap gap-3">
            <Link href={res.url} className="btn-dark !py-2.5">View details</Link>
            {res.bookUrl && <Link href={res.bookUrl} className="btn-gold !py-2.5">Book & pay online</Link>}
          </div>
          {res.links.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
              {res.links.map((l) => <Link key={l.href} href={l.href} className="underline underline-offset-4 hover:text-gold-dark">{l.label}</Link>)}
            </div>
          )}
        </div>
      )}
      <p className={`mt-3 text-sm ${dark ? "text-white/75" : "text-muted"}`}>Describe your event or project and city. We&apos;ll point you to the right service, price and booking page in one click.</p>
    </div>
  );
}

/** Site-wide band above the footer (hidden on the homepage, which has the box in its hero). */
export function AskBand() {
  const path = usePathname();
  if (path === "/" || path.startsWith("/book")) return null;
  return (
    <section className="marble border-t border-black/5 px-4 py-16 md:px-6" data-reveal>
      <div className="mx-auto max-w-3xl text-center">
        <p className="eyebrow mb-2">Find the right crew</p>
        <AskBox title="Ask MacroSnaps what you need" />
      </div>
    </section>
  );
}
