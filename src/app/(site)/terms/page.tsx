import type { Metadata } from "next";
import TermsList from "@/components/TermsList";
import { TERMS_VERSION } from "@/lib/terms";

export const metadata: Metadata = { title: "Terms and Conditions", description: "MacroSnaps terms and conditions for photography and videography bookings: ownership, usage, refunds, file storage and more.", alternates: { canonical: "/terms" } };

export default function Terms() {
  return (
    <article className="prose-ms mx-auto max-w-3xl px-4 py-16 text-[16px]">
      <h1 className="mb-2 font-serif text-4xl">Terms and Conditions</h1>
      <p className="mb-10 text-sm text-muted">Version {TERMS_VERSION}. Every client reviews and signs these terms when booking.</p>
      <TermsList />
      <h2 className="mt-10 font-serif text-2xl">Contact</h2>
      <p>MacroSnaps, part of MacroHype LLC · 877-622-4973 · info@macrosnaps.com</p>
    </article>
  );
}
