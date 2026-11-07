import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireClient } from "@/lib/clientAuth";
import { feedbackFor, galleryFor, orderFor, stageIndex } from "@/lib/clientData";
import StageTracker from "@/components/client/StageTracker";
import GalleryView from "@/components/client/GalleryView";
import FeedbackForm from "@/components/client/FeedbackForm";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Your Order", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const t12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const fmtDate = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function OrderPage({ params, searchParams }: { params: Promise<{ ref: string }>; searchParams: Promise<{ rate?: string }> }) {
  const ref = (await params).ref.slice(0, 40);
  const rate = Math.min(5, Math.max(0, Math.round(Number((await searchParams).rate) || 0)));
  const c = await requireClient(`/account/orders/${ref}`);
  const o = await orderFor(c.email, ref);
  if (!o) notFound();
  const [{ gallery, photos }, fb] = await Promise.all([galleryFor(o.id), feedbackFor(o.id)]);
  const published = gallery?.status === "published";
  const canReview = stageIndex(o.stage) >= 2 || published;
  return (
    <section className="marble px-4 py-12 md:px-6">
      <div className="mx-auto max-w-5xl">
        <Link href="/account" className="text-sm text-muted hover:text-ink">← All my orders</Link>
        <div className="mt-3 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-serif text-3xl md:text-4xl">{o.service_name}</h1>
            <p className="text-muted">Booking ref {o.ref}{o.city ? ` · ${o.city}` : ""}</p>
          </div>
          {o.status.includes("refunded") && <span className="bg-black/10 px-3 py-1 text-sm">{o.status === "refunded" ? "Refunded" : "Partially refunded"}</span>}
        </div>

        <div className="mt-8 border border-black/10 bg-white p-5 md:p-8"><StageTracker stage={o.stage} /></div>
        <p className="mt-3 text-sm text-muted">Question about this order? <Link className="underline" href={`/support?order=${encodeURIComponent(o.ref)}`}>Open a support request</Link>.</p>

        {published && (
          <div id="gallery" className="mt-8 border border-black/10 bg-white p-5 md:p-8">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="eyebrow">Your gallery</p>
                <h2 className="mt-1 font-serif text-3xl">{gallery!.title || o.service_name}</h2>
                <p className="text-sm text-muted">{photos.length} photo{photos.length === 1 ? "" : "s"}</p>
              </div>
              {gallery!.download_url && <a href={gallery!.download_url} target="_blank" rel="noopener noreferrer" className="btn-gold !py-2.5">Download all (full resolution)</a>}
            </div>
            {gallery!.message && <p className="mt-4 whitespace-pre-wrap text-muted">{gallery!.message}</p>}
            {photos.length > 0 && <div className="mt-6"><GalleryView photos={photos} title={gallery!.title || o.service_name} /></div>}
          </div>
        )}

        <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
          <div className="space-y-8">
            <div className="border border-black/10 bg-white p-5 md:p-8">
              <h2 className="font-serif text-2xl">Schedule</h2>
              <ul className="mt-3 divide-y divide-black/5">
                {o.schedule.map((s, i) => (
                  <li key={i} className="py-3">
                    <p className="font-semibold">{s.date ? fmtDate(s.date) : "Date to be confirmed"}</p>
                    {s.start && s.end && <p className="text-sm text-muted">{t12(s.start)} – {t12(s.end)}</p>}
                    {s.venue && <p className="text-sm text-muted">{s.venue}</p>}
                  </li>
                ))}
              </ul>
              {o.venue_address && <p className="mt-2 text-sm"><span className="text-muted">Address:</span> {o.venue_address}</p>}
            </div>
            {canReview && (
              <div id="feedback" className="scroll-mt-48 border border-black/10 bg-white p-5 md:p-8">
                <h2 className="font-serif text-2xl">Your feedback</h2>
                {fb ? (
                  <p className="mt-2 text-muted"><span className="text-gold">{"★".repeat(fb.rating)}</span><span className="text-black/15">{"★".repeat(5 - fb.rating)}</span> Thanks for sending your feedback on {new Date(fb.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric" })}.</p>
                ) : (
                  <div className="mt-3"><FeedbackForm refId={o.ref} initial={rate} /></div>
                )}
              </div>
            )}
          </div>
          <aside className="space-y-6">
            <div className="border border-black/10 bg-white p-5">
              <h2 className="font-serif text-xl">Payment</h2>
              <ul className="mt-3 space-y-1.5 text-sm">{o.lines.map((l, i) => <li key={i} className="flex justify-between gap-3"><span className="text-muted">{l.label}</span><span className="shrink-0">${Number(l.amount).toLocaleString()}</span></li>)}</ul>
              <p className="mt-3 flex justify-between border-t border-black/10 pt-3 font-semibold"><span>Total</span><span>${(o.total_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })} USD</span></p>
              {o.amount_refunded_cents > 0 && <p className="mt-1 flex justify-between text-sm text-red-700"><span>Refunded</span><span>−${(o.amount_refunded_cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span></p>}
            </div>
            <div className="border border-black/10 bg-white p-5 text-sm">
              <h2 className="font-serif text-xl">Need help?</h2>
              <p className="mt-2 text-muted">Questions about your booking? Call <a href={SITE.phoneHref} className="underline">{SITE.phone}</a> or email <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Booking ${o.ref}`)}`} className="underline">{SITE.email}</a> with your booking ref.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
