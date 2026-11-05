import Link from "next/link";
import Image from "next/image";
import { SITE } from "@/lib/site";
import { NAV_PHOTO, NAV_SERVICES, NAV_VIDEO } from "@/lib/nav";
import { REVIEW_BADGES } from "@/lib/clients";
import { usRegions, caRegions } from "@/lib/geo";
import { SOCIALS } from "./SocialRail";

const TOP = [
  ["new-york-city-ny", "New York City"], ["washington-dc", "Washington, DC"], ["los-angeles-ca", "Los Angeles"],
  ["chicago-il", "Chicago"], ["houston-tx", "Houston"], ["san-francisco-ca", "San Francisco"], ["boston-ma", "Boston"],
  ["miami-fl", "Miami"], ["atlanta-ga", "Atlanta"], ["dallas-tx", "Dallas"], ["las-vegas-nv", "Las Vegas"],
  ["seattle-wa", "Seattle"], ["philadelphia-pa", "Philadelphia"], ["toronto-on", "Toronto"], ["vancouver-bc", "Vancouver"], ["montreal-qc", "Montréal"],
];

export default function Footer() {
  return (
    <footer className="bg-black text-white/80">
      <div className="mx-auto max-w-7xl px-4 py-14 md:px-6">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-5">
          <div className="lg:col-span-1">
            <Image src={SITE.logo} alt="MacroSnaps" width={150} height={96} className="h-20 w-auto" />
            <p className="mt-3 text-sm">Part of <a href={SITE.parentUrl} className="underline hover:text-gold" target="_blank" rel="noopener">{SITE.parent}</a></p>
            <p className="mt-4 text-sm leading-relaxed">{SITE.description}</p>
            <div className="mt-5 flex gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <a key={label} href={href} aria-label={label} target="_blank" rel="noopener noreferrer" className="grid h-8 w-8 place-items-center rounded-full border border-white/30 hover:border-gold hover:text-gold"><Icon className="h-4 w-4" /></a>
              ))}
            </div>
          </div>
          <FooterCol title="Photography" items={NAV_PHOTO.filter(([s]) => s !== "corporate-headshots").map(([s, l]) => [`/${s}`, l])} />
          <FooterCol title="Videography & More" items={[...NAV_VIDEO, ...NAV_SERVICES].map(([s, l]) => [`/${s}`, l])} />
          <FooterCol title="Popular Cities" items={TOP.map(([s, l]) => [`/photographers/${s}`, `${l} Photographers`])} />
          <div>
            <h3 className="mb-4 font-serif text-lg text-gold">Contact</h3>
            <p><a href={SITE.phoneHref} className="hover:text-gold">{SITE.phone}</a></p>
            <p><a href={`mailto:${SITE.email}`} className="hover:text-gold">{SITE.email}</a></p>
            {SITE.offices.map((o) => (
              <address key={o.name} className="mt-4 text-sm not-italic">
                <strong className="text-white">{o.name}</strong><br />{o.street}<br />{o.city}, {o.region} {o.zip}
              </address>
            ))}
            <div className="mt-5 flex flex-wrap gap-3 text-xs">
              <a href={SITE.reviews.thumbtack} target="_blank" rel="noopener" className="underline hover:text-gold">Thumbtack</a>
              <a href={SITE.reviews.weddingwire} target="_blank" rel="noopener" className="underline hover:text-gold">WeddingWire</a>
              <a href={SITE.reviews.theknot} target="_blank" rel="noopener" className="underline hover:text-gold">The Knot</a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-8">
          <h3 className="mb-3 font-serif text-lg text-gold">Photographers & Videographers by State and Province</h3>
          <div className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
            {[...usRegions, ...caRegions].map((r) => (
              <Link key={r.slug} href={`/photographers/${r.slug}`} className="hover:text-gold">{r.name}</Link>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 rounded bg-white/95 px-4 py-4">
          {REVIEW_BADGES.map((b) => (
            <Image key={b.logo} src={b.logo} alt={b.name} width={130} height={56} className="h-12 w-auto" />
          ))}
        </div>

        <div className="mt-8 flex flex-col items-center justify-between gap-3 text-xs md:flex-row">
          <p>© {new Date().getFullYear()} MacroSnaps. Website by <a href={SITE.parentUrl} className="underline">{SITE.parent}</a>.</p>
          <div className="flex gap-4">
            <Link href="/faq" className="hover:text-gold">FAQ</Link>
            <Link href="/locations" className="hover:text-gold">All Locations</Link>
            <Link href="/terms" className="hover:text-gold">Booking Terms</Link>
            <Link href="/privacy" className="hover:text-gold">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, items }: { title: string; items: string[][] }) {
  return (
    <div>
      <h3 className="mb-4 font-serif text-lg text-gold">{title}</h3>
      <ul className="space-y-1.5 text-sm">
        {items.map(([href, label]) => <li key={href}><Link href={href} className="hover:text-gold">{label}</Link></li>)}
      </ul>
    </div>
  );
}
