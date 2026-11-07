import Image from "next/image";
import Link from "next/link";
import { IMG, photoPicker, byTags, bannerSafe } from "@/lib/images";

const ORIGINAL_CONFERENCE_HERO = "https://static.wixstatic.com/media/b8cb3c_af143925a50c4d24a9cdd29895d94165~mv2.jpg";
import { HeroSlideshow } from "@/components/Motion";
import AskBox from "@/components/AskBox";
import WhyUs from "@/components/WhyUs";
import Stats from "@/components/Stats";
import VideoGrid from "@/components/VideoGrid";
import { VIDEOS } from "@/data/videos";
import { EVENT_TYPES } from "@/data/eventTypes";
import { VERTICALS } from "@/data/verticals";
import { SITE } from "@/lib/site";
import { EVENTS } from "@/lib/clients";
import { topCities, cityLabel } from "@/lib/geo";
import { TrustBar, SectionTitle, Faqs, ClientLogos, Gallery, HowItWorks } from "@/components/blocks";
import ContactForm from "@/components/ContactForm";
import { getSetting } from "@/lib/settings";
import { HOME_FAQS } from "@/data/homeFaqs";



const PILLARS: { slug: string; title: string; text: string; tags?: string[]; film?: string; image?: string }[] = [
  { slug: "conference-photography", title: "Conferences", text: "Keynotes, panels, expos and networking for multi-day programs.", tags: ["conference"] },
  { slug: "wedding-photography", title: "Weddings", text: "Ceremonies, receptions, courthouse weddings and elopements.", tags: ["wedding"] },
  { slug: "corporate-event-photography", title: "Corporate Events", text: "Launches, galas, award nights, holiday parties and offsites.", tags: ["corporate", "gala"] },
  { slug: "engagement-photography", title: "Engagements", text: "Proposals and engagement sessions at places you love.", tags: ["engagement"] },
  { slug: "indian-wedding-photography", title: "Indian Weddings", text: "Haldi, mehndi, sangeet, baraat, pheras and reception.", tags: ["indian"] },
  { slug: "trade-show-photography", title: "Trade Shows", text: "Booths, product demos, crowds and sponsor coverage.", image: "https://images.unsplash.com/photo-1752155222944-675c2c3bfafd" }, // stock (Unsplash License): exhibition hall
  { slug: "events", title: "Celebrations", text: "Bar & Bat Mitzvahs, Sweet 16s, quinceañeras and birthdays.", tags: ["party"] },
  { slug: "gala-fundraiser-photography", title: "Galas & Fundraisers", text: "Red carpets, speeches, auctions and honorees.", tags: ["gala"] },
  { slug: "family-photography", title: "Family Portraits", text: "Outdoor and at-home family sessions.", tags: ["family"] },
  { slug: "maternity-photography", title: "Maternity", text: "Maternity portraits for moms-to-be and families.", tags: ["maternity"] },
  { slug: "newborn-photography", title: "Newborn", text: "Newborn portraits in the first weeks, studio or at home.", tags: ["newborn"] },
  { slug: "graduation-photography", title: "Graduation", text: "Cap & gown portraits, ceremonies and parties.", tags: ["graduation"] },
  { slug: "real-estate-photography", title: "Real Estate & 3D Tours", text: "Listing photos, video and Matterport tours.", tags: ["realestate"] },
  { slug: "solutions/video-ads", title: "TV & Video Ads", text: "Commercials for local TV, Google, YouTube, Facebook & Instagram.", film: "7ph9aLGnKzk" },
  { slug: "live-stream", title: "Live Streaming", text: "Multi-camera streams of keynotes and ceremonies.", tags: ["conference"] },
  { slug: "photo-booth", title: "Photo Booth", text: "Booth, backdrop and attendant for your event.", tags: ["photobooth"] },
  { slug: "photo-retouching", title: "Retouching", text: "Portrait, product and commercial retouching.", tags: ["retouching"] },
];

export default async function Home() {
  const siteHero = await getSetting("home_hero");
  const faqs = (await getSetting("home_faqs")) ?? HOME_FAQS;
  const pick = photoPicker();
  // The homepage uses only the original photos from the old site (newer Drive photos appear on the portfolio and service pages).
  const orig = (l: string[]) => l.filter((x) => !x.includes(".blob.vercel-storage.com/"));
  const tags = (...t: string[]) => orig(byTags(...t));
  const hero = pick.use(IMG.hero);
  const heroSlides = [
    { src: hero, alt: "Wedding couple photographed by MacroSnaps", pos: "center 22%" },
    { src: pick.use(ORIGINAL_CONFERENCE_HERO), alt: "Conference audience photographed by MacroSnaps" },
    { src: pick.one(bannerSafe(tags("indian"))), alt: "Indian wedding couple photographed by MacroSnaps" },
    { src: pick.one(bannerSafe(tags("conference")).slice(1)), alt: "Panel discussion at a conference photographed by MacroSnaps" },
    { src: pick.one(bannerSafe(tags("courthouse"))), alt: "Couple at the US Capitol photographed by MacroSnaps" },
  ];
  const about = pick.use(IMG.about);
  const banner = pick.one(bannerSafe(tags("conference")).slice(3));
  const pillarImg = PILLARS.map((p) => (p.image ? p.image : p.film ? `https://i.ytimg.com/vi/${p.film}/hqdefault.jpg` : pick.one(tags(...(p.tags ?? [])).slice(1), tags(...(p.tags ?? [])))));
  const gallery = pick.many(16, orig(IMG.portfolio), orig(IMG.wedding), orig(IMG.conference), orig(IMG.event));
  const recentEvents = EVENTS.filter((e) => e.image).slice(0, 8);
  return (
    <>
      {/* Hero: slideshow + request box */}
      <section className="relative isolate flex min-h-[86vh] items-center justify-center overflow-hidden bg-black py-20 text-white">
        <HeroSlideshow slides={heroSlides} />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/45 via-black/35 to-black/75" />
        <div className="w-full max-w-4xl px-4 text-center">
          <p className="font-script text-5xl md:text-7xl">MacroSnaps</p>
          <h1 className="mt-5 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[.25em] md:text-sm">
            <span className="hidden h-px w-12 bg-white/70 sm:block" />{siteHero.headline}<span className="hidden h-px w-12 bg-white/70 sm:block" />
          </h1>
          <div className="mx-auto mt-10 max-w-3xl text-left">
            <AskBox variant="dark" title="" />
          </div>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link href="/book" className="btn-gold">See Prices & Book</Link>
            <Link href="/corporate" className="btn-outline">For Corporate Teams</Link>
          </div>
        </div>
      </section>
      <TrustBar events />

      {/* Pillars */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-6" data-reveal>
          <SectionTitle eyebrow="What we do" title="Photography & videography for every occasion" intro="One company with our own crews across all 50 states, Washington, DC, Ontario and Quebec — published prices and online booking." />
        </div>
      <div className="relative overflow-hidden pb-4">
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-white to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-white to-transparent" />
        <div className="marquee slow gap-5 px-5">
          {[...PILLARS, ...PILLARS].map((p, i) => (
            <Link key={i} href={`/${p.slug}`} aria-hidden={i >= PILLARS.length} tabIndex={i >= PILLARS.length ? -1 : undefined} className="group relative block aspect-[4/5] w-72 shrink-0 overflow-hidden bg-black text-white md:w-80 hover-zoom">
              <Image src={pillarImg[i % PILLARS.length]} alt={i < PILLARS.length ? (p.image ? `${p.title}: exhibition hall` : `${p.title} photographed by MacroSnaps`) : ""} fill sizes="320px" className="object-cover opacity-75 transition duration-500 group-hover:opacity-60" />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <h3 className="font-script text-3xl">{p.title}</h3>
                <p className="mt-1 text-sm text-white/90">{p.text}</p>
                <span className="mt-3 inline-block border-b border-gold pb-1 text-xs uppercase tracking-[.2em] text-gold">Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
      </section>

      <Stats dark />

      {/* About — image left, marble right, as on macrosnaps.com */}
      <section id="about" className="grid md:grid-cols-2">
        <div className="relative min-h-[420px]"><Image src={about} alt="Engaged couple laughing, photographed by MacroSnaps" fill sizes="50vw" className="object-cover object-[center_30%]" /></div>
        <div className="marble flex flex-col justify-center px-6 py-16 md:px-14">
          <h2 className="font-serif text-4xl">About Us</h2>
          <div className="prose-ms mt-6 text-justify text-[17px]">
            <p>MacroSnaps is America&apos;s premier event and wedding photography and videography company covering conferences, corporate events, weddings and celebrations. We have photographed and filmed more than 750 corporate events and conferences and over 2,200 weddings and private events.</p>
            <p>MacroSnaps is part of MacroHype LLC, a digital media and marketing company based out of <Link href="/photographers/new-york-city-ny">New York City</Link> and <Link href="/photographers/washington-dc">Washington, DC</Link>, working with businesses for more than 13 years.</p>
            <p>We provide our award-winning photography and videography services across all 50 states, Washington, DC, Ontario and Quebec with our own photographers and videographers, so you deal with one company from booking to delivery. We are insured through State Farm and we publish our prices, so every client pays the same rate.</p>
            <p>Let us help create long-lasting memories for you. Hire us today for your conference, corporate event, wedding or any other occasion.</p>
          </div>
          <Link href="/book" className="mt-8 self-start font-sans text-3xl tracking-wide text-ink hover:text-gold-dark">BOOK A SESSION</Link>
        </div>
      </section>

      <WhyUs where="Every event" events />

      {/* Events we cover */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Celebrations & cultural events" title="Events we photograph and film" intro="From Bar and Bat Mitzvahs and multi-day Indian weddings to galas, quinceañeras and corporate holiday parties, our crews know the traditions, the timelines and the moments that matter." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {EVENT_TYPES.map((e) => (
            <Link key={e.slug} href={`/${e.slug}`} className="group border border-black/10 p-4 transition hover:-translate-y-0.5 hover:border-gold-dark hover:shadow-md">
              <span className="font-serif text-lg leading-snug group-hover:text-gold-dark">{e.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured films */}
      <section className="bg-black px-4 py-16 text-white md:px-6" data-reveal>
        <div className="mx-auto max-w-7xl">
          <p className="eyebrow !text-gold text-center">From our YouTube channel</p>
          <h2 className="mb-10 mt-3 text-center font-serif text-3xl md:text-4xl">Conference, event & wedding films</h2>
          <VideoGrid videos={["nanbTWYjc0k", "lQuiII7QpXw", "i8zddmkqUM4", "JcftQW3TBC8", "XdBbgepSxGE", "mE9Jr3ipr1M"].map((id) => VIDEOS.find((v) => v.id === id)!).filter(Boolean)} />
          <div className="mt-10 text-center"><a href="https://www.youtube.com/channel/UCYoC7JGFcAQiSxOqKSmIzEw" target="_blank" rel="noopener" className="btn-outline">Watch all {VIDEOS.length} videos on YouTube</a></div>
        </div>
      </section>

      {/* Industries & solutions */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="For businesses" title="Photo & video for your industry" intro="Menu photos for restaurants, patient-friendly content for dental and medical practices, video ads for Google, Facebook and local TV, and more. Need a website or ads too? Our sister agency MacroHype builds and runs them." />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {VERTICALS.filter((v) => v.kind === "industry").map((v) => (
            <Link key={v.slug} href={`/industries/${v.slug}`} className="border border-black/10 p-4 text-[15px] transition hover:border-gold-dark hover:text-gold-dark">{v.name}</Link>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap justify-center gap-4"><Link href="/industries" className="btn-dark">All industries</Link><Link href="/solutions" className="btn-outline !text-ink">Solutions</Link></div>
      </section>

      {/* Portfolio */}
      <section className="px-2 py-2">
        <Gallery images={gallery} alt="MacroSnaps portfolio" />
        <div className="py-8 text-center"><Link href="/portfolio" className="btn-dark">View Portfolio</Link></div>
      </section>

      {/* Conferences */}
      <section className="relative isolate overflow-hidden bg-black px-4 py-20 text-white">
        <Image src={banner} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-35" />
        <div className="mx-auto max-w-4xl text-center">
          <p className="eyebrow !text-gold">Conference Photography & Videography</p>
          <p className="mt-6 font-script text-4xl md:text-5xl">&ldquo;Capturing the moments of today that will wow your heart tomorrow&rdquo;</p>
          <p className="mx-auto mt-6 max-w-2xl text-white/85">Official media partner for summits and industry conferences in New York, Washington, DC, San Francisco, Toronto and beyond — photography, videography, recap videos and live streaming.</p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/conference-photography" className="btn-gold">Conference Photography</Link>
            <Link href="/conference-videography" className="btn-outline">Conference Videography</Link>
          </div>
        </div>
      </section>

      {recentEvents.length > 0 && (
        <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
          <SectionTitle eyebrow="Recent coverage" title="Conferences & events we've covered" />
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {recentEvents.map((e) => (
              <article key={e.name} className="border border-black/10">
                <div className="relative aspect-[16/10] bg-marble"><Image src={e.image} alt={e.name} fill sizes="25vw" className="object-cover" /></div>
                <div className="p-4">
                  <h3 className="font-serif text-lg leading-snug">{e.name}</h3>
                  <p className="mt-1 text-xs text-muted">{[e.where, e.year].filter(Boolean).join(" · ")}{e.status === "partner" ? " · Media partner" : ""}</p>
                </div>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center"><Link href="/portfolio#events" className="btn-dark">See all events</Link></div>
        </section>
      )}

      <ClientLogos />

      <section className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl"><SectionTitle eyebrow="Simple booking" title="Book and pay online in minutes" /><HowItWorks /></div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Locations" title="Photographers & videographers across North America" />
        <ul className="grid grid-cols-2 gap-x-6 gap-y-2 text-[15px] sm:grid-cols-3 lg:grid-cols-5">
          {topCities(40).map((c) => <li key={c.slug}><Link className="hover:text-gold-dark hover:underline" href={`/photographers/${c.slug}`}>{cityLabel(c)}</Link></li>)}
        </ul>
        <div className="mt-8 text-center"><Link href="/locations" className="btn-dark">All states, provinces & cities</Link></div>
      </section>

      <section id="faqs" className="bg-marble px-4 py-16 md:px-6">
        <SectionTitle eyebrow="FAQs" title="Frequently asked questions" />
        <Faqs faqs={faqs} />
      </section>

      <section id="contact" className="mx-auto max-w-3xl px-4 py-16">
        <SectionTitle eyebrow="Contact" title="Let's Talk" intro={`Call ${SITE.phone}, email ${SITE.email}, or send us a message.`} />
        <ContactForm />
      </section>
    </>
  );
}

