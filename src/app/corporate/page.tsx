import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { IMG, photoPicker } from "@/lib/images";
import { EVENTS } from "@/lib/clients";
import { SERVICES } from "@/lib/services";
import { PageHero, TrustBar, SectionTitle, ClientLogos, Faqs, CtaBand } from "@/components/blocks";
import ContactForm from "@/components/ContactForm";
import { IconCheck } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Corporate & Conference Photography and Videography",
  description: "One photography & videography partner for every conference, company event and office across the US & Canada. Multi-day crews, same-day selects, live streaming and invoicing.",
  alternates: { canonical: "/corporate" },
};

const WHY = [
  ["Our own crews in every state & province", "Not a marketplace. MacroSnaps photographers and videographers, one standard of quality, one point of contact."],
  ["Conference specialists", "Official media partner for CDAO, AI in Finance Summit, FIX Americas Trading Conference, IEEE IEDM, Risk Live and more."],
  ["Photo, video & live stream from one team", "Coordinate stills, recap videos, session recordings and streaming without juggling vendors."],
  ["Fast, organized delivery", "Retouched galleries organized by session, speaker and sponsor; same-day social selects on request."],
  ["Insured & venue-ready", "State Farm coverage of $1M per occurrence / $2M aggregate, with certificates of insurance for any venue."],
  ["Invoicing & procurement friendly", "Written quotes, W-9 and company invoicing for multi-day and multi-city programs."],
];

const FAQS = [
  { q: "Can you staff several rooms or several cities on the same day?", a: "Yes. Because we have our own crews across North America, we can staff concurrent sessions or simultaneous events in different cities. Send your agenda and we will propose a crew plan." },
  { q: "Do you provide same-day images for social media?", a: "Yes. Same-day selects can be delivered during the event so your team can post in real time." },
  { q: "Can you sign our vendor agreement and provide a certificate of insurance?", a: "Yes. We regularly work through procurement, and we provide certificates of insurance naming your venue or organization." },
  { q: "Can we pay by invoice?", a: "Yes. Corporate programs are quoted and invoiced to your organization. For single events you can also book and pay online by card." },
];

export default function Corporate() {
  const corporate = SERVICES.filter((s) => s.group === "corporate");
  const pick = photoPicker();
  pick.use(IMG.conferenceHero);
  const cardImg = corporate.map((s) => pick.one(s.images, IMG.conference, IMG.event));
  return (
    <>
      <PageHero image={IMG.conferenceHero} eyebrow="For conference organizers & corporate teams" title="Corporate Photography & Videography" subtitle="One partner for every conference, company event and office — photo, video and live streaming by MacroSnaps' own crews across the US and Canada.">
        <a href="#quote" className="btn-gold">Request a Corporate Quote</a>
        <Link href="/book?service=conference-photography" className="btn-outline">Book a Single Event</Link>
      </PageHero>
      <TrustBar />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Why companies choose MacroSnaps" title="Built for event, marketing & comms teams" />
        <div className="grid gap-8 md:grid-cols-3">
          {WHY.map(([t, d]) => (
            <div key={t}><IconCheck className="h-6 w-6 text-gold-dark" /><h3 className="mt-3 font-serif text-xl">{t}</h3><p className="mt-2 text-muted">{d}</p></div>
          ))}
        </div>
      </section>
      <section className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Services" title="Corporate services" />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {corporate.map((s, i) => (
              <Link key={s.slug} href={`/${s.slug}`} className="group bg-white">
                <div className="relative aspect-[4/3] overflow-hidden"><Image src={cardImg[i]} alt={s.name} fill sizes="25vw" className="object-cover transition group-hover:scale-105" /></div>
                <div className="p-5"><h3 className="font-serif text-lg">{s.name}</h3><p className="mt-1 text-sm text-muted">{s.coverage.slice(0, 3).join(" · ")}</p></div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      <ClientLogos title="Conferences & companies we work with" />
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Track record" title="Recent conferences & corporate events" />
        <ul className="grid gap-x-8 gap-y-3 sm:grid-cols-2 lg:grid-cols-3">
          {EVENTS.map((e) => <li key={e.name} className="border-b border-black/10 pb-3"><span className="font-semibold">{e.name}</span><span className="block text-sm text-muted">{[e.where, e.year].filter(Boolean).join(" · ")}{e.status === "partner" ? " · Official media partner" : ""}</span></li>)}
        </ul>
      </section>
      <section className="bg-marble px-4 py-16 md:px-6"><SectionTitle eyebrow="FAQ" title="Corporate questions" /><Faqs faqs={FAQS} /></section>
      <section id="quote" className="mx-auto max-w-3xl px-4 py-16">
        <SectionTitle eyebrow="Corporate quote" title="Tell us about your program" intro="Dates, cities, number of rooms or sessions, and what you need delivered (photos, recap video, session recordings, live stream). We reply within one business day." />
        <ContactForm defaultSubject="Corporate quote request" />
      </section>
      <CtaBand title="Let's cover your next event" />
    </>
  );
}
