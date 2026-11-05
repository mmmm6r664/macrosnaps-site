import Image from "next/image";
import Link from "next/link";
import { IMG, photoPicker } from "@/lib/images";
import { SITE } from "@/lib/site";
import { EVENTS } from "@/lib/clients";
import { topCities, cityLabel } from "@/lib/geo";
import { TrustBar, SectionTitle, Faqs, ClientLogos, Gallery, HowItWorks } from "@/components/blocks";
import ContactForm from "@/components/ContactForm";

const HOME_FAQS = [
  { q: "Do you serve my area?", a: "Yes. MacroSnaps works worldwide, with our own photographers and videographers covering conferences, corporate events and weddings anywhere in the United States and Canada, from New York and Washington DC to Los Angeles, Chicago, Dallas, Miami, Toronto and beyond. Tell us your city and date when you book, and we'll confirm your crew." },
  { q: "Is your company insured and registered?", a: "We are fully insured through State Farm for $1 million (each occurrence) and $2 million (general aggregate). If your venue needs a copy of our insurance, email info@macrosnaps.com and we will be happy to oblige. We are a fully registered business and serve clients at venues across North America." },
  { q: "Do you have a studio?", a: "Yes, we have studios in New York City (115 W 45th Street Suite 606, Times Square) and Alexandria, Virginia (4900 Leesburg Pike Suite 414). Our photographers and videographers also travel to clients anywhere we serve." },
  { q: "How long have you been doing photography?", a: "We have been doing commercial and product photography, real estate photography and commercial videography as part of our parent company MacroHype LLC since 2011. In January 2020 we established MacroSnaps as a separate company, covering conferences, corporate events, weddings, engagements, maternity and newborn shoots and every kind of important moment." },
  { q: "Are the pictures edited?", a: "Yes. We color grade and retouch all the pictures delivered to our clients. Additional editing requests are available at an extra charge, and re-editing of any photo you are not satisfied with is free." },
  { q: "Are the prices negotiable and do they include taxes?", a: "All prices listed on our website are final and inclusive of taxes and other charges unless stated. We have priced our services so people with all budgets can afford quality work." },
  { q: "Why are the first hour prices different from additional hours?", a: "We keep a gap between shoots so our photographers show up on time and can plan ahead, and we account for that time and the travel to your venue in the first hour. Photography is $250 for the first hour and $100 for each additional hour; videography is $300 for the first hour and $200 for each additional hour. The minimum booking is 2 hours." },
  { q: "What is your refund and rescheduling policy?", a: "We don't offer refunds, because when we receive a booking we reserve the slot for you and give up other bookings for that time. Bookings can be rescheduled free of charge due to extreme weather or an unavoidable emergency (proof required)." },
  { q: "Can you invoice our company for a conference or corporate event?", a: "Yes. For corporate clients, multi-day conferences and events in several cities we provide a written quote and can invoice your organization. Use the corporate quote form." },
  { q: "Can you live stream our event or wedding?", a: "Yes. We live stream conferences, town halls and weddings with multiple cameras and clean audio, and send you a link to share with remote guests." },
];

const PILLARS = [
  { slug: "conference-photography", title: "Conferences", text: "Keynotes, panels, expos and networking — photo, video and live streaming for multi-day programs." },
  { slug: "corporate-event-photography", title: "Corporate Events", text: "Launches, galas, award nights, holiday parties and offsites for companies in every city they operate." },
  { slug: "wedding-photography", title: "Weddings", text: "Ceremonies, receptions, courthouse weddings and elopements, photographed and filmed with care." },
];

export default function Home() {
  const pick = photoPicker();
  const hero = pick.use(IMG.hero);
  const about = pick.use(IMG.about);
  const banner = pick.use(IMG.conferenceHero);
  const pillarImg = [pick.one(IMG.conference.slice(1)), pick.one(IMG.conference.slice(7)), pick.one(IMG.wedding)];
  const gallery = pick.many(16, IMG.portfolio, IMG.wedding, IMG.conference, IMG.event);
  const recentEvents = EVENTS.filter((e) => e.image).slice(0, 8);
  return (
    <>
      {/* Hero — mirrors the macrosnaps.com hero */}
      <section className="relative isolate flex min-h-[78vh] items-center justify-center overflow-hidden bg-black text-white">
        <Image src={hero} alt="Wedding couple photographed by MacroSnaps" fill priority sizes="100vw" className="-z-10 object-cover object-[center_22%] opacity-70" />
        <div className="absolute inset-0 -z-10 bg-gradient-to-b from-black/20 via-black/25 to-black/60" />
        <div className="px-4 text-center">
          <svg viewBox="0 0 120 40" className="mx-auto h-12 w-36 text-white" fill="none" stroke="currentColor" strokeWidth="1.2" aria-hidden><path d="M60 38C40 30 30 18 18 8M60 38C80 30 90 18 102 8M18 8c-4 6 2 10 6 6M102 8c4 6-2 10-6 6M40 22c-6-2-8 4-3 6M80 22c6-2 8 4 3 6M60 38V20M56 16a4 4 0 108 0 4 4 0 10-8 0" /></svg>
          <p className="mt-4 font-script text-5xl md:text-7xl">MacroSnaps Photography</p>
          <h1 className="mt-5 flex items-center justify-center gap-4 text-xs font-semibold uppercase tracking-[.25em] md:text-sm">
            <span className="hidden h-px w-12 bg-white/70 sm:block" />Global Event, Conference & Wedding Photography & Videography<span className="hidden h-px w-12 bg-white/70 sm:block" />
          </h1>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link href="/book" className="btn-gold">Book a Session</Link>
            <Link href="/corporate" className="btn-outline">For Corporate Teams</Link>
          </div>
        </div>
      </section>
      <TrustBar />

      {/* Pillars */}
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="What we do" title="Photography & videography for the moments that matter to your organization" intro="One company, our own crews across the US and Canada, transparent prices and online booking." />
        <div className="grid gap-6 md:grid-cols-3">
          {PILLARS.map((p, i) => (
            <Link key={p.slug} href={`/${p.slug}`} className="group relative block aspect-[4/5] overflow-hidden bg-black text-white">
              <Image src={pillarImg[i]} alt={p.title} fill sizes="(max-width:768px) 100vw, 33vw" className="object-cover opacity-75 transition duration-500 group-hover:scale-105 group-hover:opacity-60" />
              <div className="absolute inset-x-0 bottom-0 p-7">
                <h2 className="font-script text-4xl">{p.title}</h2>
                <p className="mt-2 text-sm text-white/90">{p.text}</p>
                <span className="mt-4 inline-block border-b border-gold pb-1 text-xs uppercase tracking-[.2em] text-gold">Explore</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* About — image left, marble right, as on macrosnaps.com */}
      <section id="about" className="grid md:grid-cols-2">
        <div className="relative min-h-[420px]"><Image src={about} alt="Engaged couple laughing, photographed by MacroSnaps" fill sizes="50vw" className="object-cover object-[center_30%]" /></div>
        <div className="marble flex flex-col justify-center px-6 py-16 md:px-14">
          <h2 className="font-serif text-4xl">About Us</h2>
          <div className="prose-ms mt-6 text-justify text-[17px]">
            <p>MacroSnaps is a premium global photography and videography company covering conferences, corporate events and weddings.</p>
            <p>MacroSnaps is part of MacroHype LLC, a digital media and marketing company based out of <Link href="/photographers/new-york-city-ny">New York City</Link> and <Link href="/photographers/washington-dc">Washington DC</Link>, working with businesses since 2011.</p>
            <p>We provide our award winning photography and videography services across the United States and Canada with our own photographers and videographers — so you deal with one company from booking to delivery.</p>
            <p>Let us help create long lasting memories for you. Hire us today for your conference, corporate event, wedding or any other occasion.</p>
          </div>
          <Link href="/book" className="mt-8 self-start font-sans text-3xl tracking-wide text-ink hover:text-gold-dark">BOOK A SESSION</Link>
        </div>
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
          <p className="mx-auto mt-6 max-w-2xl text-white/85">Official media partner for summits and industry conferences in New York, Washington DC, San Francisco, Toronto and beyond — photography, videography, recap videos and live streaming.</p>
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
        <SectionTitle eyebrow="FAQs" title="Frequently Asked Questions" />
        <Faqs faqs={HOME_FAQS} />
      </section>

      <section id="contact" className="mx-auto max-w-3xl px-4 py-16">
        <SectionTitle eyebrow="Contact" title="Let's Talk" intro={`Call ${SITE.phone}, email ${SITE.email}, or send us a message.`} />
        <ContactForm />
      </section>
    </>
  );
}

