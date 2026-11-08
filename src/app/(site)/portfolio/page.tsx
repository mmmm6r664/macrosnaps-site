import type { Metadata } from "next";
import Image from "next/image";
import { IMG, photoPicker } from "@/lib/images";
import { EVENTS } from "@/lib/clients";
import { SERVICES } from "@/lib/services";
import { ClientLogos, CtaBand, Gallery, SectionTitle } from "@/components/blocks";
import Link from "next/link";
import { ALBUMS, FEATURED } from "@/lib/albums";
import AlbumGrid from "@/components/AlbumGrid";

export const metadata: Metadata = { title: "Portfolio: Conference, Event & Wedding Photography", description: "Portfolio of MacroSnaps photography and videography: conferences, corporate events, weddings, engagements and portraits.", alternates: { canonical: "/portfolio" } };

export default function Portfolio() {
  const pick = photoPicker();
  const raw = [
    { title: "Conferences & Corporate", images: [...new Set([...IMG.conference, ...(SERVICES.find((s) => s.slug === "conference-photography")?.images ?? [])])] },
    { title: "Weddings & Engagements", images: [...new Set([...IMG.wedding, ...IMG.engagement])] },
    { title: "Events & Celebrations", images: SERVICES.find((s) => s.slug === "event-photography")?.images ?? IMG.event },
    { title: "Portraits & Family", images: [...new Set([...IMG.personal, ...(SERVICES.find((s) => s.slug === "newborn-photography")?.images ?? [])])] },
  ];
  const sets = raw.map((r) => ({ title: r.title, images: pick.many(16, r.images) })).filter((s) => s.images.length);
  return (
    <>
      <section className="bg-black px-4 py-16 text-center text-white">
        <h1 className="font-script text-5xl md:text-6xl">Portfolio</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">Photography and videography for conferences, companies, couples and families across the US, Ontario and Quebec.</p>
      </section>
      {FEATURED.length > 0 && (
        <section id="featured" className="px-4 py-14 md:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Featured galleries" title="Some of our favorite work" intro="Hand-picked galleries from conferences, weddings, galas and family sessions. Tap any one to see more." />
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {FEATURED.map((a, i) => (
                <Link key={a.slug} href={`/portfolio/${a.slug}`} className={`group relative block overflow-hidden bg-black ${i === 0 ? "sm:col-span-2 lg:row-span-2" : ""}`}>
                  <div className={`relative ${i === 0 ? "aspect-[4/3] lg:aspect-auto lg:h-full lg:min-h-[520px]" : "aspect-[4/3]"}`}>
                    {a.cover && <Image src={a.cover} alt={a.photos[0]?.alt ?? a.displayTitle} fill sizes={i === 0 ? "(min-width:1024px) 66vw, 100vw" : "(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"} className="object-cover transition duration-500 group-hover:scale-105" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                      <p className="text-xs uppercase tracking-[0.2em] text-gold">{a.group}</p>
                      <h3 className={`mt-1 font-serif ${i === 0 ? "text-3xl" : "text-xl"}`}>{a.displayTitle}</h3>
                      <p className="mt-1 text-sm text-white/75">View gallery →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
      {ALBUMS.length > 0 && (
        <section id="galleries" className="bg-marble px-4 py-14 md:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Client galleries" title="All client galleries" intro={`Browse ${ALBUMS.length} recent galleries from weddings, conferences, galas and celebrations: the best moments, plus every photo the client received.`} />
            <AlbumGrid albums={ALBUMS.map((a) => ({ slug: a.slug, title: a.displayTitle, group: a.group, count: a.photoCount, cover: a.cover, eventType: a.eventType }))} />
          </div>
        </section>
      )}
      {sets.map((s) => (
        <section key={s.title} className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <h2 className="mb-6 font-serif text-3xl">{s.title}</h2>
          <Gallery images={s.images} alt={s.title} />
        </section>
      ))}
      <section id="events" className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Event coverage" title="Conferences & events we've covered" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {EVENTS.map((e) => {
              const card = (
                <article className="h-full bg-white">
                  {e.image && <div className="relative aspect-[16/10]"><Image src={e.image} alt={e.name} fill sizes="25vw" className="object-cover" /></div>}
                  <div className="p-4"><h3 className="font-serif text-lg leading-snug">{e.name}</h3><p className="mt-1 text-xs text-muted">{[e.where, e.year].filter(Boolean).join(" · ")}{e.status === "partner" ? " · Official media partner" : ""}</p></div>
                </article>
              );
              return e.url ? <a key={e.name} href={e.url} target="_blank" rel="noopener">{card}</a> : <div key={e.name}>{card}</div>;
            })}
          </div>
        </div>
      </section>
      <ClientLogos />
      <CtaBand title="Let's create something together" />
    </>
  );
}
