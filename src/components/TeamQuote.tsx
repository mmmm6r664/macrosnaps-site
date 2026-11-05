import Image from "next/image";

export const TEAM = [
  { name: "Juan", role: "Head Photographer, DC Metro Region", quote: "We aim to make all your events special.", image: "/team/juan-quote.jpg", regions: ["DC", "MD", "VA"] },
  { name: "Dusan", role: "Head Videographer, New York Metro Region", quote: "At MacroSnaps, we take your story seriously.", image: "/team/dusan-quote.jpg", regions: ["NY", "NJ", "CT"] },
];

/** Team quote images. With `region`, shows only that region's lead (nothing if none). */
export default function TeamQuote({ region, title = "The people behind the camera" }: { region?: string; title?: string }) {
  const members = region ? TEAM.filter((m) => m.regions.includes(region)) : TEAM;
  if (!members.length) return null;
  return (
    <section className="bg-white px-4 py-16 md:px-6" data-reveal>
      {!region && (
        <div className="mx-auto mb-10 max-w-3xl text-center">
          <p className="eyebrow">Meet our regional leads</p>
          <h2 className="mt-3 font-serif text-3xl md:text-4xl">{title}</h2>
        </div>
      )}
      <div className={`mx-auto grid max-w-7xl gap-6 ${members.length > 1 ? "lg:grid-cols-2" : "max-w-5xl"}`}>
        {members.map((m) => (
          <figure key={m.name} className="overflow-hidden rounded-lg border border-gold/40 shadow-lg">
            <Image src={m.image} alt={`${m.name}, ${m.role} at MacroSnaps: "${m.quote}"`} width={1600} height={900} sizes="(max-width: 1024px) 100vw, 50vw" className="h-auto w-full" />
          </figure>
        ))}
      </div>
    </section>
  );
}
