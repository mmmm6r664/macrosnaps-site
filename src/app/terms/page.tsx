import type { Metadata } from "next";
export const metadata: Metadata = { title: "Booking Terms", alternates: { canonical: "/terms" } };
export default function Terms() {
  return (
    <article className="prose-ms mx-auto max-w-3xl px-4 py-16 text-[16px]">
      <h1 className="mb-8 font-serif text-4xl">Booking Terms</h1>
      <h2 className="mt-6 font-serif text-2xl">Prices</h2>
      <p>All prices listed on our website are final and are not negotiable. Prices are inclusive of taxes and other charges unless stated. The first hour price includes travel to your venue and the buffer time we keep between shoots.</p>
      <h2 className="mt-6 font-serif text-2xl">Payment</h2>
      <p>Online bookings are paid in full by card at checkout through our payment processor, Stripe. Your date and time are reserved once payment is complete. Corporate programs may be quoted and invoiced separately by agreement.</p>
      <h2 className="mt-6 font-serif text-2xl">Refunds and rescheduling</h2>
      <p>We don&apos;t offer refunds under any circumstances, because when we receive a booking we reserve the slot for the client and give up all other potential bookings for that time. Bookings can be rescheduled without additional charges due to extreme weather conditions or an unavoidable emergency such as a major accident or life-threatening issue (proof of emergency is required). Beyond these two scenarios, bookings can&apos;t be rescheduled.</p>
      <h2 className="mt-6 font-serif text-2xl">Editing and delivery</h2>
      <p>All pictures are color graded and retouched. Additional editing requests (for example slimming or skin-tone changes) are charged separately. Re-edits of photos you are not satisfied with are free. Delivery times are listed in each package.</p>
      <h2 className="mt-6 font-serif text-2xl">Contact</h2>
      <p>MacroSnaps, part of MacroHype LLC · 877-622-4973 · info@macrosnaps.com</p>
    </article>
  );
}
