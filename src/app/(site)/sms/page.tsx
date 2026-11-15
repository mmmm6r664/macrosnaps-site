import Link from "next/link";
import type { Metadata } from "next";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "SMS Terms & Opt-in", description: "How MacroSnaps text messages work: what we send, how you opt in, and how to opt out.", alternates: { canonical: "/sms" } };

export default function Sms() {
  return (
    <article className="prose-ms mx-auto max-w-3xl px-4 py-16 text-[16px]">
      <h1 className="mb-8 font-serif text-4xl">SMS Terms &amp; Opt-in</h1>
      <p>MacroSnaps, part of MacroHype LLC, sends text messages only to people who ask for them. This page explains the program.</p>
      <h2 className="mt-8 font-serif text-2xl">What we send</h2>
      <ul className="list-disc pl-6">
        <li><strong>Clients:</strong> booking confirmations, shoot-day reminders, schedule changes, and notices that your photos or videos are ready.</li>
        <li><strong>Our contracted photographers and videographers:</strong> shoot offers and assignments, schedule updates and file-delivery reminders.</li>
      </ul>
      <p>We do not send marketing texts, and we never sell or share your mobile number or SMS consent with third parties or affiliates for their marketing.</p>
      <h2 className="mt-8 font-serif text-2xl">How you opt in</h2>
      <ul className="list-disc pl-6">
        <li><strong>Booking on macrosnaps.com:</strong> on the booking form at <Link className="underline" href="/book">macrosnaps.com/book</Link>, under &ldquo;Your details&rdquo;, you can tick an optional, unchecked-by-default box: &ldquo;Yes, text me. I agree to receive automated text messages from MacroSnaps (MacroHype LLC) about booking confirmations, shoot reminders, schedule updates and delivery notices at the mobile number above. Consent is not a condition of purchase. Message frequency varies. Msg &amp; data rates may apply. Reply STOP to opt out, HELP for help.&rdquo;</li>
        <li><strong>Crew:</strong> photographers and videographers opt in with the same kind of optional checkbox on our application form at <Link className="underline" href="/careers">macrosnaps.com/careers</Link> and in their staff portal profile.</li>
        <li><strong>By text:</strong> texting START or YES to our number.</li>
      </ul>
      <h2 className="mt-8 font-serif text-2xl">Frequency, cost and help</h2>
      <p>Message frequency varies with your bookings or assignments, typically 1–10 messages per booking. Message and data rates may apply. Carriers are not liable for delayed or undelivered messages.</p>
      <h2 className="mt-8 font-serif text-2xl">Opting out</h2>
      <p>Reply <strong>STOP</strong> at any time to stop all texts; you&apos;ll get one confirmation and nothing more. Reply <strong>HELP</strong> for help, or contact us at {SITE.email} or {SITE.phone}.</p>
      <p className="mt-8 text-sm text-black/60">See also our <Link className="underline" href="/privacy">Privacy Policy</Link> and <Link className="underline" href="/terms">Terms and Conditions</Link>.</p>
    </article>
  );
}
