import type { Metadata } from "next";
import Image from "next/image";
import { IMG } from "@/lib/images";
import { EVENTS } from "@/lib/clients";
import { SERVICES } from "@/lib/services";
import { ClientLogos, CtaBand, Gallery, SectionTitle } from "@/components/blocks";

export const metadata: Metadata = { title: "Portfolio: Conference, Event & Wedding Photography", description: "Portfolio of MacroSnaps photography and videography: conferences, corporate events, weddings, engagements and portraits.", alternates: { canonical: "/portfolio" } };

export default function Portfolio() {
  const sets = [
    { title: "Conferences & Corporate", images: [...new Set([...IMG.conference, ...(SERVICES.find((s) => s.slug === "conference-photography")?.images ?? [])])] },
    { title: "Weddings & Engagements", images: [...new Set([...IMG.wedding, ...IMG.engagement])] },
    { title: "Events & Celebrations", images: SERVICES.find((s) => s.slug === "event-photography")?.images ?? IMG.event },
    { title: "Portraits & Family", images: [...new Set([...IMG.personal, ...(SERVICES.find((s) => s.slug === "newborn-photography")?.images ?? [])])] },
    { title: "Commercial & Product", images: SERVICES.find((s) => s.slug === "product-photography")?.images ?? IMG.commercial },
  ];
  return (
    <>
      <section className="bg-black px-4 py-16 text-center text-white">
        <h1 className="font-script text-5xl md:text-6xl">Portfolio</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">We have provided videography and photography services to conferences, companies, couples and families across North America.</p>
      </section>
      {sets.map((s) => (
        <section key={s.title} className="mx-auto max-w-7xl px-4 py-12 md:px-6">
          <h2 className="mb-6 font-serif text-3xl">{s.title}</h2>
          <Gallery images={s.images.slice(0, 16)} alt={s.title} />
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
