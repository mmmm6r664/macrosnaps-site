import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { BOOKABLE_SERVICES } from "@/lib/services";
import { cities, cityLabel } from "@/lib/geo";
import { TrustBar } from "@/components/blocks";
import { addonCatalog } from "@/lib/addons";

export const metadata: Metadata = {
  title: "Book Now: Photography & Videography Online",
  description: "Book and pay for your MacroSnaps photographer or videographer online: conferences, corporate events, weddings and more across the US, Ontario & Quebec.",
  alternates: { canonical: "/book" },
};

type SP = { service?: string; package?: string; city?: string; cancelled?: string };

export default async function BookPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const services = BOOKABLE_SERVICES.map((s) => ({ slug: s.slug, name: s.name, kind: s.kind, group: s.group, packages: s.packages.filter((p) => !p.quoteOnly).map(({ id, name, price, priceNote, features, hours }) => ({ id, name, price, priceNote, features, hours })) }));
  const cityOpts = [...cities].sort((a, b) => b.population - a.population).map((c) => ({ slug: c.slug, label: cityLabel(c), state: c.state }));
  return (
    <>
      <section className="bg-black px-4 py-14 text-center text-white">
        <h1 className="font-script text-5xl md:text-6xl">Book Now</h1>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">Choose your package, pick your date and pay securely online. Your slot is reserved as soon as payment is complete.</p>
      </section>
      <TrustBar />
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <BookingForm services={services} cities={cityOpts} addons={addonCatalog()} initial={{ service: sp.service, package: sp.package, city: sp.city, cancelled: sp.cancelled === "1" }} />
      </div>
    </>
  );
}
