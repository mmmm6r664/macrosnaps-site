import type { Metadata } from "next";
import { SERVICES } from "@/lib/services";
import { Faqs, SectionTitle, CtaBand } from "@/components/blocks";

export const metadata: Metadata = { title: "FAQ: Booking, Pricing, Insurance & Delivery", description: "Answers to common questions about booking MacroSnaps: pricing, insurance, travel, editing, delivery times, refunds and corporate invoicing.", alternates: { canonical: "/faq" } };

export default function FaqPage() {
  const seen = new Set<string>();
  const groups = [
    { title: "Conferences & corporate events", slugs: ["conference-photography", "conference-videography", "corporate-event-photography"] },
    { title: "Weddings", slugs: ["wedding-photography", "wedding-videography"] },
  ].map((g) => ({ title: g.title, faqs: g.slugs.flatMap((s) => SERVICES.find((x) => x.slug === s)?.faqs ?? []).filter((f) => (seen.has(f.q) ? false : (seen.add(f.q), true))) }));
  return (
    <>
      <section className="bg-black px-4 py-16 text-center text-white"><h1 className="font-script text-5xl md:text-6xl">Frequently Asked Questions</h1></section>
      {groups.map((g) => (
        <section key={g.title} className="px-4 py-12"><SectionTitle title={g.title} /><Faqs faqs={g.faqs} /></section>
      ))}
      <CtaBand title="Still have a question?" text="Call 877-622-4973 or email info@macrosnaps.com." />
    </>
  );
}
