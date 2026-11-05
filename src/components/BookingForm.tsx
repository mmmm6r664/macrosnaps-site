"use client";
import { useMemo, useState } from "react";
import Link from "next/link";

type Pkg = { id: string; name: string; price: number; priceNote?: string; features: string[] };
type Svc = { slug: string; name: string; kind: string; group: string; packages: Pkg[] };
type CityOpt = { slug: string; label: string };

const GROUPS: Record<string, string> = { corporate: "Conferences & Corporate", wedding: "Weddings & Engagements", business: "Business & Commercial", personal: "Portraits & Family", post: "Editing" };

export default function BookingForm({ services, cities, initial }: { services: Svc[]; cities: CityOpt[]; initial: { service?: string; package?: string; city?: string; cancelled?: boolean } }) {
  const [serviceSlug, setServiceSlug] = useState(services.find((s) => s.slug === initial.service)?.slug ?? services[0].slug);
  const service = services.find((s) => s.slug === serviceSlug)!;
  const [pkgId, setPkgId] = useState(service.packages.find((p) => p.id === initial.package)?.id ?? service.packages[0].id);
  const pkg = service.packages.find((p) => p.id === pkgId) ?? service.packages[0];
  const initialCity = cities.find((c) => c.slug === initial.city);
  const [location, setLocation] = useState(initialCity?.label ?? "");
  const [state, setState] = useState<"idle" | "sending" | "requested" | "error">("idle");
  const [error, setError] = useState("");
  const today = useMemo(() => new Date(Date.now() + 86400000).toISOString().slice(0, 10), []);

  const grouped = useMemo(() => {
    const g: Record<string, Svc[]> = {};
    for (const s of services) (g[s.group] ||= []).push(s);
    return g;
  }, [services]);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    setError("");
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    const citySlug = cities.find((c) => c.label.toLowerCase() === location.trim().toLowerCase())?.slug ?? "";
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...f, service: service.slug, package: pkg.id, location, citySlug, agree: f.agree === "on" }),
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
      <div className="space-y-8 lg:col-span-2">
        {initial.cancelled && <p className="border border-black/10 bg-marble p-4 text-sm">Payment was cancelled — your booking hasn&apos;t been made. You can try again below.</p>}

        <fieldset>
          <legend className="mb-4 font-serif text-2xl">1. Choose your service</legend>
          <select className={field} value={serviceSlug} onChange={(e) => { const s = services.find((x) => x.slug === e.target.value)!; setServiceSlug(s.slug); setPkgId(s.packages[0].id); }} aria-label="Service">
            {Object.entries(grouped).map(([g, list]) => (
              <optgroup key={g} label={GROUPS[g] ?? g}>{list.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</optgroup>
            ))}
          </select>
        </fieldset>

        <fieldset>
          <legend className="mb-4 font-serif text-2xl">2. Choose your package</legend>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {service.packages.map((p) => (
              <label key={p.id} className={`cursor-pointer border p-4 transition ${p.id === pkg.id ? "border-gold-dark bg-gold/10 ring-1 ring-gold-dark" : "border-black/15 bg-white hover:border-black/40"}`}>
                <input type="radio" name="pkg" className="sr-only" checked={p.id === pkg.id} onChange={() => setPkgId(p.id)} />
                <span className="block text-sm font-semibold">{p.name}</span>
                <span className="mt-1 block font-serif text-2xl">${p.price.toLocaleString()}</span>
                {p.priceNote && <span className="block text-xs text-muted">{p.priceNote}</span>}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 font-serif text-2xl sm:col-span-2">3. When & where</legend>
          <div><label className={label} htmlFor="date">Date *</label><input id="date" name="date" type="date" min={today} required className={field} /></div>
          <div><label className={label} htmlFor="time">Start time *</label><input id="time" name="time" type="time" required className={field} /></div>
          <div className="sm:col-span-2">
            <label className={label} htmlFor="location">City *</label>
            <input id="location" list="city-list" value={location} onChange={(e) => setLocation(e.target.value)} required placeholder="Start typing your city, e.g. San Francisco, CA" className={field} autoComplete="off" />
            <datalist id="city-list">{cities.map((c) => <option key={c.slug} value={c.label} />)}</datalist>
            <p className="mt-1 text-xs text-muted">Don&apos;t see your city? Type it anyway — we cover the whole US and Canada.</p>
          </div>
          <div className="sm:col-span-2"><label className={label} htmlFor="address">Venue name & address *</label><input id="address" name="address" required className={field} placeholder="e.g. Moscone Center, 747 Howard St" /></div>
        </fieldset>

        <fieldset className="grid gap-5 sm:grid-cols-2">
          <legend className="mb-4 font-serif text-2xl sm:col-span-2">4. Your details</legend>
          <div><label className={label} htmlFor="name">Full name *</label><input id="name" name="name" required className={field} autoComplete="name" /></div>
          <div><label className={label} htmlFor="email">Email *</label><input id="email" name="email" type="email" required className={field} autoComplete="email" /></div>
          <div><label className={label} htmlFor="phone">Phone *</label><input id="phone" name="phone" type="tel" required className={field} autoComplete="tel" /></div>
          <div><label className={label} htmlFor="company">Company (optional)</label><input id="company" name="company" className={field} autoComplete="organization" /></div>
          <div className="sm:col-span-2"><label className={label} htmlFor="notes">Notes for your crew</label><textarea id="notes" name="notes" rows={3} maxLength={480} className={field} placeholder="Schedule, key people or moments, dress code, parking…" /></div>
        </fieldset>
      </div>

      <aside className="lg:sticky lg:top-36 lg:self-start">
        <div className="marble border border-black/10 p-6">
          <h2 className="font-serif text-2xl">Your booking</h2>
          <p className="mt-4 text-sm text-muted">{service.name}</p>
          <p className="font-semibold">{pkg.name}</p>
          <ul className="mt-3 space-y-1 text-sm text-muted">{pkg.features.map((f) => <li key={f}>• {f}</li>)}</ul>
          <div className="mt-5 flex items-baseline justify-between border-t border-black/10 pt-4">
            <span className="text-sm uppercase tracking-widest">Total</span>
            <span className="font-serif text-4xl">${pkg.price.toLocaleString()}</span>
          </div>
          <label className="mt-5 flex gap-2 text-xs leading-relaxed text-muted">
            <input type="checkbox" name="agree" required className="mt-0.5" />
            <span>I agree to the <Link href="/terms" className="underline" target="_blank">booking terms</Link>. Bookings are non-refundable; free rescheduling for extreme weather or emergencies.</span>
          </label>
          <button disabled={state === "sending"} className="btn-gold mt-5 w-full">{state === "sending" ? "Redirecting…" : "Continue to secure payment"}</button>
          {state === "error" && <p className="mt-3 text-sm text-red-700">{error}</p>}
          <p className="mt-4 text-center text-xs text-muted">Secure card payment by Stripe. Need an invoice or a multi-day quote? <Link href="/corporate#quote" className="underline">Request a corporate quote</Link>.</p>
        </div>
      </aside>
    </form>
  );
}
