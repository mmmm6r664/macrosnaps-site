import type { Metadata } from "next";
import Link from "next/link";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Legal Information",
  description: "Legal information for MacroSnaps, part of MacroHype LLC: company details, website terms of use, copyright, trademarks, accessibility, insurance and policies.",
  alternates: { canonical: "/legal" },
};

export default function Legal() {
  const year = new Date().getFullYear();
  return (
    <article className="prose-ms mx-auto max-w-3xl px-4 py-16 text-[16px]">
      <h1 className="mb-8 font-serif text-4xl">Legal Information</h1>

      <h2 className="mt-8 font-serif text-2xl">Company</h2>
      <p>MacroSnaps is a photography and videography brand operated by {SITE.parent}, a digital media and marketing company. Offices: {SITE.offices.map((o) => `${o.street}, ${o.city}, ${o.region} ${o.zip}`).join(" · ")}. Phone {SITE.phone}. Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.</p>

      <h2 className="mt-8 font-serif text-2xl">Policies</h2>
      <ul className="list-disc pl-6">
        <li><Link href="/terms">Booking Terms</Link> — pricing, payment, refunds, rescheduling and delivery.</li>
        <li><Link href="/privacy">Privacy Policy</Link> — what information we collect and how we use it.</li>
        <li><Link href="/privacy#cookies">Cookie Policy</Link> — essential and optional cookies, and how to change your choice.</li>
      </ul>

      <h2 className="mt-8 font-serif text-2xl">Website terms of use</h2>
      <p>By using macrosnaps.com you agree to use it lawfully and not to interfere with its operation, attempt to access it without authorization, or copy its content for commercial use. Information on this website, including prices and service descriptions, may change at any time; the price shown at checkout is the price you pay. The website is provided &ldquo;as is&rdquo;, and to the extent permitted by law we are not liable for losses arising from its use or from temporary unavailability.</p>
      <p>Links to other websites, including our sister company {SITE.parent} and third-party platforms such as YouTube and Stripe, are provided for convenience; we are not responsible for their content or practices.</p>

      <h2 className="mt-8 font-serif text-2xl">Copyright & use of images</h2>
      <p>All photographs, videos, text and design on this website are © {year} MacroSnaps / {SITE.parent} or used with permission, and may not be reproduced, downloaded or republished without written permission. Clients receive usage rights to their own delivered photos and videos as described in their booking. Client and event names and logos appear to describe work we have done and remain the property of their owners.</p>
      <p>If you believe content on this site infringes your rights, email <a href={`mailto:${SITE.email}?subject=Copyright%20notice`}>{SITE.email}</a> with the details and we will review it promptly.</p>

      <h2 className="mt-8 font-serif text-2xl">Trademarks</h2>
      <p>MacroSnaps, MacroHype and their logos are trademarks of {SITE.parent}. Other names and logos are the property of their respective owners.</p>

      <h2 className="mt-8 font-serif text-2xl">Insurance</h2>
      <p>{SITE.insurance}</p>

      <h2 className="mt-8 font-serif text-2xl">Accessibility</h2>
      <p>We want everyone to be able to use this website, book online and contact us. If anything on the site is difficult to use with your browser or assistive technology, call {SITE.phone} or email {SITE.email} and we will help you book directly and fix the issue.</p>

      <h2 className="mt-8 font-serif text-2xl">Contact</h2>
      <p>Questions about these terms: <a href={`mailto:${SITE.email}?subject=Legal%20inquiry`}>{SITE.email}</a> · {SITE.phone}.</p>
    </article>
  );
}
