import Image from "next/image";
import Link from "next/link";
import { ALL_CLIENTS as CLIENTS } from "@/lib/clients";
import { SITE } from "@/lib/site";
import { RATES, hourPrice, type Package } from "@/lib/services";
import { altFor } from "@/lib/images";
import JsonLd from "./JsonLd";
import { breadcrumbSchema, faqSchema } from "@/lib/schema";
import { IconCheck, IconChevron } from "./Icons";

export function PageHero({ image, eyebrow, title, subtitle, children }: { image?: string; eyebrow?: string; title: string; subtitle?: string; children?: React.ReactNode }) {
  return (
    <section className="relative isolate overflow-hidden bg-black text-white">
      {image ? (
        <Image src={image} alt="" fill priority sizes="100vw" className="kenburns -z-10 object-cover object-[center_30%] opacity-55" />
      ) : (
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_#3a3420_0%,_#000_65%)]" />
      )}
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/30 via-black/30 to-black/70" />
      <div className="mx-auto max-w-5xl px-4 py-24 text-center md:py-32">
        <div className="mx-auto mb-5 h-px w-24 bg-gold" />
        {eyebrow && <p className="mb-4 text-xs font-semibold uppercase tracking-[.3em] text-gold">{eyebrow}</p>}
        <h1 className="font-script text-4xl leading-tight md:text-6xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-6 max-w-3xl text-base leading-relaxed text-white/90 md:text-lg">{subtitle}</p>}
        {children && <div className="mt-9 flex flex-wrap justify-center gap-4">{children}</div>}
      </div>
    </section>
  );
}

export function SectionTitle({ eyebrow, title, intro, center = true }: { eyebrow?: string; title: string; intro?: string; center?: boolean }) {
  return (
    <div className={`mb-10 ${center ? "mx-auto max-w-3xl text-center" : ""}`}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">{title}</h2>
      {intro && <p className="mt-4 text-muted leading-relaxed">{intro}</p>}
    </div>
  );
}

export function TrustBar(_: { events?: boolean } = {}) {
  const items = ["750+ conferences · 2,200+ weddings", "Rated 5 stars", "Insured by State Farm: $1M / $2M", "Published prices, book & pay online"];
  return (
    <div className="border-y border-black/5 bg-marble">
      <ul className="mx-auto grid max-w-7xl gap-3 px-4 py-5 text-sm text-ink sm:grid-cols-2 lg:grid-cols-4">
        {items.map((t) => <li key={t} className="flex items-start gap-2"><IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />{t}</li>)}
      </ul>
    </div>
  );
}

export function Pricing({ packages, serviceSlug, citySlug, note, canada }: { packages: Package[]; serviceSlug: string; citySlug?: string; note?: string; canada?: boolean }) {
  if (!packages.length) return null;
  const inCanada = canada || /-(on|qc)$/.test(citySlug ?? "");
  return (
    <div>
      {inCanada && <p className="mx-auto mb-6 max-w-2xl rounded bg-gold/15 px-4 py-3 text-center text-sm font-semibold">All prices are in US dollars (USD). Bookings in Ontario and Quebec are charged in USD.</p>}
      {rateLine(packages) && <p className="mb-8 text-center text-sm font-semibold uppercase tracking-[.15em] text-gold-dark">{rateLine(packages)}</p>}
      <div className={packages.length === 1 ? "mx-auto grid max-w-md gap-6" : "grid gap-6 sm:grid-cols-2 lg:grid-cols-3"}>
        {packages.map((p) => (
          <div key={p.id} className="flex flex-col border border-black/10 bg-white p-7 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <h3 className="text-sm font-bold uppercase tracking-[.2em] text-ink">{p.name}</h3>
            <p className="mt-3 font-serif text-5xl text-ink">{p.price ? `$${p.price.toLocaleString()}` : "Custom"}</p>
            {p.priceNote && <p className="mt-1 text-xs text-muted">{p.priceNote}</p>}
            <ul className="mt-6 flex-1 space-y-2.5 text-sm text-muted">
              {p.features.map((f) => <li key={f} className="flex gap-2"><IconCheck className="mt-0.5 h-4 w-4 shrink-0 text-gold-dark" />{f}</li>)}
            </ul>
            {p.quoteOnly ? (
              <Link href={`/contact?subject=${encodeURIComponent(p.name)}`} className="btn-dark mt-7">Get Started</Link>
            ) : (
              <Link href={`/book?service=${serviceSlug}&package=${p.id}${citySlug ? `&city=${citySlug}` : ""}`} className="btn-dark mt-7">Book Now</Link>
            )}
          </div>
        ))}
      </div>
      {note && <p className="mt-6 text-center text-sm text-muted">{note}</p>}
    </div>
  );
}

function rateLine(packages: Package[]) {
  const two = packages.find((p) => p.hours === 2);
  if (!two) return null;
  const kind = two.price === hourPrice("photo", 2) ? "photo" : two.price === hourPrice("video", 2) ? "video" : null;
  if (!kind) return null;
  return `Minimum ${RATES.minHours} hours · $${RATES[kind].first} first hour + $${RATES[kind].extra} each additional hour`;
}

export function Faqs({ faqs, withSchema = true }: { faqs: { q: string; a: string }[]; withSchema?: boolean }) {
  if (!faqs.length) return null;
  return (
    <div className="mx-auto max-w-3xl divide-y divide-black/10 border-y border-black/10">
      {withSchema && <JsonLd data={faqSchema(faqs)} />}
      {faqs.map((f) => (
        <details key={f.q} className="group py-5">
          <summary className="flex items-center justify-between gap-4 font-serif text-lg text-ink">
            {f.q}<IconChevron className="h-5 w-5 shrink-0 transition group-open:rotate-180" />
          </summary>
          <p className="mt-3 leading-relaxed text-muted whitespace-pre-line">{f.a}</p>
        </details>
      ))}
    </div>
  );
}

export function ClientLogos({ title = "We Have Worked With" }: { title?: string }) {
  const logos = CLIENTS.slice(0, 60);
  const row = [...logos, ...logos];
  return (
    <section className="overflow-hidden bg-white py-14">
      <SectionTitle eyebrow="Conferences & events we have covered" title={title} />
      <div className="relative">
        <div className="marquee items-center gap-6">
          {row.map((c, i) => (
            <div key={i} className="flex h-20 w-44 shrink-0 items-center justify-center px-3">
              <Image src={c.logo} alt={i < logos.length ? `${c.name} logo` : ""} width={176} height={80} className="max-h-16 w-auto max-w-full object-contain" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Gallery({ images, alt }: { images: string[]; alt: string }) {
  if (!images.length) return null;
  return (
    <div className="columns-2 gap-3 md:columns-3 lg:columns-4">
      {images.map((src, i) => (
        // block wrapper so a photo is never split across two columns
        <div key={src} className="mb-3 break-inside-avoid">
          <Image src={src} alt={altFor(src) ?? `${alt} ${i + 1}`} width={600} height={600} sizes="(max-width: 768px) 50vw, 25vw" className="block h-auto w-full" />
        </div>
      ))}
    </div>
  );
}

export function Breadcrumbs({ items }: { items: { name: string; href: string }[] }) {
  return (
    <nav aria-label="Breadcrumb" className="mx-auto max-w-7xl px-4 pt-5 text-xs text-muted md:px-6">
      <JsonLd data={breadcrumbSchema(items)} />
      <ol className="flex flex-wrap gap-1">
        {items.map((it, i) => (
          <li key={it.href} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>/</span>}
            {i === items.length - 1 ? <span aria-current="page" className="text-ink">{it.name}</span> : <Link href={it.href} className="hover:text-gold-dark">{it.name}</Link>}
          </li>
        ))}
      </ol>
    </nav>
  );
}

export function CtaBand({ title, text, bookHref = "/book" }: { title: string; text?: string; bookHref?: string }) {
  return (
    <section className="bg-black px-4 py-16 text-center text-white">
      <h2 className="font-script text-4xl md:text-5xl">{title}</h2>
      {text && <p className="mx-auto mt-4 max-w-2xl text-white/80">{text}</p>}
      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link href={bookHref} className="btn-gold">Book & Pay Online</Link>
        <a href={SITE.phoneHref} className="btn-outline">Call {SITE.phone}</a>
      </div>
    </section>
  );
}

export function HowItWorks() {
  const steps = [
    ["Choose your package", "Pick the service and number of hours. Every price is published, so there are no quotes to wait for."],
    ["Book & pay online", "Enter your date, start time and venue, then pay securely by card. Your slot is reserved the moment you book."],
    ["Your crew is confirmed", "We assign a MacroSnaps photographer or videographer for your city and confirm the details by email."],
    ["Receive your gallery", "Every photo is edited and retouched, then delivered in a private online gallery in high resolution."],
  ];
  return (
    <ol className="grid gap-8 md:grid-cols-4">
      {steps.map(([t, d], i) => (
        <li key={t} className="text-center">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full border border-gold font-serif text-xl text-gold-dark">{i + 1}</span>
          <h3 className="mt-4 font-serif text-xl text-ink">{t}</h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">{d}</p>
        </li>
      ))}
    </ol>
  );
}
