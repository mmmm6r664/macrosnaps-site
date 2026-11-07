import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireUser, isManager } from "@/lib/auth";
import { getBooking, staffUsers, BOOKING_STATUSES } from "@/lib/adminData";
import { PageHead, Card, Badge, money, fmtDate, Notice } from "@/components/admin/ui";
import { BookingEditForm, RefundForm } from "@/components/admin/BookingForms";
import { stripe } from "@/lib/stripe";

export const metadata = { title: "Booking" };

const t12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };

export default async function BookingPage({ params }: { params: Promise<{ id: string }> }) {
  const u = await requireUser(["owner", "admin", "staff"]);
  const b = await getBooking(Number((await params).id) || 0);
  if (!b) notFound();
  const manager = isManager(u);
  if (!manager && !b.crew.some((c) => c.id === u.id)) redirect("/admin");
  const staff = manager ? await staffUsers() : [];
  const left = b.total_cents - b.amount_refunded_cents;
  return (
    <>
      <PageHead title={`${b.ref} · ${b.customer_name}`} sub={`${b.service_name}${b.addon ? ` + ${b.addon}` : ""} · ${b.city ?? ""}`} actions={<Badge status={b.status} />} />
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-5">
          <Card title="Schedule">
            <ul className="divide-y divide-black/5">
              {b.schedule.map((s, i) => (
                <li key={i} className="flex flex-wrap justify-between gap-2 py-2 text-sm">
                  <span className="font-semibold">{fmtDate(`${s.date}T12:00:00`)}</span>
                  <span>{t12(s.start)} – {t12(s.end)}{s.extraCrew ? ` · +${s.extraCrew} extra crew` : ""}</span>
                  {s.venue && <span className="w-full text-black/60">{s.venue}</span>}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-sm"><span className="text-black/50">Venue / address:</span> {b.venue_address}</p>
          </Card>
          <Card title="Customer">
            <dl className="grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
              <div><dt className="text-black/50">Name</dt><dd>{b.customer_name}</dd></div>
              <div><dt className="text-black/50">Email</dt><dd><a className="underline" href={`mailto:${b.email}`}>{b.email}</a></dd></div>
              <div><dt className="text-black/50">Phone</dt><dd>{b.phone ? <a className="underline" href={`tel:${b.phone}`}>{b.phone}</a> : "—"}</dd></div>
              <div><dt className="text-black/50">Company</dt><dd>{b.company || "—"}</dd></div>
              {b.notes && <div className="sm:col-span-2"><dt className="text-black/50">Customer notes</dt><dd className="whitespace-pre-wrap">{b.notes}</dd></div>}
            </dl>
          </Card>
          {manager && (
            <Card title="Price">
              <ul className="space-y-1 text-sm">{b.lines.map((l, i) => <li key={i} className="flex justify-between gap-4"><span>{l.label}</span><span>${l.amount.toLocaleString()}</span></li>)}</ul>
              <p className="mt-3 flex justify-between border-t border-black/10 pt-3 font-semibold"><span>Total</span><span>{money(b.total_cents)}</span></p>
              {b.amount_refunded_cents > 0 && <p className="mt-1 flex justify-between text-sm text-red-700"><span>Refunded</span><span>−{money(b.amount_refunded_cents)}</span></p>}
            </Card>
          )}
          {manager && (
            <Card title="Signed agreement">
              {b.signature ? (
                <p className="text-sm">Signed by <span className="font-script text-xl">{b.signature}</span> on {fmtDate(b.signed_at, true)} · Terms version {b.terms_version} · IP {b.signer_ip || "—"} · <Link className="underline" href="/terms" target="_blank">View terms</Link></p>
              ) : <p className="text-sm text-black/50">No signature on file (booked before signing was added, or created manually).</p>}
            </Card>
          )}
        </div>
        <div className="space-y-5">
          {manager ? (
            <>
              <Card title="Manage"><BookingEditForm id={b.id} status={b.status} statuses={BOOKING_STATUSES} notes={b.internal_notes} crew={b.crew.map((c) => c.id)} staff={staff} /></Card>
              <Card title="Payment">
                <p className="text-sm">{b.stripe_payment_intent ? <>Paid by card through Stripe. <a className="underline" target="_blank" rel="noopener" href={`https://dashboard.stripe.com/payments/${b.stripe_payment_intent}`}>Open in Stripe ↗</a></> : b.status === "requested" ? "Booking request: not paid online." : "No card payment recorded yet."}</p>
                {b.stripe_payment_intent && left > 0 && (
                  <div className="mt-4 border-t border-black/10 pt-4">
                    <h3 className="mb-3 text-sm font-semibold">Refund</h3>
                    {stripe ? <RefundForm id={b.id} leftCents={left} /> : <Notice>Connect Stripe to issue refunds here.</Notice>}
                  </div>
                )}
              </Card>
            </>
          ) : (
            <Card title="Your crew">{b.crew.map((c) => <p key={c.id} className="text-sm">{c.name}</p>)}</Card>
          )}
          <p className="text-xs text-black/45">Booked {fmtDate(b.created_at, true)} · Updated {fmtDate(b.updated_at, true)}</p>
        </div>
      </div>
    </>
  );
}
