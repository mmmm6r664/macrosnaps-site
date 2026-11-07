import Link from "next/link";
import { RATES } from "@/lib/services";

const POINTS = (where: string) => [
  ["13+ years, 6,000+ events", `MacroSnaps and our parent company MacroHype have been photographing and filming for more than 13 years: over 1,000 corporate events and conferences and more than 5,000 weddings and private events. ${where} gets the same experienced crews and standards we bring to every city we work in.`],
  ["Prices published, not negotiated", `Many vendors price by how much they think you can pay. We publish every rate: photography is $${RATES.photo.first} for the first hour and $${RATES.photo.extra} for each additional hour, videography is $${RATES.video.first} for the first hour and $${RATES.video.extra} for each additional hour, with a ${RATES.minHours}-hour minimum. Everyone pays the same price.`],
  ["Insured by State Farm", "We carry $1 million per occurrence and $2 million general aggregate liability coverage. If your venue needs a certificate of insurance, we send it before your event."],
  ["Our own network, not a marketplace", "We are one company with our own photographers and videographers across all 50 states, Washington, DC, Ontario and Quebec, so the quality, editing and delivery standards stay the same wherever you book."],
  ["Book and pay online in minutes", "Choose your service and hours, pick your date and pay securely. Your slot is reserved the moment you book, and your crew is confirmed by email."],
  ["Every image edited", "All photos are retouched and color graded and delivered in a private online gallery in about a week. Highlight videos are delivered in 2 to 4 weeks with music of your choice."],
];

export default function WhyUs({ where = "Your event", title = "Why clients choose MacroSnaps" }: { where?: string; title?: string }) {
  return (
    <section className="bg-black px-4 py-20 text-white md:px-6" data-reveal>
      <div className="mx-auto max-w-7xl">
        <p className="eyebrow !text-gold text-center">Professional photography doesn&apos;t have to be expensive</p>
        <h2 className="mt-3 text-center font-serif text-3xl md:text-4xl">{title}</h2>
        <div className="mt-12 grid gap-x-10 gap-y-10 md:grid-cols-2 lg:grid-cols-3">
          {POINTS(where).map(([t, d], i) => (
            <div key={t} className="border-t border-gold/40 pt-5">
              <span className="font-serif text-3xl text-gold">0{i + 1}</span>
              <h3 className="mt-2 font-serif text-xl">{t}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/75">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-wrap justify-center gap-4">
          <Link href="/book" className="btn-gold">See Prices & Book</Link>
          <Link href="/faq" className="btn-outline">Read our FAQ</Link>
        </div>
      </div>
    </section>
  );
}
