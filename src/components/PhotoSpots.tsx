import Link from "next/link";
import { City, cityLabel, photoSpotsFor } from "@/lib/geo";

/** "Best photo & video spots in {City}" — real researched spots only; nearest city's spots (≤ 60 mi) as a fallback. */
export default function PhotoSpots({ city, bookHref }: { city: City; bookHref: string }) {
  const s = photoSpotsFor(city);
  if (!s) return null;
  const title = s.own ? `Best photo & video spots in ${city.name}` : `Best photo & video spots near ${city.name}: in ${s.from.name}`;
  const intro = s.own
    ? `Planning portraits, a first look or extra B-roll away from the venue? These are some of the most photographed places in and around ${city.name}.`
    : `Looking for a scenic spot for portraits or B-roll? These favorite photo and video locations are in ${cityLabel(s.from)}, about ${s.miles} mile${s.miles === 1 ? "" : "s"} from ${city.name}.`;
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <p className="eyebrow mb-3">{s.own ? `Around ${city.name}` : `Near ${city.name}`}</p>
        <h2 className="font-serif text-3xl leading-tight text-ink md:text-4xl">{title}</h2>
        <p className="mt-4 leading-relaxed text-muted">{intro}</p>
      </div>
      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {s.spots.map((spot, i) => (
          <li key={spot} className="border-t-2 border-gold bg-marble p-5">
            <span className="font-serif text-2xl text-gold-dark">0{i + 1}</span>
            <p className="mt-1 font-serif text-lg leading-snug">{spot}</p>
          </li>
        ))}
      </ol>
      <p className="mx-auto mt-8 max-w-3xl text-center text-sm text-muted">
        To add a portrait or filming stop, book the extra hours and note the location for your crew. Some parks and landmarks require a permit or have set hours, so check before the day.{" "}
        <Link href={bookHref} className="font-semibold text-ink underline">Book online</Link>
        {!s.own && <> · <Link href={`/photographers/${s.from.slug}`} className="underline">Photographers in {cityLabel(s.from)}</Link></>}
      </p>
    </section>
  );
}
