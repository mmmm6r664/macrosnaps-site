import Link from "next/link";
import { EVENT_TYPES, type EventType } from "@/data/eventTypes";
import { type City, type Region, cityLabel, getRegionByCode } from "@/lib/geo";
import { getService, RATES, hourPrice } from "@/lib/services";
import { byTags, photoPicker, bannerSafe, rotate } from "@/lib/images";
import { videosFor, type Tag } from "@/data/videos";
import { EVENT_PHOTO_TAGS } from "@/lib/pageMedia";
import { an, eventCityContent, eventRegionContent, eventServices, svcLabel } from "@/lib/eventLocal";
import { serviceSchema } from "@/lib/schema";
import { PageHero, TrustBar, SectionTitle, Pricing, Faqs, Gallery, Breadcrumbs, CtaBand, HowItWorks } from "./blocks";
import JsonLd from "./JsonLd";
import VideoGrid from "./VideoGrid";
import WhyUs from "./WhyUs";
import { IconCheck } from "./Icons";
import { SITE } from "@/lib/site";
import PhotoSpots from "./PhotoSpots";

const linkCls = "underline-offset-4 hover:text-gold-dark hover:underline";

function photosFor(e: EventType, seed: number) {
  return rotate(byTags(...(EVENT_PHOTO_TAGS[e.slug] ?? ["event"])), seed);
}

function Moments({ e, where }: { e: EventType; where: string }) {
  return (
    <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
      <div className="mx-auto max-w-7xl">
        <SectionTitle eyebrow="What we capture" title={`Key moments we photograph and film in ${where}`} />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {e.moments.map((m, i) => (
            <div key={m.title} className="bg-white p-6 shadow-sm">
              <span className="font-serif text-2xl text-gold-dark">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="mt-1 font-serif text-lg">{m.title}</h3>
              <p className="mt-2 text-sm text-muted">{m.body}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Planning({ e, where }: { e: EventType; where: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
      <SectionTitle eyebrow="Planning tips" title={`Planning your coverage in ${where}`} />
      <div className="grid gap-8 md:grid-cols-2">
        {e.planning.map((p) => (
          <div key={p.title} className="border-l-2 border-gold pl-5">
            <h3 className="font-serif text-xl">{p.title}</h3>
            <p className="mt-2 text-muted">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function EventPricing({ e, where, citySlug }: { e: EventType; where: string; citySlug?: string }) {
  const { photoSvc, videoSvc } = eventServices(e);
  const photo = getService(photoSvc);
  const ph = Math.max(e.suggestedHours.photo, RATES.minHours);
  const vh = Math.max(e.suggestedHours.video, RATES.minHours);
  const q = citySlug ? `&city=${citySlug}` : "";
  return (
    <section id="pricing" className="bg-marble px-4 py-16 md:px-6">
      <div className="mx-auto max-w-7xl">
        <SectionTitle
          eyebrow="Pricing"
          title={`${e.name} photography & video prices in ${where}`}
          intro={`One published hourly rate for everyone, with a ${RATES.minHours}-hour minimum. No quotes, no negotiating: choose your hours and book online.`}
        />
        <div className="mx-auto mb-12 grid max-w-4xl gap-6 md:grid-cols-2">
          <div className="border border-black/10 bg-white p-7">
            <h3 className="text-sm font-bold uppercase tracking-[.2em]">Photography</h3>
            <p className="mt-3 font-serif text-4xl">${RATES.photo.first} <span className="text-base text-muted">first hour</span></p>
            <p className="mt-1 text-muted">+ ${RATES.photo.extra} each additional hour</p>
            <p className="mt-4 text-[15px]">Typical {e.name.toLowerCase()} coverage: <strong>{ph} hours = ${hourPrice("photo", ph).toLocaleString()}</strong></p>
            <p className="mt-2 text-sm text-muted">Every photo retouched and color graded, online gallery in about a week.</p>
            <Link href={`/book?service=${photoSvc}${q}`} className="btn-dark mt-6 w-full">Book Photography</Link>
          </div>
          <div className="border border-black/10 bg-white p-7">
            <h3 className="text-sm font-bold uppercase tracking-[.2em]">Videography</h3>
            <p className="mt-3 font-serif text-4xl">${RATES.video.first} <span className="text-base text-muted">first hour</span></p>
            <p className="mt-1 text-muted">+ ${RATES.video.extra} each additional hour</p>
            <p className="mt-4 text-[15px]">Typical {e.name.toLowerCase()} coverage: <strong>{vh} hours = ${hourPrice("video", vh).toLocaleString()}</strong></p>
            <p className="mt-2 text-sm text-muted">Highlight video set to music you choose, delivered in 2 to 4 weeks.</p>
            <Link href={`/book?service=${videoSvc}${q}`} className="btn-dark mt-6 w-full">Book Videography</Link>
          </div>
        </div>
        <p className="mb-8 text-center text-sm text-muted">{e.suggestedHours.note}</p>
        {photo && <Pricing packages={photo.packages.filter((p) => !p.quoteOnly)} serviceSlug={photoSvc} citySlug={citySlug} />}
      </div>
    </section>
  );
}

function Work({ e, images, seed, alt }: { e: EventType; images: string[]; seed: number; alt: string }) {
  const videos = videosFor(e.videoTags as Tag[], 3, seed);
  if (!videos.length && !images.length) return null;
  return (
    <section className="bg-black px-4 py-16 text-white md:px-6" data-reveal>
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-10 text-center font-serif text-3xl">Our work</h2>
        {videos.length > 0 && <VideoGrid videos={videos} />}
        {images.length > 0 && <div className={videos.length ? "mt-10" : ""}><Gallery images={images} alt={alt} /></div>}
      </div>
    </section>
  );
}

/* ─────────────────────────── Event × City ─────────────────────────── */

export function EventCityPage({ e, city }: { e: EventType; city: City }) {
  const c = eventCityContent(e, city);
  const region = getRegionByCode(city.state)!;
  const { photoSvc, videoSvc } = eventServices(e);
  const url = `/${e.slug}/${city.slug}`;
  const bookHref = `/book?service=${photoSvc}&city=${city.slug}`;
  const pick = photoPicker();
  const pool = photosFor(e, city.id);
  const hero = bannerSafe(pool).length ? pick.one(bannerSafe(pool)) : undefined;
  const images = pick.many(8, pool);
  const others = EVENT_TYPES.filter((x) => x.slug !== e.slug);
  const crumbs = [{ name: "Home", href: "/" }, { name: e.name, href: `/${e.slug}` }, { name: region.name, href: `/${e.slug}/${region.slug}` }, { name: city.name, href: url }];

  return (
    <>
      <JsonLd
        data={serviceSchema({
          name: c.h1,
          serviceType: `${e.name} photography and videography`,
          description: c.metaDescription,
          url,
          area: { type: "City", name: cityLabel(city), containedIn: city.stateName },
          prices: [c.cost.from, c.cost.photo, c.cost.video],
        })}
      />
      <PageHero image={hero} eyebrow={`${city.stateName} · ${e.name}`} title={c.h1} subtitle={c.subtitle}>
        <Link href={bookHref} className="btn-gold">Book Now — from ${c.cost.from}</Link>
        <a href="#pricing" className="btn-outline">See prices</a>
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={crumbs} />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 lg:grid-cols-5">
        <div className="prose-ms text-[17px] text-ink lg:col-span-3">
          <p className="eyebrow">MacroSnaps in {city.name}</p>
          <h2 className="mb-6 mt-3 font-serif text-3xl md:text-4xl">{e.name} in {city.name}: photography & video</h2>
          {c.intro.map((p) => <p key={p}>{p}</p>)}
        </div>
        <aside className="lg:col-span-2">
          <div className="marble border border-black/5 p-7">
            <h2 className="font-serif text-2xl">Typical {c.noun} coverage in {city.name}</h2>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex justify-between gap-4"><dt>Photography, {c.cost.ph} hours</dt><dd className="font-semibold">${c.cost.photo.toLocaleString()}</dd></div>
              <div className="flex justify-between gap-4"><dt>Videography, {c.cost.vh} hours</dt><dd className="font-semibold">${c.cost.video.toLocaleString()}</dd></div>
            </dl>
            <ul className="mt-6 space-y-3 border-t border-black/10 pt-5 text-[15px]">
              {["13+ years and 6,000+ events", "Our own crews across " + city.stateName, "Insured by State Farm ($1M / $2M)", "Retouched gallery in about a week", "Same published price for everyone"].map((x) => (
                <li key={x} className="flex gap-3"><IconCheck className="mt-1 h-4 w-4 shrink-0 text-gold-dark" />{x}</li>
              ))}
            </ul>
            <Link href={bookHref} className="btn-dark mt-7 w-full">Check Availability & Book</Link>
            <p className="mt-3 text-center text-sm text-muted">or call <a href={SITE.phoneHref} className="underline">{SITE.phone}</a></p>
          </div>
        </aside>
      </section>

      <Moments e={e} where={city.name} />
      <EventPricing e={e} where={city.name} citySlug={city.slug} />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow={`Local to ${city.name}`} title={c.local.heading} />
        <div className="prose-ms mx-auto max-w-3xl text-center text-muted">{c.local.paragraphs.map((x) => <p key={x}>{x}</p>)}</div>
        {c.local.lists.length > 0 && (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.local.lists.map((l) => (
              <div key={l.title} className="border-t-2 border-gold pt-4">
                <h3 className="font-serif text-lg">{l.title}</h3>
                <ul className="mt-3 space-y-1.5 text-sm text-muted">{l.items.map((i) => <li key={i}>{i}</li>)}</ul>
              </div>
            ))}
          </div>
        )}
      </section>

      <PhotoSpots city={city} bookHref={bookHref} />

      <Work e={e} images={images} seed={city.id} alt={`${e.name} in ${city.name}`} />
      <Planning e={e} where={city.name} />
      <WhyUs where={city.name} title={`Why ${city.name} clients choose MacroSnaps`} />

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Simple booking" title={`How booking ${an(e.pro)} ${e.pro} in ${city.name} works`} />
        <HowItWorks />
      </section>

      <section className="bg-marble px-4 py-16 md:px-6">
        <SectionTitle eyebrow="FAQ" title={`${e.name} in ${city.name}: common questions`} />
        <Faqs faqs={c.faqs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-3">
          <div>
            <h2 className="font-serif text-2xl">{e.name} near {city.name}</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              {c.nearby.map((n) => (
                <li key={n.slug}><Link className={linkCls} href={`/${e.slug}/${n.slug}`}>{e.pro} in {n.name}, {n.state}</Link></li>
              ))}
              <li><Link className={`font-semibold ${linkCls}`} href={`/${e.slug}/${region.slug}`}>{e.pro}s in {region.name} →</Link></li>
              <li><Link className={`font-semibold ${linkCls}`} href={`/${e.slug}`}>{e.h1} →</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">Services in {city.name}</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              {[photoSvc, videoSvc].map((s) => (
                <li key={s}><Link className={linkCls} href={`/${s}/${city.slug}`}>{svcLabel(s)} in {city.name}</Link></li>
              ))}
              <li><Link className={linkCls} href={`/photographers/${city.slug}`}>Photographers in {city.name}</Link></li>
              <li><Link className={linkCls} href={`/videographers/${city.slug}`}>Videographers in {city.name}</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">Other events we cover in {city.name}</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              {others.map((o) => (
                <li key={o.slug}><Link className={linkCls} href={`/${o.slug}/${city.slug}`}>{o.pro} in {city.name}</Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand title={`Book your ${e.pro} in ${city.name}`} text="Same published price for every client. Choose your hours, pick your date and pay securely online." bookHref={bookHref} />
    </>
  );
}

/* ─────────────────────────── Event × State / province ─────────────────────────── */

export function EventRegionPage({ e, region }: { e: EventType; region: Region }) {
  const c = eventRegionContent(e, region);
  const { photoSvc, videoSvc } = eventServices(e);
  const url = `/${e.slug}/${region.slug}`;
  const bookHref = `/book?service=${photoSvc}`;
  const seed = region.slug.length * 7 + region.name.charCodeAt(0);
  const pick = photoPicker();
  const pool = photosFor(e, seed);
  const hero = bannerSafe(pool).length ? pick.one(bannerSafe(pool)) : undefined;
  const images = pick.many(8, pool);
  const others = EVENT_TYPES.filter((x) => x.slug !== e.slug);

  return (
    <>
      <JsonLd data={serviceSchema({ name: c.h1, serviceType: `${e.name} photography and videography`, description: c.metaDescription, url, area: { type: "State", name: region.name }, prices: [c.cost.from, c.cost.photo, c.cost.video] })} />
      <PageHero image={hero} eyebrow={region.country === "canada" ? "Canada" : "United States"} title={c.h1} subtitle={c.intro[0]}>
        <Link href={bookHref} className="btn-gold">Book Now — from ${c.cost.from}</Link>
        <a href="#cities" className="btn-outline">Find your city</a>
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: e.name, href: `/${e.slug}` }, { name: region.name, href: url }]} />

      <section className="mx-auto max-w-4xl px-4 py-14 md:px-6">
        <div className="prose-ms text-[17px]">{c.intro.slice(1).map((p) => <p key={p}>{p}</p>)}</div>
      </section>

      <section id="cities" className="mx-auto max-w-7xl px-4 pb-14 md:px-6">
        <SectionTitle eyebrow={region.name} title={`${e.pro}s in ${region.name} cities`} />
        <ul className="grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {c.cities.map((city) => (
            <li key={city.slug}><Link href={`/${e.slug}/${city.slug}`} className={linkCls}>{e.pro} in {city.name}</Link></li>
          ))}
        </ul>
      </section>

      <Moments e={e} where={region.name} />
      <EventPricing e={e} where={region.name} />
      <Work e={e} images={images} seed={seed} alt={`${e.name} in ${region.name}`} />
      <Planning e={e} where={region.name} />
      <WhyUs where={region.name} title={`Why clients across ${region.name} choose MacroSnaps`} />

      <section className="bg-marble px-4 py-16 md:px-6">
        <SectionTitle eyebrow="FAQ" title={`${e.name} in ${region.name}: common questions`} />
        <Faqs faqs={c.faqs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-12 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl">Services in {region.name}</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              <li><Link className={linkCls} href={`/${e.slug}`}>{e.h1}</Link></li>
              {[photoSvc, videoSvc].map((s) => <li key={s}><Link className={linkCls} href={`/${s}/${region.slug}`}>{svcLabel(s)} in {region.name}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">Other events we cover in {region.name}</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-[15px] sm:grid-cols-2">
              {others.map((o) => <li key={o.slug}><Link className={linkCls} href={`/${o.slug}/${region.slug}`}>{o.name}</Link></li>)}
            </ul>
          </div>
        </div>
      </section>

      <CtaBand title={`Book ${e.name.toLowerCase()} coverage in ${region.name}`} text="Same published price for every client. Choose your hours, pick your date and pay securely online." bookHref={bookHref} />
    </>
  );
}
