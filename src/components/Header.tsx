import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { NAV_PHOTO, NAV_SERVICES, NAV_VIDEO } from "@/lib/nav";
import { IconChevron, IconMail, IconPhone } from "./Icons";

type Item = { label: string; href?: string; children?: readonly (readonly [string, string])[]; extra?: { href: string; label: string }[] };

const NAV: Item[] = [
  { label: "Home", href: "/" },
  { label: "Photography", children: NAV_PHOTO },
  { label: "Videography", children: NAV_VIDEO },
  { label: "Services", children: NAV_SERVICES },
  {
    label: "Locations",
    href: "/locations",
    extra: [
      { href: "/locations#united-states", label: "United States" },
      { href: "/locations#canada", label: "Canada" },
      { href: "/photographers/new-york-city-ny", label: "New York City" },
      { href: "/photographers/washington-dc", label: "Washington, DC" },
      { href: "/photographers/los-angeles-ca", label: "Los Angeles" },
      { href: "/photographers/chicago-il", label: "Chicago" },
      { href: "/photographers/san-francisco-ca", label: "San Francisco" },
      { href: "/photographers/toronto-on", label: "Toronto" },
    ],
  },
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
              item.children || item.extra ? (
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
                item.children || item.extra ? (
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
