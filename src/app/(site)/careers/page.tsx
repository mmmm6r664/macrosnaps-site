import type { Metadata } from "next";
import { PageHero, SectionTitle } from "@/components/blocks";
import CareerForm from "@/components/CareerForm";
import TeamQuote from "@/components/TeamQuote";
import Stats from "@/components/Stats";
import { IMG } from "@/lib/images";
import { IconCheck } from "@/components/Icons";

export const metadata: Metadata = {
  title: "Careers: Photographer & Videographer Jobs",
  description: "Join MacroSnaps: get up to 10 confirmed shoots a week, no editing required, and work with nationwide brands, conferences and couples. Apply online today.",
  alternates: { canonical: "/careers" },
};

const PERKS = [
  ["Up to 10 confirmed shoots every week", "We book the clients, you show up and shoot. Steady, confirmed work in your area — conferences, corporate events, weddings and celebrations."],
  ["No editing — ever", "All retouching, color grading and video editing is handled by our post-production team, so your time goes into shooting, not sitting at a computer."],
  ["A rapidly growing nationwide company", "MacroSnaps covers all 50 states, Washington, DC, Ontario and Quebec, with more than 1,000 corporate events and 5,000 weddings and private events behind us."],
  ["Work with big nationwide brands", "Shoot summits, conferences and corporate events for national organizations and brands alongside weddings and private events."],
  ["A team that grows with you", "Lead photographers and videographers grow into regional roles, like our heads of the DC Metro and New York Metro regions."],
  ["Be part of the MacroSnaps family", "Clear briefs, published client pricing, insured events and a team that has your back on every shoot."],
];

export default function Careers() {
  return (
    <>
      <PageHero image={IMG.conferenceHero} eyebrow="Careers" title="Join the MacroSnaps Family" subtitle="Photographers and videographers: get up to 10 confirmed shoots every week with a rapidly growing nationwide company — and never edit again." >
        <a href="#apply" className="btn-gold">Apply Now</a>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Why shoot with us" title="Focus on shooting. We handle the rest." />
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
          {PERKS.map(([t, d]) => <div key={t} className="border-t-2 border-gold pt-4"><IconCheck className="h-6 w-6 text-gold-dark" /><h3 className="mt-2 font-serif text-xl">{t}</h3><p className="mt-2 text-muted">{d}</p></div>)}
        </div>
      </section>
      <Stats dark />
      <TeamQuote />
      <section className="mx-auto max-w-3xl px-4 py-16" data-reveal>
        <SectionTitle eyebrow="Requirements" title="Who we're looking for" />
        <ul className="space-y-3 text-[17px]">
          {["At least 4 years of professional photography or videography experience", "The latest professional camera body and lenses", "A portfolio that shows your event, wedding or corporate work", "Reliable, punctual and comfortable working with clients and guests"].map((r) => <li key={r} className="flex gap-3"><IconCheck className="mt-1 h-5 w-5 shrink-0 text-gold-dark" />{r}</li>)}
        </ul>
      </section>
      <section id="apply" className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-4xl">
          <SectionTitle eyebrow="Apply" title="Photographer & videographer application" intro="Takes about 5 minutes. We review every application and contact photographers and videographers in the areas where we need crews." />
          <CareerForm />
        </div>
      </section>
    </>
  );
}
