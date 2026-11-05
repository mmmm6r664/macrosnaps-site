import type { Metadata } from "next";
import ContactForm from "@/components/ContactForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Contact Us", description: "Contact MacroSnaps: call 877-622-4973 or email info@macrosnaps.com. Studio in New York City and office in Washington, DC.", alternates: { canonical: "/contact" } };

export default async function Contact({ searchParams }: { searchParams: Promise<{ subject?: string }> }) {
  const { subject } = await searchParams;
  return (
    <>
      <section className="bg-black px-4 py-16 text-center text-white"><h1 className="font-script text-5xl md:text-6xl">Let&apos;s Talk</h1></section>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-3">
        <div className="space-y-6">
          <p><span className="eyebrow block">Phone</span><a href={SITE.phoneHref} className="font-serif text-2xl">{SITE.phone}</a></p>
          <p><span className="eyebrow block">Email</span><a href={`mailto:${SITE.email}`} className="font-serif text-xl">{SITE.email}</a></p>
          {SITE.offices.map((o) => <address key={o.name} className="not-italic"><span className="eyebrow block">{o.name}</span>{o.street}<br />{o.city}, {o.region} {o.zip}</address>)}
        </div>
        <div className="md:col-span-2"><ContactForm defaultSubject={subject ?? ""} /></div>
      </div>
    </>
  );
}
