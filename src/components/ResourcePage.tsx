import Link from "next/link";
import type { Audience } from "@/lib/resources";
import { AUDIENCES, PROGRAM_STEPS } from "@/lib/resources";
import { PageHero, TrustBar, SectionTitle, Faqs, Breadcrumbs, CtaBand } from "./blocks";
import ContactForm from "./ContactForm";
import { IconCheck } from "./Icons";
import { byTags, bannerSafe, IMG } from "@/lib/images";
import { SITE } from "@/lib/site";

export default function ResourcePage({ a }: { a: Audience }) {
  const hero = bannerSafe(byTags(...a.heroTags))[0] ?? IMG.conferenceHero;
  const others = AUDIENCES.filter((x) => x.slug !== a.slug);
  const crew = a.slug === "photographers-videographers";
  return (
    <>
      <PageHero image={hero} eyebrow={a.eyebrow} title={a.h1} subtitle={a.subtitle}>
        <a href="#signup" className="btn-gold">{crew ? "Become a referral partner" : "Become a preferred vendor"}</a>
        {crew ? <Link href="/careers" className="btn-outline">Join the crew</Link> : <Link href="/book" className="btn-outline">See prices & book</Link>}
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Resources", href: "/resources" }, { name: a.name, href: `/resources/${a.slug}` }]} />

      <section className="mx-auto grid max-w-7xl gap-12 px-4 py-14 md:px-6 lg:grid-cols-5" data-reveal>
        <div className="prose-ms text-[17px] lg:col-span-3">
          <h2 className="mb-5 font-serif text-3xl">How MacroSnaps helps {a.name.toLowerCase()}</h2>
          {a.intro.map((p) => <p key={p}>{p}</p>)}
        </div>
        <aside className="lg:col-span-2">
          <div className="marble border border-black/5 p-7">
            <h2 className="font-serif text-2xl">Why partner with MacroSnaps</h2>
            <ul className="mt-5 space-y-3">{a.why.map((w) => <li key={w} className="flex gap-3"><IconCheck className="mt-1 h-4 w-4 shrink-0 text-gold-dark" />{w}</li>)}</ul>
            <a href="#signup" className="btn-dark mt-6 w-full">Sign up</a>
          </div>
        </aside>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="What you get" title={`Built for ${a.name.toLowerCase()}`} />
          <div className="grid gap-x-10 gap-y-8 md:grid-cols-2 lg:grid-cols-3">
            {a.helps.map((h, i) => (
              <div key={h.title} className="border-t-2 border-gold pt-4">
                <span className="font-serif text-2xl text-gold-dark">0{i + 1}</span>
                <h3 className="mt-1 font-serif text-xl">{h.title}</h3>
                <p className="mt-2 text-muted">{h.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Preferred Vendor / Referral Partner program" title="Refer clients, earn a commission" />
        <div className="prose-ms mx-auto max-w-3xl text-center text-[17px]">{a.program.map((p) => <p key={p}>{p}</p>)}</div>
        <ol className="mt-10 grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
          {PROGRAM_STEPS.map((s, i) => (
            <li key={s.title} className="border border-black/10 p-6">
              <span className="font-serif text-2xl text-gold-dark">0{i + 1}</span>
              <h3 className="mt-1 font-serif text-xl">{s.title}</h3>
              <p className="mt-2 text-[15px] text-muted">{s.body}</p>
            </li>
          ))}
        </ol>
        {crew && (
          <p className="mx-auto mt-10 max-w-3xl border border-gold bg-white p-6 text-center text-[17px]">
            Want to shoot for MacroSnaps instead? <Link href="/careers" className="font-semibold underline">Apply to join the crew</Link>: confirmed shoots in your area and no editing required.
          </p>
        )}
      </section>

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="FAQ" title={`${a.name}: common questions`} />
        <Faqs faqs={a.faqs} />
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 md:px-6" data-reveal>
        <div className="grid gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-serif text-2xl">Services, events & booking</h2>
            <ul className="mt-4 grid grid-cols-1 gap-2 text-[15px] sm:grid-cols-2">
              {a.links.map((l) => <li key={l.href}><Link href={l.href} className="hover:text-gold-dark hover:underline">{l.label}</Link></li>)}
            </ul>
          </div>
          <div>
            <h2 className="font-serif text-2xl">More resources</h2>
            <ul className="mt-4 space-y-2 text-[15px]">
              {others.map((o) => <li key={o.slug}><Link href={`/resources/${o.slug}`} className="hover:text-gold-dark hover:underline">Resources for {o.name.toLowerCase()}</Link></li>)}
              <li><Link href="/resources" className="font-semibold hover:underline">All resources →</Link></li>
            </ul>
          </div>
        </div>
      </section>

      <section id="signup" className="bg-marble px-4 py-16 md:px-6">
        <div className="mx-auto max-w-3xl">
          <SectionTitle eyebrow="Sign up" title={crew ? "Become a referral partner" : "Become a preferred vendor"} intro={a.formIntro} />
          <ContactForm defaultSubject={a.subject} showDate={false} messagePlaceholder={a.messagePlaceholder} submitLabel="Sign up" />
          <p className="mt-6 text-center text-sm text-muted">Questions? Call <a href={SITE.phoneHref} className="underline">{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>.</p>
        </div>
      </section>

      <CtaBand title="Ready to book an event?" text="Clients can choose their hours, pick a date and pay securely online at our published prices." />
    </>
  );
}

export function ResourcesIndex() {
  return (
    <>
      <PageHero image={IMG.conferenceHero} eyebrow="Resources" title="Resources for Event Professionals" subtitle="For event planners, venues, photographers and videographers, and wedding officiants: how to work with MacroSnaps and earn a commission on every booking you refer." >
        <a href="#audiences" className="btn-gold">Find your guide</a>
        <Link href="/book" className="btn-outline">See prices & book</Link>
      </PageHero>
      <TrustBar />
      <Breadcrumbs items={[{ name: "Home", href: "/" }, { name: "Resources", href: "/resources" }]} />

      <section id="audiences" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <SectionTitle eyebrow="Partner with MacroSnaps" title="Choose the guide for your business" intro="Each guide explains how MacroSnaps works with your clients, our Preferred Vendor / Referral Partner program and how to sign up." />
        <div className="grid gap-6 sm:grid-cols-2">
          {AUDIENCES.map((a) => (
            <Link key={a.slug} href={`/resources/${a.slug}`} className="group border border-black/10 p-7 transition hover:-translate-y-1 hover:border-gold-dark hover:shadow-lg" data-reveal>
              <p className="eyebrow">{a.eyebrow}</p>
              <h2 className="mt-2 font-serif text-2xl group-hover:text-gold-dark">{a.name}</h2>
              <p className="mt-3 text-sm text-muted">{a.description}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="bg-marble px-4 py-16 md:px-6" data-reveal>
        <div className="mx-auto max-w-7xl">
          <SectionTitle eyebrow="Preferred Vendor / Referral Partner program" title="Refer clients, earn a commission" intro="Become a preferred vendor and earn a commission on every booking you refer. Your clients pay our published prices, the same for everyone, and commission details are shared after you sign up." />
          <ol className="grid gap-x-8 gap-y-8 md:grid-cols-2 lg:grid-cols-4">
            {PROGRAM_STEPS.map((s, i) => (
              <li key={s.title} className="border-t-2 border-gold pt-4">
                <span className="font-serif text-2xl text-gold-dark">0{i + 1}</span>
                <h3 className="mt-1 font-serif text-xl">{s.title}</h3>
                <p className="mt-2 text-[15px] text-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 md:px-6" data-reveal>
        <SectionTitle eyebrow="Quick facts" title="What to tell your clients" />
        <div className="grid gap-8 md:grid-cols-3">
          <div className="border border-black/10 p-6">
            <h3 className="font-serif text-xl">Published prices</h3>
            <p className="mt-2 text-muted">Photography $250 first hour + $100 each additional hour. Videography $300 first hour + $200 each additional hour. Two-hour minimum, the same for everyone.</p>
            <Link href="/book" className="mt-3 inline-block text-sm font-semibold underline">Book online →</Link>
          </div>
          <div className="border border-black/10 p-6">
            <h3 className="font-serif text-xl">Our own crews, everywhere</h3>
            <p className="mt-2 text-muted">Photographers and videographers across all US states, Washington, DC, Ontario and Quebec. Bookings need 48 hours&apos; notice.</p>
            <Link href="/locations" className="mt-3 inline-block text-sm font-semibold underline">All locations →</Link>
          </div>
          <div className="border border-black/10 p-6">
            <h3 className="font-serif text-xl">Insured and experienced</h3>
            <p className="mt-2 text-muted">13+ years&apos; experience, with 750+ conferences and 2,200+ weddings and private events covered. Insured by State Farm: $1M per occurrence / $2M aggregate, COI on request.</p>
            <Link href="/events" className="mt-3 inline-block text-sm font-semibold underline">Events we cover →</Link>
          </div>
        </div>
        <p className="mt-10 text-center text-[15px] text-muted">
          Popular services: <Link href="/conference-photography" className="underline">conference photography</Link> · <Link href="/wedding-photography" className="underline">wedding photography</Link> · <Link href="/event-videography" className="underline">event videography</Link> · <Link href="/live-stream" className="underline">live streaming</Link> · <Link href="/photo-booth" className="underline">photo booth</Link> · <Link href="/corporate" className="underline">corporate & multi-city events</Link>
        </p>
      </section>

      <CtaBand title="Partner with MacroSnaps" text="Choose your guide above to sign up, or call us to talk about working together." />
    </>
  );
}
