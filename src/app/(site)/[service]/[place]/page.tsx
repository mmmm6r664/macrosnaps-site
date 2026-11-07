import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCity, getRegion, getRegionByCode, cityLabel, prerenderCities, regions, City, Region } from "@/lib/geo";
import { LOCAL_SLUGS, SERVICES, getService } from "@/lib/services";
import { cityContent, regionContent, resolveTarget, hubServices, imagesFor, targetName, targetPro, targetSlug, LocalTarget } from "@/lib/content";
import { PageHero, TrustBar, SectionTitle, Pricing, Faqs, ClientLogos, Gallery, Breadcrumbs, CtaBand, HowItWorks } from "@/components/blocks";
import JsonLd from "@/components/JsonLd";
import ContactForm from "@/components/ContactForm";
import WhyUs from "@/components/WhyUs";
import TeamQuote from "@/components/TeamQuote";
import VideoGrid from "@/components/VideoGrid";
import ExploreLinks from "@/components/ExploreLinks";
import { videosFor } from "@/data/videos";
import { SERVICE_VIDEO_TAGS, TOUR_STATES } from "@/lib/pageMedia";
import { serviceSchema } from "@/lib/schema";
import { photoPicker, rotate, bannerSafe } from "@/lib/images";
import { SITE } from "@/lib/site";
import { IconCheck } from "@/components/Icons";
import PhotoSpots from "@/components/PhotoSpots";
import { EVENT_TYPES } from "@/data/eventTypes";
import { EventCityPage, EventRegionPage } from "@/components/EventLocalPage";
import { getEventType, eventPrerenderCities, eventCityContent, eventRegionContent } from "@/lib/eventLocal";

export const revalidate = 604800; // re-render weekly
export const dynamicParams = true;

type Params = { service: string; place: string };

export function generateStaticParams(): Params[] {
  const out: Params[] = [];
  const cities = prerenderCities();
  for (const service of LOCAL_SLUGS) {
    for (const r of regions) out.push({ service, place: r.slug });
    for (const place of cities) out.push({ service, place });
  }
  // Event type × location: all states/provinces + the largest cities; the rest render on demand (ISR).
  const eventCities = eventPrerenderCities().map((c) => c.slug);
  for (const e of EVENT_TYPES) {
    for (const r of regions) out.push({ service: e.slug, place: r.slug });
    for (const place of eventCities) out.push({ service: e.slug, place });
  }
  return out;
}

function load(p: Params) {
  const t = resolveTarget(p.service);
  if (!t) return null;
  const city = getCity(p.place);
  if (city) return { t, city } as const;
  const region = getRegion(p.place);
  if (region) return { t, region } as const;
  return null;
}

function loadEvent(p: Params) {
  const e = getEventType(p.service);
  if (!e) return null;
  const city = getCity(p.place);
  if (city) return { e, city } as const;
  const region = getRegion(p.place);
  if (region) return { e, region } as const;
  return null;
}

function eventMetadata(p: Params): Metadata | null {
  const d = loadEvent(p);
  if (!d) return null;
  const url = `/${p.service}/${p.place}`;
  const c = "city" in d && d.city ? eventCityContent(d.e, d.city) : eventRegionContent(d.e, (d as { region: Region }).region);
  return {
    title: { absolute: c.metaTitle },
    description: c.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url },
  };
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const p = await params;
  const em = eventMetadata(p);
  if (em) return em;
  const d = load(p);
  if (!d) return {};
  const url = `/${p.service}/${p.place}`;
  const c = "city" in d && d.city ? cityContent(d.t, d.city) : regionContent(d.t, (d as { region: Region }).region);
  return {
    title: { absolute: `${c.metaTitle} | MacroSnaps`.length <= 70 ? `${c.metaTitle} | MacroSnaps` : c.metaTitle },
    description: c.metaDescription,
    alternates: { canonical: url },
    openGraph: { title: c.metaTitle, description: c.metaDescription, url, images: [imagesFor(d.t)[0]] },
  };
}

export default async function Page({ params }: { params: Promise<Params> }) {
  const p = await params;
  const ev = loadEvent(p);
  if (ev) return "city" in ev && ev.city ? <EventCityPage e={ev.e} city={ev.city} /> : <EventRegionPage e={ev.e} region={(ev as { region: Region }).region} />;
  const d = load(p);
  if (!d) notFound();
  if ("city" in d && d.city) return <CityPage t={d.t} city={d.city} />;
  return <RegionPage t={d.t} region={(d as { region: Region }).region} />;
}

/* ─────────────────────────── City ─────────────────────────── */

function CityPage({ t, city }: { t: LocalTarget; city: City }) {
  const c = cityContent(t, city);
  const slug = targetSlug(t);
  const region = getRegionByCode(city.state)!;
  const services = hubServices(t);
  const pick = photoPicker();
  const pool = rotate(imagesFor(t), city.id);
  const heroImg = bannerSafe(pool).length ? pick.one(bannerSafe(pool)) : undefined;
  const images = pick.many(12, pool);
  const url = `/${slug}/${city.slug}`;
  const primary = services[0];
  const bookHref = `/book?service=${primary?.slug ?? ""}&city=${city.slug}`;

  // other services in this city (internal links), same service in nearby cities
  const otherHere = LOCAL_SLUGS.filter((s) => s !== slug).map((s) => resolveTarget(s)!).filter(Boolean);
  const nearby = city.nearby.slice(0, 8);

  return (
    <>
      <JsonLd data={serviceSchema({ name: c.h1, serviceType: targetName(t), description: c.metaDescription, url, area: { type: "City", name: cityLabel(city), containedIn: city.stateName }, prices: services.flatMap((s) => s.packages.map((p) => p.price)) })} />
      <PageHero image={heroImg} eyebrow={`${city.stateName} · ${targetName(t)}`} title={c.h1} subtitle={c.subtitle}>
        <Link href={bookHref} className="btn-gold">Book Now{c.priceFrom ? ` — from $${c.priceFrom}` : ""}</Link>
        <a href="#plan" className="btn-outline">Plan a multi-day event</a>
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: targetName(t), href: `/${slug}` }, { name: region.name, href: `/${slug}/${region.slug}` }, { name: city.name, href: url }]} />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 lg:grid-cols-5">
        <div className="prose-ms text-[17px] text-ink lg:col-span-3">
          <p className="eyebrow">MacroSnaps in {city.name}</p>
          <h2 className="mb-6 mt-3 font-serif text-3xl md:text-4xl">Professional {targetName(t).toLowerCase()} in {city.name}, {city.stateName}</h2>
          {c.intro.map((para) => <p key={para}>{para}</p>)}
        </div>
        <aside className="lg:col-span-2">
          <div className="marble border border-black/5 p-7">
            <h2 className="font-serif text-2xl">{c.coverageTitle}</h2>
            <ul className="mt-5 space-y-3">
              {c.coverage.map((x) => <li key={x} className="flex gap-3 text-[15px]"><IconCheck className="mt-1 h-4 w-4 shrink-0 text-gold-dark" />{x}</li>)}
            </ul>
            <Link href={bookHref} className="btn-dark mt-7 w-full">Check Availability & Book</Link>
            <p className="mt-3 text-center text-sm text-muted">or call <a href={SITE.phoneHref} className="underline">{SITE.phone}</a></p>
          </div>
        </aside>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Pricing" title={c.pricingTitle} intro={c.pricingIntro} />
          {t.kind === "hub" ? (
            <>
              <Pricing packages={(t.hub.kind === "video" ? getService("event-videography") : getService("event-photography"))!.packages} serviceSlug={t.hub.kind === "video" ? "event-videography" : "event-photography"} citySlug={city.slug} />
              <h3 className="mb-6 mt-14 text-center font-serif text-2xl">The same published rate for every {t.hub.kind === "video" ? "videography" : "photography"} service in {city.name}</h3>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {SERVICES.filter((x) => x.kind === t.hub.kind && x.packages.some((p) => p.hours)).map((x) => (
                  <Link key={x.slug} href={x.local ? `/${x.slug}/${city.slug}` : `/${x.slug}`} className="group flex items-center justify-between border border-black/10 bg-white px-4 py-3 transition hover:border-gold-dark hover:shadow-md">
                    <span>{x.name}</span><span className="text-gold-dark transition group-hover:translate-x-1">→</span>
                  </Link>
                ))}
              </div>
            </>
          ) : (
            services.filter((s) => s.packages.length).map((s) => (
              <div key={s.slug}>
                <Pricing packages={s.packages} serviceSlug={s.slug} citySlug={city.slug} note={s.pricingNote} />
              </div>
            ))
          )}
        </div>
      </section>

      {c.local && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionTitle eyebrow={`Local to ${city.name}`} title={c.local.heading} />
          <div className="prose-ms mx-auto max-w-3xl text-center text-muted">{c.local.paragraphs.map((x) => <p key={x}>{x}</p>)}</div>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.local.lists.map((l) => (
              <div key={l.title} className="border-t-2 border-gold pt-4">
                <h3 className="font-serif text-lg">{l.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">{l.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        </section>
      )}

      <PhotoSpots city={city} bookHref={bookHref} />

      <section className="bg-black px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <h2 className="mb-10 text-center font-serif text-3xl text-white">Our Work</h2>
          <Gallery images={images.slice(0, 12)} alt={`${targetName(t)} by MacroSnaps`} />
        </div>
      </section>

      {videosFor(SERVICE_VIDEO_TAGS[slug] ?? [], 3).length > 0 && (
        <section className="bg-black px-4 pb-16 md:px-6" data-reveal>
          <div className="mx-auto max-w-7xl text-white">
            <h2 className="mb-8 text-center font-serif text-3xl">Films by MacroSnaps</h2>
            <VideoGrid videos={videosFor(SERVICE_VIDEO_TAGS[slug] ?? [], 3, city.id)} />
          </div>
        </section>
      )}

      <TeamQuote region={city.state} />
      <WhyUs where={city.name} title={`Why ${city.name} clients choose MacroSnaps`} />

      {TOUR_STATES.includes(city.state) && (
        <section className="marble px-4 py-10 text-center md:px-6" data-reveal>
          <p className="mx-auto max-w-3xl text-[17px]">Selling or renting property in {city.name}? We also offer <Link href="/real-estate-photography" className="underline">real estate photography</Link> and <Link href="/virtualtours" className="underline">Matterport 3D virtual tours</Link> in {city.stateName}.</p>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Simple booking" title={`How booking a ${targetPro(t).toLowerCase()} in ${city.name} works`} />
        <HowItWorks />
      </section>

      <ClientLogos />

      <section className="bg-marble px-4 py-16 md:px-6">
        <SectionTitle eyebrow="FAQ" title={`${targetName(t)} in ${city.name}: common questions`} />
        <Faqs faqs={c.faqs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl">More MacroSnaps services in {city.name}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-[15px] sm:grid-cols-2">
              {otherHere.map((o) => (
                <li key={targetSlug(o)}><Link className="underline-offset-4 hover:text-gold-dark hover:underline" href={`/${targetSlug(o)}/${city.slug}`}>{targetPro(o)} in {city.name}</Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">{targetName(t)} near {city.name}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-[15px] sm:grid-cols-2">
              {nearby.map((n) => (
                <li key={n.slug}><Link className="underline-offset-4 hover:text-gold-dark hover:underline" href={`/${slug}/${n.slug}`}>{targetPro(t)} in {n.name}, {n.state}</Link></li>
              ))}
              <li><Link className="font-semibold underline-offset-4 hover:underline" href={`/${slug}/${region.slug}`}>All {region.name} cities →</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <ExploreLinks where={city.name} place={city.slug} />

      <section id="plan" className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="Let's Talk" title={`Planning a multi-day or multi-room event in ${city.name}?`} intro="Single events can be booked online at our published rates. For conferences with several days, rooms or cities, tell us your schedule and we'll plan the crew with you." />
          <ContactForm defaultSubject={`${targetName(t)} in ${cityLabel(city)}`} />
        </div>
      </section>

      <CtaBand title={`Book your ${targetPro(t).toLowerCase()} in ${city.name}`} text="Choose your package, pick your date and pay securely online. Your crew is confirmed by email." bookHref={bookHref} />
    </>
  );
}

/* ─────────────────────────── State / province ─────────────────────────── */

function RegionPage({ t, region }: { t: LocalTarget; region: Region }) {
  const c = regionContent(t, region);
  const slug = targetSlug(t);
  const services = hubServices(t);
  const pick = photoPicker();
  const pool = rotate(imagesFor(t), region.slug.length * 7 + region.name.charCodeAt(0));
  const heroImg = bannerSafe(pool).length ? pick.one(bannerSafe(pool)) : undefined;
  const images = pick.many(8, pool);
  const url = `/${slug}/${region.slug}`;
  const primary = services[0];
  const otherHere = LOCAL_SLUGS.filter((s) => s !== slug).map((s) => resolveTarget(s)!);

  return (
    <>
      <JsonLd data={serviceSchema({ name: c.h1, serviceType: targetName(t), description: c.metaDescription, url, area: { type: "State", name: region.name }, prices: services.flatMap((s) => s.packages.map((p) => p.price)) })} />
      <PageHero image={heroImg} eyebrow={region.country === "canada" ? "Canada" : "United States"} title={c.h1} subtitle={c.intro[0]}>
        <Link href={`/book?service=${primary?.slug ?? ""}`} className="btn-gold">Book Now{c.priceFrom ? ` — from $${c.priceFrom}` : ""}</Link>
        <a href="#cities" className="btn-outline">Find your city</a>
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: targetName(t), href: `/${slug}` }, { name: region.name, href: url }]} />

      <section id="cities" className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <SectionTitle eyebrow={region.name} title={`${targetName(t)} in ${region.name} cities`} intro={c.intro[1]} />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3 lg:grid-cols-4">
          {c.cities.map((city) => (
            <li key={city.slug}><Link href={`/${slug}/${city.slug}`} className="hover:text-gold-dark hover:underline">{targetPro(t)} in {city.name}</Link></li>
          ))}
        </ul>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Pricing" title={`${targetName(t)} prices in ${region.name}`} intro="The same transparent prices in every city. Book and pay online." />
          {services.filter((s) => s.packages.length).slice(0, 1).map((s) => <Pricing key={s.slug} packages={s.packages} serviceSlug={s.slug} note={s.pricingNote} />)}
        </div>
      </section>

      <section className="bg-black px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl"><Gallery images={images.slice(0, 8)} alt={`${targetName(t)} in ${region.name}`} /></div>
      </section>

      <ClientLogos />

      <TeamQuote region={region.code} />
      <WhyUs where={region.name} title={`Why clients across ${region.name} choose MacroSnaps`} />

      {TOUR_STATES.includes(region.code) && (
        <section className="marble px-4 py-10 text-center md:px-6" data-reveal>
          <p className="mx-auto max-w-3xl text-[17px]">We offer <Link href="/virtualtours" className="underline">Matterport 3D virtual tours</Link> and <Link href="/real-estate-photography" className="underline">real estate photography</Link> throughout {region.name}.</p>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <h2 className="font-serif text-2xl">Other services in {region.name}</h2>
        <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
          {otherHere.map((o) => <li key={targetSlug(o)}><Link href={`/${targetSlug(o)}/${region.slug}`} className="hover:text-gold-dark hover:underline">{targetName(o)} in {region.name}</Link></li>)}
        </ul>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6">
        <SectionTitle eyebrow="FAQ" title="Common questions" />
        <Faqs faqs={(primary?.faqs ?? SERVICES[0].faqs).slice(0, 6)} />
      </section>

      <ExploreLinks where={region.name} place={region.slug} />
      <CtaBand title={`Book ${targetName(t).toLowerCase()} in ${region.name}`} bookHref={`/book?service=${primary?.slug ?? ""}`} />
    </>
  );
}
