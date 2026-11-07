import type { Metadata } from "next";
import Link from "next/link";
import { stripe } from "@/lib/stripe";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Booking Confirmed", robots: { index: false } };

export default async function Success({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams;
  let m: Record<string, string> = {};
  let paid = false;
  if (stripe && session_id?.startsWith("cs_")) {
    try {
      const s = await stripe.checkout.sessions.retrieve(session_id);
      m = (s.metadata as Record<string, string>) || {};
      paid = s.payment_status === "paid";
    } catch {}
  }
  return (
    <section className="mx-auto max-w-2xl px-4 py-24 text-center">
      <h1 className="font-script text-5xl">{paid ? "You're booked!" : "Thank you!"}</h1>
      <p className="mt-5 text-lg text-muted">
        {paid ? "Your payment was successful and your date is reserved. A confirmation email is on its way, and we'll confirm your crew before the shoot." : "We've received your booking. A confirmation email is on its way."}
      </p>
      {m.service && (
        <dl className="mx-auto mt-8 grid max-w-md grid-cols-2 gap-2 border border-black/10 bg-marble p-6 text-left text-sm">
          <dt className="text-muted">Service</dt><dd>{m.service}</dd>
          <dt className="text-muted">Package</dt><dd>{m.package}</dd>
          <dt className="text-muted">Schedule</dt><dd>{m.schedule}</dd>{m.addon && (<><dt className="text-muted">Add-on</dt><dd>{m.addon}</dd></>)}<dt className="text-muted">Total</dt><dd>{m.total}</dd>
          <dt className="text-muted">City</dt><dd>{m.city}</dd>
        </dl>
      )}
      <p className="mt-8 text-sm">Questions? Call <a href={SITE.phoneHref} className="underline">{SITE.phone}</a> or email <a href={`mailto:${SITE.email}`} className="underline">{SITE.email}</a>.</p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/account" className="btn-gold">Track your order</Link>
        <Link href="/" className="btn-dark">Back to home</Link>
      </div>
      <p className="mt-3 text-xs text-muted">Sign in with the email you booked with to see your order status and, later, your gallery.</p>
    </section>
  );
}
