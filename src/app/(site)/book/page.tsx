import type { Metadata } from "next";
import BookingForm from "@/components/BookingForm";
import { BOOKABLE_SERVICES, PAUSED_SERVICES } from "@/lib/services";
import { cities, cityLabel } from "@/lib/geo";
import { TrustBar } from "@/components/blocks";
import { addonCatalog } from "@/lib/addons";
import { currentClient } from "@/lib/clientAuth";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Book Now: Photography & Videography Online",
  description: "Book and pay for your MacroSnaps photographer or videographer online: conferences, corporate events, weddings and more across the US, Ontario & Quebec.",
  alternates: { canonical: "/book" },
};

type SP = { service?: string; package?: string; city?: string; cancelled?: string };

export default async function BookPage({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const client = await currentClient();
  const me = client ? { firstName: client.first_name, lastName: client.last_name, email: client.email, phone: client.phone ?? "" } : undefined;
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
        <p className="mb-6 border border-black/10 bg-white px-4 py-3 text-sm">
          {client ? <>Signed in as <b>{client.email}</b>. Your details are filled in, and this booking will appear in <Link href="/account" className="underline">your account</Link>.</>
            : <>Booked with us before? <Link href="/account/login?next=/account" className="font-semibold underline">Sign in</Link> (email, Google or Facebook) to fill in your details and track your orders and galleries.</>}
        </p>
        <BookingForm me={me} services={services} cities={cityOpts} addons={addonCatalog()} paused={PAUSED_SERVICES} initial={{ service: sp.service, package: sp.package, city: sp.city, cancelled: sp.cancelled === "1" }} />
      </div>
    </>
  );
}
