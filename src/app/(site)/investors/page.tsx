import type { Metadata } from "next";
import Link from "next/link";
import { PageHero, SectionTitle, ClientLogos } from "@/components/blocks";
import Stats from "@/components/Stats";
import ContactForm from "@/components/ContactForm";
import { IMG } from "@/lib/images";
import { SITE } from "@/lib/site";
import { RATES } from "@/lib/pricing";
import { cities } from "@/lib/geo";
import { VIDEOS } from "@/data/videos";

export const metadata: Metadata = {
  title: "Investor Relations",
  description: "Investor relations for MacroSnaps, part of MacroHype LLC: company overview, business model, growth strategy and investor contact.",
  alternates: { canonical: "/investors" },
};

const MODEL = [
  ["Published, uniform pricing", `Photography is $${RATES.photo.first} for the first hour plus $${RATES.photo.extra} per additional hour; videography is $${RATES.video.first} plus $${RATES.video.extra}. Customers book and pay online, which shortens the sales cycle and removes quoting overhead.`],
  ["High-utilization crew model", "Crews cover several events per day, so revenue per photographer-day is driven by volume rather than by a single high-priced booking."],
  ["Shared infrastructure", "Post-production (including editors based overseas), marketing, technology and back office are shared with our parent company, MacroHype LLC, keeping operating costs low."],
  ["Balanced customer mix", "Corporate clients (conferences, company events, trade shows, brand content) sit alongside consumer bookings (weddings, engagements, celebrations, family portraits)."],
];

const GROWTH = [
  ["Corporate & conference accounts", "Expanding repeat relationships with conference organizers and companies that run events in several cities, where one national partner is valuable."],
  ["Local search footprint", `Landing pages for ${cities.length.toLocaleString()} cities across all 50 states, Washington, DC, Ontario and Quebec, built to capture searches such as "conference photographer in San Francisco".`],
  ["Business verticals", "Photo and video programs for restaurants, healthcare, real estate, hospitality and other industries, cross-sold with MacroHype's website and advertising services."],
  ["Online booking & upsell", "Multi-day booking, additional crew and photo + video bundles increase average order value without additional sales effort."],
];

export default function Investors() {
  return (
    <>
      <PageHero image={IMG.conferenceHero} eyebrow="Investor Relations" title="Investor Relations" subtitle="MacroSnaps is a photography and videography company with its own crews across North America and a model built on published pricing, volume and shared infrastructure." />
      <Stats />

      <section className="bg-black px-4 py-14 text-center text-white md:px-6" data-reveal>
        <p className="eyebrow !text-gold">Current funding round</p>
        <h2 className="mx-auto mt-3 max-w-3xl font-serif text-3xl md:text-5xl">MacroSnaps is raising <span className="text-gold">$1 million</span> at a <span className="text-gold">$12.5 million</span> valuation</h2>
        <p className="mx-auto mt-5 max-w-2xl text-white/75">The round will fund expansion of our photographer and videographer network, our corporate and conference sales team, and the technology behind online booking and delivery. Interested investors can contact us below for more information.</p>
        <a href="#contact" className="btn-gold mt-8 inline-block">Contact investor relations</a>
      </section>

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 lg:grid-cols-5" data-reveal>
        <div className="prose-ms text-[17px] lg:col-span-3">
          <h2 className="mb-5 font-serif text-3xl">Company overview</h2>
          <p>MacroSnaps provides photography, videography, live streaming and related services for conferences, corporate events, weddings and private celebrations. The business operates as part of <a href={SITE.parentUrl}>MacroHype LLC</a>, a digital media and marketing company based in New York City and Washington, DC, and draws on more than 13 years of experience.</p>
          <p>MacroSnaps has covered more than 1,000 corporate events and conferences and over 5,000 weddings and private events. It serves clients in all 50 US states, Washington, DC, Ontario and Quebec with its own network of photographers and videographers, and publishes {VIDEOS.length} client films on its YouTube channel.</p>
        </div>
        <aside className="lg:col-span-2">
          <div className="marble border border-black/5 p-7">
            <h3 className="font-serif text-2xl">At a glance</h3>
            <dl className="mt-5 space-y-3 text-[15px]">
              {[["Parent company", "MacroHype LLC"], ["Headquarters", "New York, NY · Washington, DC"], ["Coverage", "50 US states, DC, Ontario & Quebec"], ["Experience", "13+ years"], ["Events covered", "6,000+"], ["Insurance", "State Farm, $1M / $2M"]].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 border-b border-black/5 pb-2"><dt className="text-muted">{k}</dt><dd className="text-right font-semibold">{v}</dd></div>
              ))}
            </dl>
          </div>
        </aside>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Business model" title="How MacroSnaps keeps quality high and prices accessible" />
          <div className="grid gap-6 md:grid-cols-2">{MODEL.map(([t, d]) => <div key={t} className="bg-white p-7 shadow-sm"><h3 className="font-serif text-xl">{t}</h3><p className="mt-2 text-muted">{d}</p></div>)}</div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Strategy" title="Growth priorities" />
        <div className="grid gap-x-10 gap-y-8 md:grid-cols-2">{GROWTH.map(([t, d], i) => <div key={t} className="border-t-2 border-gold pt-4"><span className="font-serif text-2xl text-gold-dark">0{i + 1}</span><h3 className="mt-1 font-serif text-xl">{t}</h3><p className="mt-2 text-muted">{d}</p></div>)}</div>
      </section>

      <ClientLogos title="Conferences & organizations we have covered" />

      <section id="contact" className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="Contact" title="Investor inquiries" intro={`For investor and partnership inquiries, send us a message or email ${SITE.email}. You can also read more on our About page or about our parent company, MacroHype.`} />
          <ContactForm defaultSubject="Investor inquiry" />
          <p className="mt-8 text-center text-xs text-muted">This page is provided for general information only and does not constitute an offer to sell or a solicitation of an offer to buy any securities. <Link href="/about" className="underline">About MacroSnaps</Link></p>
        </div>
      </section>
    </>
  );
}
