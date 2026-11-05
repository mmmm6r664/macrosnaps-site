import type { Metadata } from "next";
export const metadata: Metadata = { title: "Privacy Policy", alternates: { canonical: "/privacy" } };
export default function Privacy() {
  return (
    <article className="prose-ms mx-auto max-w-3xl px-4 py-16 text-[16px]">
      <h1 className="mb-8 font-serif text-4xl">Privacy Policy</h1>
      <p>MacroSnaps (part of MacroHype LLC) collects the information you give us when you contact us or book a service: your name, email, phone number, company, event details and any notes. We use it only to respond to you, deliver your booking and send related emails.</p>
      <p>Card payments are processed by Stripe; we never see or store your full card number. Emails are delivered through our email provider. We do not sell your personal information.</p>
      <h2 id="cookies" className="mt-8 font-serif text-2xl">Cookies</h2>
      <p>Essential cookies and local storage keep the site working, for example remembering your cookie choice and securing checkout (Stripe sets its own cookies on its payment pages). Analytics cookies are only used if you click &ldquo;Accept&rdquo; in the cookie banner. You can change your choice at any time by clearing this site&apos;s data in your browser, which shows the banner again. Embedded YouTube videos load from youtube-nocookie.com and only after you press play.</p>
      <p>To ask what information we hold about you or to have it deleted, email info@macrosnaps.com.</p>
    </article>
  );
}
