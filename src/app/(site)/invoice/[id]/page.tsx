import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { stripe } from "@/lib/stripe";
import { verifyInvoiceKey } from "@/lib/invoiceLink";
import { SITE } from "@/lib/site";

export const metadata: Metadata = { title: "Your invoice", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const usd = (c: number) => `$${(c / 100).toLocaleString("en-US", { minimumFractionDigits: c % 100 ? 2 : 0, maximumFractionDigits: 2 })}`;
const day = (s: number) => new Date(s * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> }) {
  const { id } = await params;
  const k = String((await searchParams).k ?? "");
  if (!stripe || !verifyInvoiceKey(id, k)) notFound();
  const inv = await stripe.invoices.retrieve(id).catch(() => null);
  if (!inv || inv.status === "draft") notFound();
  const lines = (await stripe.invoices.listLineItems(id, { limit: 50 })).data.slice().reverse();
  const paid = inv.status === "paid";
  const voided = inv.status === "void" || inv.status === "uncollectible";
  const overdue = !paid && !voided && inv.due_date && inv.due_date * 1000 < Date.now() - 86_400_000;
  return (
    <section className="marble px-4 py-12 md:px-6">
      <div className="mx-auto max-w-3xl">
        <p className="eyebrow">Invoice {inv.number}</p>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">{paid ? "Paid. Thank you!" : voided ? "This invoice was cancelled" : `${usd(inv.amount_due)} due${inv.due_date ? ` ${day(inv.due_date)}` : ""}`}</h1>
        {inv.description && <p className="mt-2 text-muted">{inv.description}</p>}

        <div className="mt-8 border border-black/10 bg-white">
          <dl className="grid grid-cols-1 gap-x-8 gap-y-3 border-b border-black/10 p-6 text-sm sm:grid-cols-2">
            <div><dt className="text-xs uppercase tracking-[0.15em] text-muted">Billed to</dt><dd className="mt-1">{inv.customer_name}<br />{inv.customer_email}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.15em] text-muted">From</dt><dd className="mt-1">{SITE.name}, part of {SITE.parent}<br />{SITE.email} · {SITE.phone}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.15em] text-muted">Invoice date</dt><dd className="mt-1">{day(inv.created)}</dd></div>
            <div><dt className="text-xs uppercase tracking-[0.15em] text-muted">{paid ? "Status" : "Due date"}</dt><dd className={`mt-1 ${overdue ? "font-semibold text-red-700" : ""}`}>{paid ? "Paid" : voided ? "Cancelled" : inv.due_date ? `${day(inv.due_date)}${overdue ? " (overdue)" : ""}` : "On receipt"}</dd></div>
          </dl>
          <table className="w-full text-left text-sm">
            <tbody>
              {lines.map((l) => (
                <tr key={l.id} className="border-b border-black/5 align-top">
                  <td className="p-6 leading-relaxed">{l.description}</td>
                  <td className="whitespace-nowrap p-6 text-right font-medium">{usd(l.amount)}</td>
                </tr>
              ))}
              <tr className="bg-[#f5f1e6]">
                <td className="p-6 text-xs font-semibold uppercase tracking-[0.2em]">{paid ? "Total paid" : "Total due"}</td>
                <td className="whitespace-nowrap p-6 text-right font-serif text-2xl">{usd(paid ? inv.amount_paid : inv.amount_due)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 flex flex-col items-center gap-3 text-center">
          {!paid && !voided && inv.hosted_invoice_url && (
            <>
              <a href={inv.hosted_invoice_url} className="btn-gold px-10 py-4 text-sm">Pay {usd(inv.amount_due)} securely</a>
              <p className="text-sm text-muted">Card, Apple Pay / Google Pay or bank transfer (ACH). Payments are processed securely by Stripe.</p>
            </>
          )}
          {paid && inv.hosted_invoice_url && <a href={inv.hosted_invoice_url} className="text-sm underline">View receipt</a>}
          {inv.invoice_pdf && <a href={inv.invoice_pdf} className="text-sm underline">Download PDF invoice</a>}
          <p className="mt-4 text-sm text-muted">Questions, a W-9 or another way to pay? Email <a className="underline" href={`mailto:${SITE.email}`}>{SITE.email}</a> or call <a className="underline" href={`tel:${SITE.phone.replace(/\D/g, "")}`}>{SITE.phone}</a>.</p>
        </div>
      </div>
    </section>
  );
}
