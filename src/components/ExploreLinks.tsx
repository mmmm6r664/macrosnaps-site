import Link from "next/link";
import { EVENT_TYPES } from "@/data/eventTypes";
import { VERTICALS } from "@/data/verticals";

/** Interlinking block: event types, industries and solutions. */
export default function ExploreLinks({ where, focus = "all" }: { where?: string; focus?: "events" | "business" | "all" }) {
  const showEvents = focus !== "business";
  const showBiz = focus !== "events";
  return (
    <section className="border-t border-black/5 px-4 py-14 md:px-6" data-reveal>
      <div className={`mx-auto grid max-w-7xl gap-10 ${showEvents && showBiz ? "lg:grid-cols-3" : "md:grid-cols-2"}`}>
        {showEvents && (
          <div className={showBiz ? "" : "md:col-span-2"}>
            <h2 className="font-serif text-2xl">Events we cover{where ? ` in ${where}` : ""}</h2>
            <ul className={`mt-4 grid gap-x-6 gap-y-2 text-[15px] ${showBiz ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-1" : "grid-cols-2 md:grid-cols-3"}`}>
              {EVENT_TYPES.map((e) => <li key={e.slug}><Link href={`/${e.slug}`} className="hover:text-gold-dark hover:underline">{e.name}</Link></li>)}
            </ul>
          </div>
        )}
        {showBiz && (
          <>
            <div>
              <h2 className="font-serif text-2xl">Industries we serve</h2>
              <ul className="mt-4 grid grid-cols-1 gap-y-2 text-[15px] sm:grid-cols-2 lg:grid-cols-1">
                {VERTICALS.filter((v) => v.kind === "industry").map((v) => <li key={v.slug}><Link href={`/industries/${v.slug}`} className="hover:text-gold-dark hover:underline">{v.name}</Link></li>)}
              </ul>
            </div>
            <div>
              <h2 className="font-serif text-2xl">Solutions</h2>
              <ul className="mt-4 grid grid-cols-1 gap-y-2 text-[15px] sm:grid-cols-2 lg:grid-cols-1">
                {VERTICALS.filter((v) => v.kind === "solution").map((v) => <li key={v.slug}><Link href={`/solutions/${v.slug}`} className="hover:text-gold-dark hover:underline">{v.name}</Link></li>)}
              </ul>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
