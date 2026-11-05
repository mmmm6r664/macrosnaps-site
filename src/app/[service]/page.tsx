import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, HUBS, getService, Service } from "@/lib/services";
import { usRegions, caRegions, topCities, cityLabel } from "@/lib/geo";
import { PageHero, TrustBar, SectionTitle, Pricing, Faqs, ClientLogos, Gallery, Breadcrumbs, CtaBand, HowItWorks } from "@/components/blocks";
import ContactForm from "@/components/ContactForm";
import JsonLd from "@/components/JsonLd";
import { serviceSchema } from "@/lib/schema";
import { IMG } from "@/lib/images";
import { IconCheck } from "@/components/Icons";

export const dynamicParams = false;
export function generateStaticParams() {
  return [...SERVICES.map((s) => ({ service: s.slug })), ...Object.keys(HUBS).map((service) => ({ service }))];
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  if (service in HUBS) {
    const h = HUBS[service as keyof typeof HUBS];
    const t = `${h.pro}s Near You | ${h.name} Across the US & Canada`;
    return { title: { absolute: `${t} | MacroSnaps` }, description: `Find a MacroSnaps ${h.pro.toLowerCase()} in your state, province or city. Our own crews cover conferences, corporate events and weddings across 1,800+ cities.`, alternates: { canonical: `/${service}` } };
  }
  const s = getService(service);
  if (!s) return {};
  return { title: { absolute: s.title.length > 55 ? s.title : `${s.title} | MacroSnaps` }, description: s.description, alternates: { canonical: `/${s.slug}` }, openGraph: { images: [s.images[0]] } };
}

export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (service in HUBS) return <HubPage slug={service as keyof typeof HUBS} />;
  const s = getService(service);
  if (!s) notFound();
  return <ServicePage s={s} />;
}

function LocationDirectory({ slug, pro }: { slug: string; pro: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
      <SectionTitle eyebrow="Locations" title={`Find a ${pro.toLowerCase()} near you`} intro="Our own photographers and videographers work across all 50 states, Washington, DC and Canada. Choose your state, province or city." />
      <div className="grid gap-10 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <h3 className="mb-3 font-serif text-xl">United States</h3>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-3">
            {usRegions.map((r) => <li key={r.slug}><Link className="hover:text-gold-dark hover:underline" href={`/${slug}/${r.slug}`}>{r.name}</Link></li>)}
          </ul>
          <h3 className="mb-3 mt-8 font-serif text-xl">Canada</h3>
          <ul className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[15px] sm:grid-cols-3">
            {caRegions.map((r) => <li key={r.slug}><Link className="hover:text-gold-dark hover:underline" href={`/${slug}/${r.slug}`}>{r.name}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="mb-3 font-serif text-xl">Popular cities</h3>
          <ul className="space-y-1.5 text-[15px]">
            {topCities(30).map((c) => <li key={c.slug}><Link className="hover:text-gold-dark hover:underline" href={`/${slug}/${c.slug}`}>{pro} in {cityLabel(c)}</Link></li>)}
          </ul>
        </div>
      </div>
    </section>
  );
}

function ServicePage({ s }: { s: Service }) {
  const corporate = s.group === "corporate";
  const bookable = s.packages.some((p) => !p.quoteOnly);
  return (
    <>
      <JsonLd data={serviceSchema({ name: s.name, serviceType: s.name, description: s.description, url: `/${s.slug}`, prices: s.packages.filter((p) => !p.quoteOnly).map((p) => p.price) })} />
      <PageHero image={s.slug === "conference-photography" ? IMG.conferenceHero : s.images[0]} eyebrow="MacroSnaps" title={s.name} subtitle={s.description}>
        {bookable ? <Link href={`/book?service=${s.slug}`} className="btn-gold">Book Now</Link> : <Link href={`/contact?subject=${encodeURIComponent(s.name)}`} className="btn-gold">Get a Quote</Link>}
        {corporate && <Link href="/corporate#quote" className="btn-outline">Corporate Quote</Link>}
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: s.name, href: `/${s.slug}` }]} />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 lg:grid-cols-5">
        <div className="prose-ms text-[17px] lg:col-span-3">
          {s.intro.map((p) => <p key={p}>{p}</p>)}
          {s.sections?.map((x) => (
            <div key={x.heading}><h2 className="mb-3 mt-8 font-serif text-2xl">{x.heading}</h2><p>{x.body}</p></div>
          ))}
        </div>
        <aside className="lg:col-span-2">
          <div className="marble border border-black/5 p-7">
            <h2 className="font-serif text-2xl">What we cover</h2>
            <ul className="mt-5 space-y-3">{s.coverage.map((c) => <li key={c} className="flex gap-3"><IconCheck className="mt-1 h-4 w-4 shrink-0 text-gold-dark" />{c}</li>)}</ul>
          </div>
        </aside>
      </section>

      {s.packages.length > 0 && (
        <section className="bg-marble px-4 py-16 md:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Pricing Plans" title={`${s.name} packages`} intro="Every price is listed upfront. Book and pay online in minutes." />
            <Pricing packages={s.packages} serviceSlug={s.slug} note={s.pricingNote} />
          </div>
        </section>
      )}

      <section className="bg-black px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center font-serif text-3xl text-white">Our Work</h2>
          <Gallery images={s.images.slice(0, 16)} alt={s.name} />
        </div>
      </section>

      {corporate && <ClientLogos />}

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="How it works" title="Booking is simple" />
        <HowItWorks />
      </section>

      {s.local && <LocationDirectory slug={s.slug} pro={s.pro} />}

      <section className="bg-marble px-4 py-16 md:px-6">
        <SectionTitle eyebrow="FAQ" title="Frequently asked questions" />
        <Faqs faqs={s.faqs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="font-serif text-2xl">Related services</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {s.related.map((r) => getService(r)).filter(Boolean).map((r) => (
            <Link key={r!.slug} href={`/${r!.slug}`} className="border border-black/10 p-5 transition hover:border-gold-dark">
              <span className="font-serif text-lg">{r!.name}</span>
              <span className="mt-1 block text-sm text-muted">{r!.description.slice(0, 90)}…</span>
            </Link>
          ))}
        </div>
      </section>

      <section id="quote" className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="Contact" title="Let's Talk" />
          <ContactForm defaultSubject={s.name} />
        </div>
      </section>
      <CtaBand title={`Book ${s.name}`} bookHref={bookable ? `/book?service=${s.slug}` : "/contact"} />
    </>
  );
}

function HubPage({ slug }: { slug: keyof typeof HUBS }) {
  const h = HUBS[slug];
  const services = SERVICES.filter((s) => s.kind === h.kind && s.local);
  return (
    <>
      <PageHero image={h.kind === "photo" ? IMG.conferenceHero : IMG.conferenceVideo[0]} eyebrow="1,800+ cities across the US & Canada" title={`${h.pro}s Near You`} subtitle={`MacroSnaps is a global photography and videography company with our own ${h.pro.toLowerCase()}s — not a marketplace. Find your state, province or city for local venues, prices and booking.`}>
        <Link href="/book" className="btn-gold">Book Now</Link>
      </PageHero>
      <TrustBar />
      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionTitle title={`${h.name} services by city`} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((s) => (
            <Link key={s.slug} href={`/${s.slug}`} className="border border-black/10 p-5 hover:border-gold-dark"><span className="font-serif text-lg">{s.name}</span><span className="mt-1 block text-sm text-muted">{s.pro}s in every state & province</span></Link>
          ))}
        </div>
      </section>
      <LocationDirectory slug={slug} pro={h.pro} />
      <ClientLogos />
      <CtaBand title={`Book a ${h.pro.toLowerCase()}`} />
    </>
  );
}

