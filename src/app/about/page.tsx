import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { IMG } from "@/lib/images";
import { ClientLogos, CtaBand, TrustBar } from "@/components/blocks";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "About MacroSnaps", description: "MacroSnaps is a global photography and videography company and part of MacroHype LLC, with more than 13 years of experience and our own crews across the US.", alternates: { canonical: "/about" } };

export default function About() {
  return (
    <>
      <section className="grid md:grid-cols-2">
        <div className="relative min-h-[460px]"><Image src={IMG.about} alt="MacroSnaps couple portrait" fill priority sizes="50vw" className="object-cover" /></div>
        <div className="marble flex flex-col justify-center px-6 py-16 md:px-14">
          <h1 className="font-serif text-5xl">About Us</h1>
          <div className="prose-ms mt-6 text-[17px]">
            <p>MacroSnaps is a premium global photography and videography company covering conferences, corporate events and weddings, with our own photographers and videographers across the United States, Ontario and Quebec.</p>
            <p>MacroSnaps is part of <a href={SITE.parentUrl}>MacroHype LLC</a>, a digital media and marketing company based out of New York City and Washington DC. We have been doing commercial and product photography, real estate photography and commercial videography for our clients since 2011, and in January 2020 we established MacroSnaps as a separate company focused on events, weddings and life&apos;s important moments.</p>
            <p>Today we are official media partner to conferences such as CDAO, the AI in Finance Summit and the FIX Americas Trading Conference, and we photograph and film events for organizations including IEEE, PwC, Deloitte, Steelcase and the Department of Justice.</p>
            <p>We are fully insured through State Farm, we list every price on our website, and we are rated 5 stars on Google, Thumbtack, WeddingWire and The Knot.</p>
          </div>
          <Link href="/book" className="btn-dark mt-6 self-start">Book a Session</Link>
        </div>
      </section>
      <TrustBar />
      <ClientLogos />
      <CtaBand title="Let us help create long lasting memories" />
    </>
  );
}
