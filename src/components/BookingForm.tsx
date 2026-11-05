"use client";
import TermsList from "@/components/TermsList";
import { TERMS_VERSION } from "@/lib/terms";
import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { createPortal } from "react-dom";
import { RATES, quoteHourly, billedHours as billed, durationHours, type Kind } from "@/lib/pricing";

type Pkg = { id: string; name: string; price: number; priceNote?: string; features: string[]; hours?: number };
type Svc = { slug: string; name: string; kind: string; group: string; packages: Pkg[] };
type CityOpt = { slug: string; label: string };
type Session = { key: number; date: string; start: string; end: string; venue: string; extraCrew: number };

const GROUPS: Record<string, string> = { corporate: "Conferences & Corporate", wedding: "Weddings & Engagements", business: "Business & Commercial", personal: "Portraits & Family", post: "Editing" };
const MAX_SESSIONS = 10;

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fromMin = (n: number) => { const x = ((n % 1440) + 1440) % 1440; return `${String(Math.floor(x / 60)).padStart(2, "0")}:${String(x % 60).padStart(2, "0")}`; };
const durationH = durationHours;
const fmtTime = (t: string) => { if (!t) return ""; const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

export default function BookingForm({ services, cities, initial }: { services: Svc[]; cities: CityOpt[]; initial: { service?: string; package?: string; city?: string; cancelled?: boolean } }) {
  const rates = RATES;
  const [addCompanion, setAddCompanion] = useState(false);
  const [serviceSlug, setServiceSlug] = useState(services.find((s) => s.slug === initial.service)?.slug ?? services[0].slug);
  const service = services.find((s) => s.slug === serviceSlug)!;
  const hourly = service.packages.every((p) => p.hours) && (service.kind === "photo" || service.kind === "video");
  const rate = service.kind === "video" ? rates.video : rates.photo;
  const initialPkg = service.packages.find((p) => p.id === initial.package);
  const [pkgId, setPkgId] = useState(initialPkg?.id ?? service.packages[0].id);
  const pkg = service.packages.find((p) => p.id === pkgId) ?? service.packages[0];
  const [location, setLocation] = useState(cities.find((c) => c.slug === initial.city)?.label ?? "");
  const defaultHours = initialPkg?.hours ?? rates.minHours;
  const [sessions, setSessions] = useState<Session[]>([{ key: 1, date: "", start: "", end: "", venue: "", extraCrew: 0 }]);
  const [state, setState] = useState<"idle" | "sending" | "requested" | "error">("idle");
  const [signOpen, setSignOpen] = useState(false);
  const [signature, setSignature] = useState("");
  const [accepted, setAccepted] = useState(false);
  const pending = useRef<Record<string, FormDataEntryValue> | null>(null);
  const [error, setError] = useState("");
  const today = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);

  const grouped = useMemo(() => {
    const g: Record<string, Svc[]> = {};
    for (const s of services) (g[s.group] ||= []).push(s);
    return g;
  }, [services]);

  // Price per session: hourly services use the published rate (min hours per day); package services use the package price.
  const billedHours = billed;
  const kind = service.kind as Kind;
  const quote = hourly ? quoteHourly(kind, sessions, addCompanion) : null;
  const sessionPrice = (s: Session) => (hourly ? quoteHourly(kind, [s], addCompanion).total : pkg.price);
  const total = quote ? quote.total : pkg.price * sessions.length;
  const other = kind === "photo" ? "Videography" : "Photography";
  const otherRate = kind === "photo" ? rates.video : rates.photo;
  const shiftEnd = (s: Session, delta: number) => {
    if (!s.start) return;
    const h = Math.min(Math.max(billed(s) + delta, rates.minHours), rates.maxHours);
    update(s.key, { end: fromMin(toMin(s.start) + h * 60) });
  };

  const update = (key: number, patch: Partial<Session>) =>
    setSessions((list) => list.map((s) => {
      if (s.key !== key) return s;
      const next = { ...s, ...patch };
      // Setting a start time fills a sensible end time
      if (patch.start !== undefined && patch.start && !s.end) next.end = fromMin(toMin(patch.start) + (hourly ? defaultHours : pkg.hours ?? rates.minHours) * 60);
      return next;
    }));
  const addSession = () =>
    setSessions((list) => {
      const last = list[list.length - 1];
      const nextDate = last.date ? new Date(new Date(last.date + "T12:00:00").getTime() + 86400000).toISOString().slice(0, 10) : "";
      return [...list, { key: Date.now(), date: nextDate, start: last.start, end: last.end, venue: last.venue, extraCrew: last.extraCrew }];
    });

  // Step 1: the form is valid, so open the Terms and Conditions popup for signature.
  function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    pending.current = Object.fromEntries(new FormData(e.currentTarget).entries());
    setError("");
    setSignOpen(true);
  }

  // Step 2: signed, so create the checkout.
  async function signAndPay() {
    const f = pending.current ?? {};
    setSignOpen(false);
    setState("sending");
    setError("");
    const citySlug = cities.find((c) => c.label.toLowerCase() === location.trim().toLowerCase())?.slug ?? "";
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, service: service.slug, package: pkg.id, location, citySlug, agree: true, signature: signature.trim(), termsVersion: TERMS_VERSION, sessions: sessions.map(({ date, start, end, venue, extraCrew }) => ({ date, start, end, venue, extraCrew })), addCompanion: hourly && addCompanion }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      if (json.url) window.location.href = json.url;
      else if (json.requested) setState("requested");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "requested")
    return (
      <div className="border border-gold bg-white p-8 text-center">
        <h2 className="font-serif text-3xl">Booking request received</h2>
        <p className="mt-3 text-muted">Thank you! Our team will confirm availability and send you a secure payment link shortly.</p>
      </div>
    );

  const field = "w-full border border-black/15 bg-white px-3 py-3 outline-none focus:border-gold-dark";
  const label = "mb-1.5 block text-xs font-semibold uppercase tracking-[.15em] text-muted";

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-3">
      <div className="space-y-10 lg:col-span-2">
        {initial.cancelled && <p className="border border-black/10 bg-marble p-4 text-sm">Payment was cancelled — your booking hasn&apos;t been made. You can try again below.</p>}

        <fieldset>
          <legend className="mb-4 font-serif text-2xl">1. Choose your service</legend>
          <select className={field} value={serviceSlug} onChange={(e) => { const s = services.find((x) => x.slug === e.target.value)!; setServiceSlug(s.slug); setPkgId(s.packages[0].id); }} aria-label="Service">
            {Object.entries(grouped).map(([g, list]) => (
              <optgroup key={g} label={GROUPS[g] ?? g}>{list.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</optgroup>
            ))}
          </select>
          {hourly ? (
            <p className="mt-3 text-sm text-muted">
              {service.kind === "video" ? "Videography" : "Photography"}: <strong>${rate.first}</strong> for the first hour + <strong>${rate.extra}</strong> for each additional hour, {rates.minHours}-hour minimum per day. Same published price for every client.
            </p>
          ) : (
            <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {service.packages.map((p) => (
                <label key={p.id} className={`cursor-pointer border p-4 transition ${p.id === pkg.id ? "border-gold-dark bg-gold/10 ring-1 ring-gold-dark" : "border-black/15 bg-white hover:border-black/40"}`}>
                  <input type="radio" name="pkg" className="sr-only" checked={p.id === pkg.id} onChange={() => setPkgId(p.id)} />
                  <span className="block text-sm font-semibold">{p.name}</span>
                  <span className="mt-1 block font-serif text-2xl">${p.price.toLocaleString()}</span>
                  {p.priceNote && <span className="block text-xs text-muted">{p.priceNote}</span>}
                </label>
              ))}
            </div>
          )}
        </fieldset>

        <fieldset>
          <legend className="mb-1 font-serif text-2xl">2. Dates & times</legend>
          <p className="mb-5 text-sm text-muted">Multi-day conference or several events? Add each day or event separately — each one is priced at the published rate.</p>
          <div className="space-y-4">
            {sessions.map((s, i) => {
              const d = durationH(s);
              return (
                <div key={s.key} className="border border-black/10 bg-white p-5">
                  <div className="mb-3 flex items-center justify-between">
                    <p className="font-semibold">{sessions.length > 1 ? `Day / event ${i + 1}` : "Your event"}</p>
                    <div className="flex items-center gap-4">
                      {s.start && s.end && <span className="text-sm text-muted">{hourly ? `${billedHours(s)} hrs billed · ` : ""}<strong className="text-ink">${sessionPrice(s).toLocaleString()}</strong></span>}
                      {sessions.length > 1 && <button type="button" onClick={() => setSessions((l) => l.filter((x) => x.key !== s.key))} className="text-sm text-red-700 underline">Remove</button>}
                    </div>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    <div><label className={label} htmlFor={`date-${s.key}`}>Date *</label><input id={`date-${s.key}`} type="date" min={today} required value={s.date} onChange={(e) => update(s.key, { date: e.target.value })} className={field} /></div>
                    <div><label className={label} htmlFor={`start-${s.key}`}>Start time *</label><input id={`start-${s.key}`} type="time" required value={s.start} onChange={(e) => update(s.key, { start: e.target.value })} className={field} /></div>
                    <div><label className={label} htmlFor={`end-${s.key}`}>End time *</label><input id={`end-${s.key}`} type="time" required value={s.end} onChange={(e) => update(s.key, { end: e.target.value })} className={field} /></div>
                  </div>
                  {hourly && (
                    <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span className="text-muted">Hours</span>
                        <button type="button" onClick={() => shiftEnd(s, -1)} disabled={!s.start} className="h-8 w-8 border border-black/20 hover:border-gold-dark disabled:opacity-40" aria-label="One hour less">−</button>
                        <span className="w-8 text-center font-semibold">{s.start && s.end ? billedHours(s) : "–"}</span>
                        <button type="button" onClick={() => shiftEnd(s, 1)} disabled={!s.start} className="h-8 w-8 border border-black/20 hover:border-gold-dark disabled:opacity-40" aria-label="One more hour">+</button>
                      </div>
                      <label className="flex items-center gap-2">
                        <span className="text-muted">Additional {kind === "photo" ? "photographers" : "videographers"}</span>
                        <select value={s.extraCrew} onChange={(e) => update(s.key, { extraCrew: Number(e.target.value) })} className="border border-black/20 bg-white px-2 py-1">
                          {Array.from({ length: rates.maxCrew + 1 }, (_, n) => <option key={n} value={n}>{n}</option>)}
                        </select>
                        <span className="text-xs text-muted">+${rate.extra}/hr each</span>
                      </label>
                    </div>
                  )}
                  {s.start && s.end && hourly && d < rates.minHours && <p className="mt-2 text-sm text-muted">Minimum booking is {rates.minHours} hours per day, so this day is billed as {rates.minHours} hours.</p>}
                  {s.start && s.end && hourly && d % 1 > 0 && d >= rates.minHours && <p className="mt-2 text-sm text-muted">Coverage is billed in whole hours ({d.toFixed(1)} hrs → {billedHours(s)} hrs).</p>}
                  {sessions.length > 1 && (
                    <div className="mt-3"><label className={label} htmlFor={`venue-${s.key}`}>Venue for this day (if different)</label><input id={`venue-${s.key}`} value={s.venue} onChange={(e) => update(s.key, { venue: e.target.value })} className={field} placeholder="Leave blank if same venue" /></div>
                  )}
                </div>
              );
            })}
          </div>
          {sessions.length < MAX_SESSIONS && (
            <button type="button" onClick={addSession} className="mt-4 inline-flex items-center gap-2 border border-dashed border-gold-dark px-5 py-3 text-sm font-semibold uppercase tracking-[.12em] text-ink transition hover:bg-gold/10">
              <span className="text-lg leading-none">+</span> Add another day or event
            </button>
          )}
        </fieldset>

        {hourly && (
          <label className={`flex cursor-pointer gap-4 border-2 p-5 transition ${addCompanion ? "border-gold-dark bg-gold/10" : "border-dashed border-gold bg-white hover:bg-gold/5"}`}>
            <input type="checkbox" checked={addCompanion} onChange={(e) => setAddCompanion(e.target.checked)} className="mt-1 h-5 w-5 accent-[#a8963b]" />
            <span>
              <span className="block font-serif text-xl">Would you like to add {other.toLowerCase()} as well?</span>
              <span className="mt-1 block text-sm text-muted">
                {kind === "photo"
                  ? "Add a videographer for the same hours and get an edited highlight video (music of your choice, re-edit included) alongside your photos."
                  : "Add a photographer for the same hours and get a retouched, high-resolution photo gallery alongside your video."}{" "}
                ${otherRate.first} first hour + ${otherRate.extra} each additional hour.
              </span>
            </span>
          </label>
        )}

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 font-serif text-2xl sm:col-span-2">3. Where</legend>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="location">City *</label>
            <input id="location" list="city-list" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Start typing your city, e.g. San Francisco, CA" className={field} autoComplete="off" />
            <datalist id="city-list">{cities.map((c) => <option key={c.slug} value={c.label} />)}</datalist>
            <p className="mt-1 text-xs text-muted">We cover every US state, Washington, DC, Ontario and Quebec.</p>
          </div>
          <div className="sm:col-span-2"><label className={label} htmlFor="address">Venue name & address *</label><input id="address" name="address" required className={field} placeholder="e.g. Moscone Center, 747 Howard St" /></div>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 font-serif text-2xl sm:col-span-2">4. Your details</legend>
          <div><label className={label} htmlFor="name">Full name *</label><input id="name" name="name" required className={field} autoComplete="name" /></div>
          <div><label className={label} htmlFor="email">Email *</label><input id="email" name="email" type="email" required className={field} autoComplete="email" /></div>
          <div><label className={label} htmlFor="phone">Phone *</label><input id="phone" name="phone" type="tel" required className={field} autoComplete="tel" /></div>
          <div><label className={label} htmlFor="company">Company (optional)</label><input id="company" name="company" className={field} autoComplete="organization" /></div>
          <div className="sm:col-span-2"><label className={label} htmlFor="notes">Notes for your crew</label><textarea id="notes" name="notes" rows={3} maxLength={480} className={field} placeholder="Agenda, key people or moments, dress code, parking…" /></div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-48 lg:self-start">
        <div className="marble border border-black/10 p-6">
          <h2 className="font-serif text-2xl">Your booking</h2>
          <p className="mt-4 font-semibold">{service.name}</p>
          {!hourly && <p className="text-sm text-muted">{pkg.name}</p>}
          {quote && sessions.every((x) => x.date && x.start && x.end) ? (
            <ul className="mt-3 space-y-1.5 text-sm">{quote.lines.map((l, i) => <li key={i} className="flex justify-between gap-3"><span className="text-muted">{l.label}</span><span>${l.amount.toLocaleString()}</span></li>)}</ul>
          ) : (
          <ul className="mt-3 space-y-1.5 text-sm">
            {sessions.map((s, i) => (
              <li key={s.key} className="flex justify-between gap-3">
                <span className="text-muted">{s.date ? new Date(s.date + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }) : `Day ${i + 1}`}{s.start && s.end ? ` · ${fmtTime(s.start)}–${fmtTime(s.end)}` : ""}</span>
                <span>${sessionPrice(s).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          )}
          {!hourly && <ul className="mt-3 space-y-1 text-xs text-muted">{pkg.features.map((f) => <li key={f}>• {f}</li>)}</ul>}
          <div className="mt-5 flex items-baseline justify-between border-t border-black/10 pt-4">
            <span className="text-sm uppercase tracking-widest">Total</span>
            <span className="font-serif text-4xl">${total.toLocaleString()}</span>
          </div>
          <p className="mt-5 text-xs leading-relaxed text-muted">Next, you&apos;ll review and sign our <Link href="/terms" className="underline" target="_blank">Terms and Conditions</Link>. All bookings are non-refundable.</p>
          <button disabled={state === "sending"} className="btn-gold mt-5 w-full">{state === "sending" ? "Redirecting…" : "Review terms & continue to payment"}</button>
          {state === "error" && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <p className="mt-4 text-center text-xs text-muted">Secure card payment by Stripe. Planning something larger? <Link href="/corporate" className="underline">Talk to our team</Link>.</p>
        </div>
      </aside>

      {signOpen && createPortal(
        <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4" style={{ backgroundColor: "rgba(0,0,0,0.72)" }} role="dialog" aria-modal="true" aria-labelledby="terms-title" onKeyDown={(e) => e.key === "Escape" && setSignOpen(false)}>
          <div className="flex max-h-[90vh] w-full max-w-2xl flex-col bg-white shadow-2xl">
            <div className="border-b border-black/10 px-6 py-4">
              <h2 id="terms-title" className="font-serif text-2xl">Terms and Conditions</h2>
              <p className="text-xs text-muted">Please read and sign to confirm your booking.</p>
            </div>
            <div className="flex-1 overflow-y-auto px-6 py-5"><TermsList compact /></div>
            <div className="border-t border-black/10 bg-[#faf8f3] px-6 py-5">
              <label className="flex gap-2 text-sm">
                <input type="checkbox" checked={accepted} onChange={(e) => setAccepted(e.target.checked)} className="mt-1 h-4 w-4 accent-[#a8963b]" />
                <span>I have read and agree to the MacroSnaps Terms and Conditions.</span>
              </label>
              <label className="mt-4 block text-xs font-semibold uppercase tracking-[.15em] text-muted" htmlFor="signature">Type your full name to sign *</label>
              <input id="signature" value={signature} onChange={(e) => setSignature(e.target.value.slice(0, 100))} autoComplete="name" className="mt-1.5 w-full border border-black/15 bg-white px-3 py-3 font-script text-2xl outline-none focus:border-gold-dark" placeholder="Your full name" />
              <p className="mt-1 text-xs text-muted">Signed electronically on {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}.</p>
              <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setSignOpen(false)} className="btn-dark">Cancel</button>
                <button type="button" disabled={!accepted || signature.trim().length < 3} onClick={signAndPay} className="btn-gold disabled:cursor-not-allowed disabled:opacity-50">Sign & continue to payment</button>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </form>
  );
}
