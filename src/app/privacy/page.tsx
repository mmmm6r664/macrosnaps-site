import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };
export default function Privacy() {
  return (
    <article className="prose-ms mx-auto max-w-3xl px-4 py-16 text-[16px]">
      <h1 className="mb-8 font-serif text-4xl">Privacy Policy</h1>
      <p>MacroSnaps (part of MacroHype LLC) collects the information you give us when you contact us or book a service: your name, email, phone number, company, event details and any notes. We use it only to respond to you, deliver your booking and send related emails.</p>
      <p>Card payments are processed by Stripe; we never see or store your full card number. Emails are delivered through our email provider. We do not sell your personal information.</p>
      <p>To ask what information we hold about you or to have it deleted, email info@macrosnaps.com.</p>
    </article>
  );
}
