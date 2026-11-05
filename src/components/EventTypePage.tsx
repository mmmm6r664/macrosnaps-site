import Link from "next/link";
import { EVENT_TYPES, type EventType } from "@/data/eventTypes";
import { RATES, hourPrice } from "@/lib/services";
import { byTags, photoPicker } from "@/lib/images";
import { videosFor, type Tag } from "@/data/videos";
import { EVENT_PHOTO_TAGS } from "@/lib/pageMedia";
import { topCities, cityLabel } from "@/lib/geo";
import { PageHero, TrustBar, SectionTitle, Faqs, Gallery, Breadcrumbs, CtaBand } from "./blocks";
import VideoGrid from "./VideoGrid";
import WhyUs from "./WhyUs";
import JsonLd from "./JsonLd";
import { serviceSchema } from "@/lib/schema";

export default function EventTypePage({ e }: { e: EventType }) {
  const pick = photoPicker();
  const own = byTags(...(EVENT_PHOTO_TAGS[e.slug] ?? ["event"]));
  const hero = own.length ? pick.one(own) : undefined;
  const gallery = pick.many(8, own);
  const videos = videosFor(e.videoTags as Tag[], 3, e.slug.length);
  const related = e.related.map((r) => EVENT_TYPES.find((x) => x.slug === r)).filter(Boolean) as EventType[];
  const isWedding = /wedding/.test(e.slug);
  const photoSvc = isWedding ? "wedding-photography" : /holiday|award|gala/.test(e.slug) ? "corporate-event-photography" : "event-photography";
  const videoSvc = isWedding ? "wedding-videography" : "event-videography";
  const photoCost = hourPrice("photo", Math.max(e.suggestedHours.photo, RATES.minHours));
  const videoCost = hourPrice("video", Math.max(e.suggestedHours.video, RATES.minHours));

  return (
    <>
      <JsonLd data={serviceSchema({ name: e.h1, serviceType: e.name, description: e.description, url: `/${e.slug}`, prices: [hourPrice("photo", 2), photoCost, videoCost] })} />
      <PageHero image={hero} eyebrow="Event photography & videography" title={e.h1} subtitle={e.description}>
        <Link href={`/book?service=${photoSvc}`} className="btn-gold">Book Photography</Link>
        <Link href={`/book?service=${videoSvc}`} className="btn-outline">Book Videography</Link>
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Events", href: "/events" }, { name: e.name, href: `/${e.slug}` }]} />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 lg:grid-cols-5" data-reveal>
        <div className="prose-ms text-[17px] lg:col-span-3">
          <h2 className="mb-5 font-serif text-3xl">Your {e.name.toLowerCase()} {isWedding ? "" : "celebration "}photographed and filmed with care</h2>
          {e.intro.map((p) => <p key={p}>{p}</p>)}
        </div>
        <aside className="lg:col-span-2">
          <div className="marble border border-black/5 p-7">
            <h3 className="font-serif text-2xl">Typical coverage & cost</h3>
            <dl className="mt-5 space-y-3 text-[15px]">
              <div className="flex justify-between gap-4"><dt>Photography, {e.suggestedHours.photo} hours</dt><dd className="font-semibold">${photoCost.toLocaleString()}</dd></div>
              <div className="flex justify-between gap-4"><dt>Videography, {e.suggestedHours.video} hours</dt><dd className="font-semibold">${videoCost.toLocaleString()}</dd></div>
            </dl>
            <p className="mt-3 text-sm text-muted">{e.suggestedHours.note}</p>
            <p className="mt-4 border-t border-black/10 pt-4 text-sm text-muted">Photography ${RATES.photo.first} first hour + ${RATES.photo.extra}/hr · Videography ${RATES.video.first} first hour + ${RATES.video.extra}/hr · {RATES.minHours}-hour minimum.</p>
            <Link href={`/book?service=${photoSvc}`} className="btn-dark mt-5 w-full">Check date & book</Link>
          </div>
        </aside>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="What we capture" title={`Key moments of a ${e.name.replace(/s$/, "").toLowerCase()}`} />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {e.moments.map((m, i) => (
              <div key={m.title} className="bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"><span className="font-serif text-2xl text-gold-dark">{String(i + 1).padStart(2, "0")}</span><h3 className="mt-1 font-serif text-lg">{m.title}</h3><p className="mt-2 text-sm text-muted">{m.body}</p></div>
            ))}
          </div>
        </div>
      </section>

      {(videos.length > 0 || gallery.length > 0) && (
        <section className="bg-black px-4 py-16 text-white md:px-6" data-reveal>
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 text-center font-serif text-3xl">Our work</h2>
            {videos.length > 0 && <VideoGrid videos={videos} />}
            {gallery.length > 0 && <div className={videos.length ? "mt-10" : ""}><Gallery images={gallery} alt={e.name} /></div>}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Planning tips" title="How to plan your coverage" />
        <div className="grid gap-8 md:grid-cols-2">
          {e.planning.map((p) => <div key={p.title} className="border-l-2 border-gold pl-5"><h3 className="font-serif text-xl">{p.title}</h3><p className="mt-2 text-muted">{p.body}</p></div>)}
        </div>
      </section>

      <WhyUs where={`Your ${e.name.toLowerCase()}`} />

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="FAQ" title={`${e.name}: frequently asked questions`} />
        <Faqs faqs={e.faqs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6" data-reveal>
        <div className="grid gap-10 md:grid-cols-3">
          <div>
            <h2 className="font-serif text-2xl">Related events</h2>
            <ul className="mt-4 space-y-2">{related.map((r) => <li key={r.slug}><Link href={`/${r.slug}`} className="hover:text-gold-dark hover:underline">{r.h1}</Link></li>)}<li><Link href="/events" className="font-semibold underline">All event types →</Link></li></ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">Services</h2>
            <ul className="mt-4 space-y-2">
              <li><Link href={`/${photoSvc}`} className="hover:text-gold-dark hover:underline">{photoSvc.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Link></li>
              <li><Link href={`/${videoSvc}`} className="hover:text-gold-dark hover:underline">{videoSvc.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Link></li>
              <li><Link href="/photo-booth" className="hover:text-gold-dark hover:underline">Photo Booth</Link></li>
              <li><Link href="/live-stream" className="hover:text-gold-dark hover:underline">Live Streaming</Link></li>
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">Popular cities</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-[15px]">{topCities(10).map((c) => <li key={c.slug}><Link href={`/${isWedding ? "wedding-photography" : "event-photography"}/${c.slug}`} className="hover:text-gold-dark hover:underline">{cityLabel(c)}</Link></li>)}</ul>
          </div>
        </div>
      </section>

      <CtaBand title={`Book your ${e.name.toLowerCase()} coverage`} text="Same published price for every client. Choose your hours, pick your date and pay securely online." bookHref={`/book?service=${photoSvc}`} />
    </>
  );
}

export function EventsIndex() {
  return (
    <>
      <PageHero eyebrow="Events" title="Event Photography & Videography" subtitle="Bar and Bat Mitzvahs, Indian and Pakistani weddings, quinceañeras, Sweet 16s, galas, award ceremonies, holiday parties and more — covered by our own crews across the US, Ontario and Quebec." />
      <TrustBar />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EVENT_TYPES.map((e) => (
            <Link key={e.slug} href={`/${e.slug}`} className="group border border-black/10 p-7 transition hover:-translate-y-1 hover:border-gold-dark hover:shadow-lg" data-reveal>
              <h2 className="font-serif text-2xl group-hover:text-gold-dark">{e.name}</h2>
              <p className="mt-3 text-sm text-muted">{e.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <WhyUs />
    </>
  );
}
