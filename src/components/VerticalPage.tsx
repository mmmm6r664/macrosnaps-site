import Link from "next/link";
import type { Vertical } from "@/data/verticals";
import { VERTICALS } from "@/data/verticals";
import { getService, RATES } from "@/lib/services";
import { byTags, photoPicker, bannerSafe } from "@/lib/images";
import { videosFor } from "@/data/videos";
import { VERTICAL_MEDIA } from "@/lib/pageMedia";
import { PageHero, TrustBar, SectionTitle, Faqs, Gallery, Breadcrumbs, CtaBand, HowItWorks } from "./blocks";
import VideoGrid from "./VideoGrid";
import WhyUs from "./WhyUs";
import JsonLd from "./JsonLd";
import { serviceSchema } from "@/lib/schema";
import { IconCheck } from "./Icons";
import { SITE } from "@/lib/site";
import { topCities, cityLabel } from "@/lib/geo";

export default function VerticalPage({ v }: { v: Vertical }) {
  const base = v.kind === "industry" ? "/industries" : "/solutions";
  const media = VERTICAL_MEDIA[v.slug] ?? { photos: [], videos: [] };
  const pick = photoPicker();
  const own = media.photos.length ? byTags(...media.photos) : [];
  const hero = bannerSafe(own).length ? pick.one(bannerSafe(own)) : undefined;
  const gallery = pick.many(8, own);
  const videos = media.videos.length ? videosFor(media.videos, 3) : [];
  const services = v.services.map((s) => getService(s)).filter(Boolean);
  const related = v.related.map((r) => VERTICALS.find((x) => x.slug === r)).filter(Boolean) as Vertical[];
  const bookSvc = services[0]?.slug ?? "commercial-photography";

  return (
    <>
      <JsonLd data={serviceSchema({ name: v.h1, serviceType: v.name, description: v.description, url: `${base}/${v.slug}`, prices: [RATES.photo.first + RATES.photo.extra, RATES.video.first + RATES.video.extra] })} />
      <PageHero image={hero} eyebrow={v.eyebrow} title={v.h1} subtitle={v.description}>
        <Link href={`/book?service=${bookSvc}`} className="btn-gold">See Prices & Book</Link>
        <a href="#contact" className="btn-outline">Talk to our team</a>
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: v.kind === "industry" ? "Industries" : "Solutions", href: base }, { name: v.name, href: `${base}/${v.slug}` }]} />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 lg:grid-cols-5" data-reveal>
        <div className="prose-ms text-[17px] lg:col-span-3">
          <h2 className="mb-5 font-serif text-3xl">{v.kind === "industry" ? `How MacroSnaps helps ${v.name.toLowerCase()}` : `What ${v.name.toLowerCase()} includes`}</h2>
          {v.intro.map((p) => <p key={p}>{p}</p>)}
        </div>
        <aside className="lg:col-span-2">
          <div className="marble border border-black/5 p-7">
            <h3 className="font-serif text-2xl">Where your content gets used</h3>
            <ul className="mt-5 space-y-3">{v.uses.map((u) => <li key={u} className="flex gap-3"><IconCheck className="mt-1 h-4 w-4 shrink-0 text-gold-dark" />{u}</li>)}</ul>
            <p className="mt-6 border-t border-black/10 pt-4 text-sm text-muted">Photography ${RATES.photo.first} first hour + ${RATES.photo.extra}/hr · Videography ${RATES.video.first} first hour + ${RATES.video.extra}/hr · {RATES.minHours}-hour minimum. Same published price for every client.</p>
            <Link href={`/book?service=${bookSvc}`} className="btn-dark mt-5 w-full">Book online</Link>
          </div>
        </aside>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="The challenge" title={v.kind === "industry" ? `What ${v.name.toLowerCase()} need from photos & video` : "Why it matters"} />
          <div className="grid gap-8 md:grid-cols-3">
            {v.challenges.map((c) => <div key={c.title} className="bg-white p-7 shadow-sm"><h3 className="font-serif text-xl">{c.title}</h3><p className="mt-3 text-muted">{c.body}</p></div>)}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Deliverables" title="What we create for you" />
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
          {v.deliverables.map((d, i) => (
            <div key={d.title} className="border-t-2 border-gold pt-4"><span className="font-serif text-2xl text-gold-dark">0{i + 1}</span><h3 className="mt-1 font-serif text-xl">{d.title}</h3><p className="mt-2 text-muted">{d.body}</p></div>
          ))}
        </div>
      </section>

      {(gallery.length > 0 || videos.length > 0) && (
        <section className="bg-black px-4 py-16 text-white md:px-6" data-reveal>
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-10 text-center font-serif text-3xl">Our work</h2>
            {videos.length > 0 && <VideoGrid videos={videos} />}
            {gallery.length > 0 && <div className={videos.length ? "mt-10" : ""}><Gallery images={gallery} alt={v.name} /></div>}
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Services" title="Services for this project" intro="Book any of these online at our published rates." />
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s) => (
            <Link key={s!.slug} href={`/${s!.slug}`} className="border border-black/10 p-5 transition hover:-translate-y-0.5 hover:border-gold-dark hover:shadow-md">
              <span className="font-serif text-lg">{s!.name}</span>
              <span className="mt-1 block text-sm text-muted">{s!.coverage.slice(0, 3).join(" · ")}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="marble px-4 py-14 md:px-6" data-reveal>
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 text-center md:flex-row md:text-left">
          <div className="flex-1">
            <p className="eyebrow">Need a website, ads or SEO too?</p>
            <h2 className="mt-2 font-serif text-2xl">Our sister agency MacroHype puts your photos & videos to work</h2>
            <p className="mt-3 text-muted">{v.macrohype}</p>
          </div>
          <a href={SITE.parentUrl} target="_blank" rel="noopener" className="btn-dark shrink-0">Visit MacroHype</a>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="How it works" title="Simple, transparent booking" />
        <HowItWorks />
      </section>

      <WhyUs where={v.name} />

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="FAQ" title={`${v.name}: common questions`} />
        <Faqs faqs={v.faqs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6" data-reveal>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl">Related {v.kind === "industry" ? "industries" : "solutions"}</h2>
            <ul className="mt-4 space-y-2">{related.map((r) => <li key={r.slug}><Link href={`${r.kind === "industry" ? "/industries" : "/solutions"}/${r.slug}`} className="hover:text-gold-dark hover:underline">{r.h1}</Link></li>)}</ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">Available in your city</h2>
            <ul className="mt-4 grid grid-cols-2 gap-2 text-[15px]">{topCities(12).map((c) => <li key={c.slug}><Link href={`/photographers/${c.slug}`} className="hover:text-gold-dark hover:underline">{cityLabel(c)}</Link></li>)}</ul>
            <Link href="/locations" className="mt-3 inline-block text-sm font-semibold underline">All locations →</Link>
          </div>
        </div>
      </section>

      <span id="contact" />
      <CtaBand title={`Let's plan your ${v.kind === "industry" ? "shoot" : "project"}`} text="Pick your hours and book online, or call us to plan a multi-day or multi-location production." bookHref={`/book?service=${bookSvc}`} />
    </>
  );
}

export function VerticalIndex({ kind }: { kind: "industry" | "solution" }) {
  const list = VERTICALS.filter((v) => v.kind === kind);
  const base = kind === "industry" ? "/industries" : "/solutions";
  return (
    <>
      <PageHero eyebrow={kind === "industry" ? "Industries" : "Solutions"} title={kind === "industry" ? "Photography & Video by Industry" : "Photo & Video Solutions"} subtitle={kind === "industry" ? "Dental and medical practices, restaurants and food brands, law firms, hotels, gyms, salons, startups and more — photos and videos built for how your industry sells." : "Video ads for Google, Facebook and local TV, social media content, menu photography, testimonial and recruiting videos, and more."} />
      <TrustBar />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((v) => (
            <Link key={v.slug} href={`${base}/${v.slug}`} className="group border border-black/10 p-7 transition hover:-translate-y-1 hover:border-gold-dark hover:shadow-lg" data-reveal>
              <p className="eyebrow">{v.eyebrow}</p>
              <h2 className="mt-2 font-serif text-2xl group-hover:text-gold-dark">{v.name}</h2>
              <p className="mt-3 text-sm text-muted">{v.description}</p>
            </Link>
          ))}
        </div>
      </section>
      <WhyUs />
    </>
  );
}
