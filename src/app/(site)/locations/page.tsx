import type { Metadata } from "next";
import Link from "next/link";
import { usRegions, caRegions, citiesIn } from "@/lib/geo";
import { SectionTitle } from "@/components/blocks";

export const metadata: Metadata = {
  title: "Locations: Photographers in Every State, Ontario & Quebec",
  description: "MacroSnaps covers all 50 US states, Washington, DC, Ontario and Quebec. Find conference, event and wedding photographers and videographers in 1,690+ cities.",
  alternates: { canonical: "/locations" },
};

export default function Locations() {
  const block = (title: string, id: string, regions: typeof usRegions) => (
    <section id={id} className="mx-auto max-w-7xl px-4 py-12 md:px-6">
      <h2 className="mb-8 font-serif text-3xl">{title}</h2>
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {regions.map((r) => (
          <div key={r.slug}>
            <h3 className="border-b border-gold pb-2 font-serif text-xl"><Link href={`/photographers/${r.slug}`} className="hover:text-gold-dark">{r.name}</Link></h3>
            <ul className="mt-3 columns-2 gap-4 text-sm">
              {citiesIn(r.code).map((c) => <li key={c.slug} className="mb-1"><Link href={`/photographers/${c.slug}`} className="hover:text-gold-dark hover:underline">{c.name}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
  return (
    <>
      <section className="bg-black px-4 py-16 text-center text-white">
        <h1 className="font-script text-5xl md:text-6xl">Locations We Serve</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">Our own photographers and videographers cover conferences, corporate events and weddings in every US state, Washington, DC, Ontario and Quebec.</p>
      </section>
      <div className="pt-6"><SectionTitle title="Choose your state, province or city" /></div>
      {block("United States", "united-states", usRegions)}
      {block("Canada", "canada", caRegions)}
    </>
  );
}
