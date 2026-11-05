import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, HUBS, getService, Service } from "@/lib/services";
import { usRegions, caRegions, topCities, cityLabel } from "@/lib/geo";
import { PageHero, TrustBar, SectionTitle, Pricing, Faqs, ClientLogos, Gallery, Breadcrumbs, CtaBand, HowItWorks } from "@/components/blocks";
import ContactForm from "@/components/ContactForm";
import EventTypePage from "@/components/EventTypePage";
import WhyUs from "@/components/WhyUs";
import VideoGrid from "@/components/VideoGrid";
import ExploreLinks from "@/components/ExploreLinks";
import { videosFor } from "@/data/videos";
import { SERVICE_VIDEO_TAGS, TOUR_STATES } from "@/lib/pageMedia";
import { EVENT_TYPES } from "@/data/eventTypes";
import JsonLd from "@/components/JsonLd";
import { serviceSchema } from "@/lib/schema";
import { IMG } from "@/lib/images";
import { IconCheck } from "@/components/Icons";

export const dynamicParams = false;
export function generateStaticParams() {
  return [...SERVICES.map((s) => ({ service: s.slug })), ...Object.keys(HUBS).map((service) => ({ service })), ...EVENT_TYPES.map((e) => ({ service: e.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ service: string }> }): Promise<Metadata> {
  const { service } = await params;
  if (service in HUBS) {
    const h = HUBS[service as keyof typeof HUBS];
    const t = `${h.pro}s Near You | ${h.name} Across the US, Ontario & Quebec`;
    return { title: { absolute: `${t} | MacroSnaps` }, description: `Find a MacroSnaps ${h.pro.toLowerCase()} in your state, province or city. Our own crews cover conferences, corporate events and weddings across 1,690+ cities.`, alternates: { canonical: `/${service}` } };
  }
  const ev = EVENT_TYPES.find((e) => e.slug === service);
  if (ev) return { title: { absolute: ev.title }, description: ev.description, alternates: { canonical: `/${ev.slug}` }, openGraph: { title: ev.title, description: ev.description } };
  const s = getService(service);
  if (!s) return {};
  return { title: { absolute: s.title.length > 55 ? s.title : `${s.title} | MacroSnaps` }, description: s.description, alternates: { canonical: `/${s.slug}` }, openGraph: { images: [s.images[0]] } };
}

export default async function Page({ params }: { params: Promise<{ service: string }> }) {
  const { service } = await params;
  if (service in HUBS) return <HubPage slug={service as keyof typeof HUBS} />;
  const ev = EVENT_TYPES.find((e) => e.slug === service);
  if (ev) return <EventTypePage e={ev} />;
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

/** Hero: video services lead with a frame from a matching film; photo services with a matching photo. */
const heroOf = (s: Service): string | undefined => {
  if (s.slug === "conference-photography") return IMG.conferenceHero;
  const film = s.kind !== "photo" ? videosFor(SERVICE_VIDEO_TAGS[s.slug] ?? [], 1)[0] : undefined;
  if (film && !["conference-videography", "wedding-videography", "event-videography", "corporate-videography"].includes(s.slug)) return `https://i.ytimg.com/vi/${film.id}/maxresdefault.jpg`;
  return s.images[0] ?? (film ? `https://i.ytimg.com/vi/${film.id}/maxresdefault.jpg` : undefined);
};

function ServicePage({ s }: { s: Service }) {
  const corporate = s.group === "corporate";
  const bookable = s.packages.some((p) => !p.quoteOnly);
  return (
    <>
      <JsonLd data={serviceSchema({ name: s.name, serviceType: s.name, description: s.description, url: `/${s.slug}`, prices: s.packages.filter((p) => !p.quoteOnly).map((p) => p.price) })} />
      <PageHero image={heroOf(s)} eyebrow="MacroSnaps" title={s.name} subtitle={s.description}>
        {bookable ? <Link href={`/book?service=${s.slug}`} className="btn-gold">Book Now</Link> : <Link href={`/contact?subject=${encodeURIComponent(s.name)}`} className="btn-gold">Contact Us</Link>}
        {corporate && <Link href="/corporate" className="btn-outline">Multi-day & Multi-city Events</Link>}
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

{s.images.filter((x) => x !== heroOf(s)).length > 0 && (
      <section className="bg-black px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center font-serif text-3xl text-white">Our Work</h2>
          {s.images.filter((x) => x !== heroOf(s)).length > 0 && <Gallery images={s.images.filter((x) => x !== heroOf(s)).slice(0, 16)} alt={s.name} />}
        </div>
      </section>
      )}

      {videosFor(SERVICE_VIDEO_TAGS[s.slug] ?? [], 3).length > 0 && (
        <section className="bg-black px-4 py-16 md:px-6" data-reveal>
          <div className="mx-auto max-w-7xl text-white">
            <h2 className="mb-8 text-center font-serif text-3xl">Watch our {s.kind === "photo" ? "event" : s.name.toLowerCase()} films</h2>
            <VideoGrid videos={videosFor(SERVICE_VIDEO_TAGS[s.slug] ?? [], 3, s.slug.length)} />
          </div>
        </section>
      )}

      {s.slug === "virtualtours" && (
        <section className="marble px-4 py-12 text-center md:px-6" data-reveal>
          <h2 className="font-serif text-2xl">Where we offer Matterport 3D tours</h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted">3D virtual tours are currently available in Virginia, Maryland, Washington, DC, New York and New Jersey. Real estate photography and videography are available in every state we serve.</p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">{[["virginia","Virginia"],["maryland","Maryland"],["district-of-columbia","Washington, DC"],["new-york","New York"],["new-jersey","New Jersey"]].map(([slug, n]) => <Link key={slug} href={`/photographers/${slug}`} className="border border-black/15 px-4 py-2 text-sm hover:border-gold-dark">{n}</Link>)}</div>
        </section>
      )}

      {corporate && <ClientLogos />}

      <WhyUs where={s.name} />

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

      <ExploreLinks focus={s.group === "wedding" || s.group === "personal" ? "events" : s.group === "business" || s.group === "post" ? "business" : "all"} />

      <section id="contact" className="bg-marble px-4 py-16 md:px-6">
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
      <PageHero image={h.kind === "photo" ? IMG.conferenceHero : IMG.conferenceVideo[0]} eyebrow="1,690+ cities across the US, Ontario & Quebec" title={`${h.pro}s Near You`} subtitle={`MacroSnaps is a global photography and videography company with our own ${h.pro.toLowerCase()}s — not a marketplace. Find your state, province or city for local venues, prices and booking.`}>
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
      <section className="bg-black px-4 py-16 md:px-6" data-reveal>
        <div className="mx-auto max-w-7xl text-white">
          <h2 className="mb-8 text-center font-serif text-3xl">Recent {h.kind === "photo" ? "event" : "video"} work</h2>
          <VideoGrid videos={videosFor(SERVICE_VIDEO_TAGS[slug] ?? [], 6)} />
        </div>
      </section>
      <ClientLogos />
      <WhyUs />
      <ExploreLinks />
      <CtaBand title={`Book a ${h.pro.toLowerCase()}`} />
    </>
  );
}

