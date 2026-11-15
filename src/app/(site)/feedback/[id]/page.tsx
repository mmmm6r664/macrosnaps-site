import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { getSurvey, verifySurvey, reviewUrl, recordTip, HEARD } from "@/lib/surveys";
import { SurveyForm, TipForm } from "@/components/SurveyForms";

export const metadata: Metadata = { title: "Your feedback", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function FeedbackPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string; sent?: string; tip?: string; session_id?: string }> }) {
  const id = Number((await params).id);
  const sp = await searchParams;
  if (!Number.isInteger(id) || !verifySurvey(id, sp.k ?? "")) notFound();
  let s = await getSurvey(id);
  if (!s) notFound();
  if (sp.tip === "done" && sp.session_id && stripe && !s.tip_paid_at) {
    const cs = await stripe.checkout.sessions.retrieve(sp.session_id).catch(() => null);
    if (cs && cs.payment_status === "paid" && cs.metadata?.kind === "tip" && cs.metadata?.survey_id === String(id)) {
      await recordTip(id, cs.id, cs.amount_total ?? 0);
      s = (await getSurvey(id))!;
    }
  }
  const review = await reviewUrl();
  const happy = s.submitted_at && Number(s.avg_rating) >= 4 && (s.recommend ?? 0) >= 4;
  return (
    <>
      <section className="bg-black px-4 py-14 text-center text-white">
        <h1 className="font-script text-5xl md:text-6xl">{s.submitted_at ? "Thank you!" : "How did we do?"}</h1>
        <p className="mx-auto mt-4 max-w-xl text-white/70">{s.submitted_at ? "Your feedback has been sent to our team." : "Two minutes of your feedback helps us keep our standards high and recognise the crew who looked after you."}</p>
      </section>
      <div className="mx-auto max-w-3xl px-4 py-12">
        {s.tip_paid_at && <p role="status" className="mb-8 border border-emerald-200 bg-emerald-50 px-4 py-3 text-emerald-900">Thank you for your ${((s.tip_cents ?? 0) / 100).toFixed(2)} tip! 100% goes to your crew.</p>}
        {!s.submitted_at ? (
          <SurveyForm id={id} k={sp.k!} heard={HEARD} s={{ name: s.name, email: s.email, phone: s.phone ?? "", event_date: s.event_date ?? "", location: s.location, services: s.services, crew: s.crew }} />
        ) : (
          <div className="space-y-10">
            {happy && review && (
              <div className="border border-[#ccba56]/40 bg-[#ccba56]/10 p-6 text-center">
                <h2 className="font-serif text-3xl">Would you share it on Google?</h2>
                <p className="mx-auto mt-2 max-w-lg text-black/70">A short review helps other clients find a photographer they can trust. It takes less than a minute.</p>
                <a href={review} target="_blank" rel="noopener noreferrer" className="mt-5 inline-block bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[.2em] text-white hover:bg-[#8a7a2b]">Leave a Google review</a>
              </div>
            )}
            {!s.tip_paid_at && (
              <div id="tip" className="border border-black/10 p-6">
                <h2 className="font-serif text-2xl">Tip your photographer or videographer</h2>
                <p className="mt-2 text-sm text-black/65">Optional. 100% of your tip goes to {s.crew.map((c) => c.name).join(" and ") || "your crew"}. Secure card payment by Stripe.</p>
                <TipForm id={id} k={sp.k!} />
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
