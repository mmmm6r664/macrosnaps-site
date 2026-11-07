import type { Metadata } from "next";
import Link from "next/link";
import { currentClient } from "@/lib/clientAuth";
import { CATEGORIES } from "@/lib/tickets";
import { NewTicketForm } from "@/components/support/TicketForms";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Support", description: "Open a support request with MacroSnaps: bookings, payments, photos and video delivery, or anything else. We reply within one business day.", alternates: { canonical: "/support" } };
export const dynamic = "force-dynamic";

export default async function SupportPage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const { order } = await searchParams;
  const c = await currentClient().catch(() => null);
  return (
    <>
      <section className="bg-black px-4 py-16 text-center text-white">
        <h1 className="font-script text-5xl md:text-6xl">How can we help?</h1>
        <p className="mx-auto mt-4 max-w-xl text-white/70">Open a support request and we&apos;ll reply by email within one business day. You&apos;ll get a ticket number and a private link to follow along.</p>
      </section>
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 md:grid-cols-3">
        <aside className="space-y-6 text-sm">
          <p><span className="eyebrow block">Need it faster?</span>Call <a href={SITE.phoneHref} className="font-semibold">{SITE.phone}</a></p>
          <p><span className="eyebrow block">Track an order</span>{c ? <Link className="underline" href="/account">Go to your client portal</Link> : <><Link className="underline" href="/account/login">Sign in to your client portal</Link> to see your bookings, galleries and requests.</>}</p>
          <p><span className="eyebrow block">Photographers & videographers</span>Use the Support page in your <Link className="underline" href="/staff">crew portal</Link>, or the form here.</p>
          <p><span className="eyebrow block">Quick answers</span><Link className="underline" href="/faq">Read the FAQ</Link></p>
        </aside>
        <div className="md:col-span-2">
          <NewTicketForm categories={CATEGORIES} order={(order ?? "").replace(/[^\w-]/g, "").slice(0, 40)} me={c ? { name: `${c.first_name} ${c.last_name}`.trim(), email: c.email, phone: c.phone ?? "" } : null} />
        </div>
      </div>
    </>
  );
}
