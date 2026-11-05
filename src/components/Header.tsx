import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { NAV_PHOTO, NAV_SERVICES, NAV_VIDEO } from "@/lib/nav";
import { IconChevron, IconMail, IconPhone } from "./Icons";
import CitySearch from "./CitySearch";

type Item = { label: string; href?: string; children?: readonly (readonly [string, string])[]; extra?: { href: string; label: string }[]; mega?: boolean };

const US_TOP = [
  ["new-york-city-ny", "New York City"], ["washington-dc", "Washington, DC"], ["los-angeles-ca", "Los Angeles"], ["chicago-il", "Chicago"],
  ["san-francisco-ca", "San Francisco"], ["boston-ma", "Boston"], ["miami-fl", "Miami"], ["atlanta-ga", "Atlanta"],
  ["dallas-tx", "Dallas"], ["houston-tx", "Houston"], ["las-vegas-nv", "Las Vegas"], ["philadelphia-pa", "Philadelphia"],
  ["seattle-wa", "Seattle"], ["san-diego-ca", "San Diego"], ["orlando-fl", "Orlando"], ["denver-co", "Denver"],
];
const CA_TOP = [["toronto-on", "Toronto"], ["montreal-qc", "Montréal"], ["vancouver-bc", "Vancouver"], ["calgary-ab", "Calgary"], ["ottawa-on", "Ottawa"], ["edmonton-ab", "Edmonton"]];

function LocationsPanel() {
  return (
    <div className="grid w-[760px] grid-cols-[1.1fr_1fr_.8fr] gap-8 p-7 font-sans">
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[.2em] text-gold">Find your city</p>
        <CitySearch />
        <p className="mt-3 text-xs text-white/60">1,800+ cities across all 50 states, DC and Canada.</p>
        <div className="mt-6 space-y-2 text-sm">
          <Link href="/locations#united-states" className="block hover:text-gold">All US states →</Link>
          <Link href="/locations#canada" className="block hover:text-gold">All Canadian provinces →</Link>
          <Link href="/locations" className="block hover:text-gold">Browse every location →</Link>
        </div>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-gold">Popular US cities</p>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm">
          {US_TOP.map(([s, l]) => <li key={s}><Link href={`/photographers/${s}`} className="hover:text-gold">{l}</Link></li>)}
        </ul>
      </div>
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[.2em] text-gold">Canada</p>
        <ul className="space-y-1.5 text-sm">
          {CA_TOP.map(([s, l]) => <li key={s}><Link href={`/photographers/${s}`} className="hover:text-gold">{l}</Link></li>)}
        </ul>
      </div>
    </div>
  );
}

const ALL_PHOTO = { href: "/photographers", label: "All Photography Services" };
const ALL_VIDEO = { href: "/videographers", label: "All Videography Services" };

const NAV: Item[] = [
  { label: "Home", href: "/" },
  { label: "Photography", children: NAV_PHOTO, extra: [ALL_PHOTO] },
  { label: "Videography", children: NAV_VIDEO, extra: [ALL_VIDEO] },
  { label: "Services", children: NAV_SERVICES },
  { label: "Locations", href: "/locations", mega: true },
  { label: "Portfolio", href: "/portfolio" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

function hrefOf(slug: string) {
  return slug === "corporate-headshots" ? SITE.headshotsUrl : `/${slug}`;
}

export default function Header() {
  return (
    <header className="sticky top-0 z-40 bg-black text-white">
      <div className="mx-auto flex max-w-7xl items-center gap-6 px-4 py-3 md:px-6">
        <Link href="/" className="shrink-0" aria-label="MacroSnaps home">
          <Image src={SITE.logo} alt="MacroSnaps logo" width={150} height={96} priority className="h-14 w-auto md:h-20" />
        </Link>

        <div className="hidden flex-1 flex-col items-end gap-2 lg:flex">
          <div className="flex items-center gap-8 font-nav text-sm">
            <a href={`mailto:${SITE.email}`} className="flex items-center gap-2 hover:text-gold"><IconMail className="h-4 w-4" />{SITE.email}</a>
            <a href={SITE.phoneHref} className="flex items-center gap-2 hover:text-gold"><IconPhone className="h-4 w-4" />{SITE.phone}</a>
            <Link href="/book" className="btn-gold !py-2 !px-4 font-sans">Book Now</Link>
          </div>
          <nav aria-label="Main" className="flex items-center gap-1 font-nav text-[15px]">
            {NAV.map((item) =>
              item.mega ? (
                <div key={item.label} className="group relative">
                  <Link href={item.href!} className="flex items-center gap-1 px-3 py-1 text-gold hover:bg-gold hover:text-black">{item.label}<IconChevron className="h-3 w-3" /></Link>
                  <div className="invisible absolute right-0 top-full z-50 border-t-2 border-gold bg-black/95 text-white opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    <LocationsPanel />
                  </div>
                </div>
              ) : item.children || item.extra ? (
                <div key={item.label} className="group relative">
                  {item.href ? (
                    <Link href={item.href} className="flex items-center gap-1 px-3 py-1 text-gold hover:bg-gold hover:text-black">{item.label}<IconChevron className="h-3 w-3" /></Link>
                  ) : (
                    <button type="button" className="flex items-center gap-1 px-3 py-1 text-gold hover:bg-gold hover:text-black">{item.label}<IconChevron className="h-3 w-3" /></button>
                  )}
                  <div className="invisible absolute right-0 top-full z-50 min-w-64 border-t-2 border-gold bg-black/95 py-2 opacity-0 shadow-xl transition group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                    {item.children?.map(([slug, label]) => (
                      <Link key={slug} href={hrefOf(slug)} className="block px-5 py-2 font-sans text-sm text-white hover:bg-gold hover:text-black">{label}</Link>
                    ))}
                    {item.extra?.map((e) => (
                      <Link key={e.href} href={e.href} className="block px-5 py-2 font-sans text-sm text-white hover:bg-gold hover:text-black">{e.label}</Link>
                    ))}
                  </div>
                </div>
              ) : (
                <Link key={item.label} href={item.href!} className="px-3 py-1 text-gold hover:bg-gold hover:text-black">{item.label}</Link>
              ),
            )}
          </nav>
          <p className="font-serif text-xs italic font-semibold tracking-wide">{SITE.shortTagline}</p>
        </div>

        {/* Mobile */}
        <div className="ml-auto flex items-center gap-3 lg:hidden">
          <a href={SITE.phoneHref} aria-label="Call MacroSnaps" className="p-2 text-gold"><IconPhone className="h-6 w-6" /></a>
          <details className="group">
            <summary aria-label="Open menu" className="p-2 text-gold">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M3 12h18M3 18h18" /></svg>
            </summary>
            <div className="fixed inset-x-0 top-[80px] bottom-0 overflow-y-auto bg-black px-4 pb-10">
              <Link href="/book" className="btn-gold my-4 w-full">Book Now</Link>
              {NAV.map((item) =>
                item.mega ? (
                  <details key={item.label} className="border-b border-white/10">
                    <summary className="flex items-center justify-between py-3 font-nav text-lg text-gold">{item.label}<IconChevron className="h-4 w-4" /></summary>
                    <div className="space-y-3 pb-4">
                      <CitySearch />
                      <div className="grid grid-cols-2 gap-x-4 gap-y-2 pl-1 text-sm">
                        {[...US_TOP.slice(0, 8), ...CA_TOP.slice(0, 2)].map(([s, l]) => <Link key={s} href={`/photographers/${s}`}>{l}</Link>)}
                      </div>
                      <Link href="/locations" className="block pl-1 text-sm text-gold">All states & provinces →</Link>
                    </div>
                  </details>
                ) : item.children || item.extra ? (
                  <details key={item.label} className="border-b border-white/10">
                    <summary className="flex items-center justify-between py-3 font-nav text-lg text-gold">{item.label}<IconChevron className="h-4 w-4" /></summary>
                    <div className="pb-3">
                      {item.href && <Link href={item.href} className="block py-2 pl-3 text-sm">All {item.label}</Link>}
                      {item.children?.map(([slug, label]) => <Link key={slug} href={hrefOf(slug)} className="block py-2 pl-3 text-sm">{label}</Link>)}
                      {item.extra?.map((e) => <Link key={e.href} href={e.href} className="block py-2 pl-3 text-sm">{e.label}</Link>)}
                    </div>
                  </details>
                ) : (
                  <Link key={item.label} href={item.href!} className="block border-b border-white/10 py-3 font-nav text-lg text-gold">{item.label}</Link>
                ),
              )}
              <div className="mt-6 space-y-2 text-sm">
                <a href={`mailto:${SITE.email}`} className="block">{SITE.email}</a>
                <a href={SITE.phoneHref} className="block">{SITE.phone}</a>
              </div>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
