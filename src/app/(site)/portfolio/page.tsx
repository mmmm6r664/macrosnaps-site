import type { Metadata } from "next";
import Image from "next/image";
import { IMG, photoPicker } from "@/lib/images";
import { EVENTS } from "@/lib/clients";
import { SERVICES } from "@/lib/services";
import { ClientLogos, CtaBand, Gallery, SectionTitle } from "@/components/blocks";
import { ALBUMS, driveEmbedUrl, driveFolderUrl } from "@/lib/albums";

export const metadata: Metadata = { title: "Portfolio: Conference, Event & Wedding Photography", description: "Portfolio of MacroSnaps photography and videography: conferences, corporate events, weddings, engagements and portraits.", alternates: { canonical: "/portfolio" } };

export default function Portfolio() {
  const pick = photoPicker();
  const raw = [
    { title: "Conferences & Corporate", images: [...new Set([...IMG.conference, ...(SERVICES.find((s) => s.slug === "conference-photography")?.images ?? [])])] },
    { title: "Weddings & Engagements", images: [...new Set([...IMG.wedding, ...IMG.engagement])] },
    { title: "Events & Celebrations", images: SERVICES.find((s) => s.slug === "event-photography")?.images ?? IMG.event },
    { title: "Portraits & Family", images: [...new Set([...IMG.personal, ...(SERVICES.find((s) => s.slug === "newborn-photography")?.images ?? [])])] },
    { title: "Commercial & Product", images: SERVICES.find((s) => s.slug === "product-photography")?.images ?? IMG.commercial },
  ];
  const sets = raw.map((r) => ({ title: r.title, images: pick.many(16, r.images) }));
  return (
    <>
      <section className="bg-black px-4 py-16 text-center text-white">
        <h1 className="font-script text-5xl md:text-6xl">Portfolio</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">Photography and videography for conferences, companies, couples and families across the US, Ontario and Quebec.</p>
      </section>
      {ALBUMS.some((a) => a.photos.length) && (
        <section id="recent-galleries" className="bg-marble px-4 py-14 md:px-6">
          <div className="mx-auto max-w-7xl">
            <SectionTitle eyebrow="Recent client galleries" title="See complete events, not just highlights" intro="Browse full galleries from recent conferences and weddings: every photo the client received, exactly as delivered." />
            <div className="space-y-14">
              {ALBUMS.filter((a) => a.photos.length).map((a) => (
                <article key={a.key}>
                  <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
                    <div>
                      <h3 className="font-serif text-3xl">{a.title}</h3>
                      <p className="text-sm text-muted">{a.subtitle} · {a.count} photos delivered</p>
                    </div>
                    <a href={driveFolderUrl(a.folderId)} target="_blank" rel="noopener noreferrer" className="btn-outline !py-2.5">View full album ↗</a>
                  </div>
                  <Gallery images={a.photos.map((p) => p.src)} alt={a.title} />
                  <details className="group mt-4 border border-black/10 bg-white">
                    <summary className="flex cursor-pointer items-center justify-between px-5 py-4 font-semibold">Browse all {a.count} photos from this {a.title.toLowerCase().includes("wedding") ? "wedding" : "event"}<span className="text-gold-dark transition group-open:rotate-180">▾</span></summary>
                    <iframe title={`${a.title}: full gallery`} src={driveEmbedUrl(a.folderId)} loading="lazy" className="h-[70vh] w-full border-t border-black/10 bg-white" />
                  </details>
                </article>
              ))}
            </div>
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
