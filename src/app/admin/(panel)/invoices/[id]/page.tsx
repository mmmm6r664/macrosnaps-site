import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PageHead, Notice, Badge, money, fmtDate, btnGhost } from "@/components/admin/ui";
import { CopyLink, InvoiceEmail } from "@/components/admin/InvoiceTools";
import { invoiceAction, invoicePaidAction } from "../actions";
import { invoiceLink } from "@/lib/invoiceLink";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; "draft-preview"?: string }> }) {
  await requireUser();
  const { id } = await params; const sp = await searchParams; const created = sp.created;
  if (!stripe || !/^in_[A-Za-z0-9]+$/.test(id)) notFound();
  const inv = await stripe.invoices.retrieve(id).catch(() => null);
  if (!inv) notFound();
  const lines = (await stripe.invoices.listLineItems(id, { limit: 50 })).data.slice().reverse();
  const first = (inv.metadata?.contact_name || inv.customer_name || "").split(" ")[0] || "there";
  const due = inv.due_date ? new Date(inv.due_date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "America/New_York" }) : "";
  const link = inv.hosted_invoice_url ? invoiceLink(inv.id!) : "";
  const sms = link ? `Hi ${first}, this is MacroSnaps. Here's your invoice ${inv.number} for ${money(inv.amount_due)}${due ? ` (due ${due})` : ""}. You can view and pay it securely here: ${link}` : "";
  const emailed = inv.metadata?.emailed_by_macrosnaps;
  return (
    <>
      <PageHead title={`Invoice ${inv.number ?? "(draft)"}`} sub={`${inv.customer_name ?? ""} · ${inv.customer_email ?? ""}`} actions={<Link href="/admin/invoices" className={btnGhost}>← All invoices</Link>} />
      {sp["draft-preview"] && inv.status === "draft" && <Notice>You clicked the pay button in a draft preview. The real pay page exists once the invoice is finalized; in the client&apos;s email this button opens it.</Notice>}
      {created === "draft" && <Notice tone="green">Draft saved. Nothing has been sent.</Notice>}
      {created === "sent" && <Notice tone="green">Invoice finalized and emailed from MacroSnaps.</Notice>}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <div className="flex items-center justify-between"><h2 className="font-semibold">Details</h2><Badge status={inv.status ?? "draft"} /></div>
          <dl className="mt-3 grid grid-cols-[110px_1fr] gap-y-1 text-sm">
            <dt className="text-black/50">Amount</dt><dd className="font-semibold">{money(inv.amount_due)}</dd>
            <dt className="text-black/50">Due</dt><dd>{inv.due_date ? new Date(inv.due_date * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "America/New_York" }) : "—"}</dd>
            <dt className="text-black/50">Bill to</dt><dd>{inv.customer_name}{inv.custom_fields?.map((c) => <span key={c.name} className="block text-black/60">{c.name}: {c.value}</span>)}{inv.customer_address?.line1 && <span className="block text-black/60">{[inv.customer_address.line1, inv.customer_address.line2, [inv.customer_address.city, inv.customer_address.state, inv.customer_address.postal_code].filter(Boolean).join(", ")].filter(Boolean).join(" · ")}</span>}</dd>
            <dt className="text-black/50">Note</dt><dd>{inv.description || "—"}</dd>
            <dt className="text-black/50">Emailed</dt><dd>{emailed ? fmtDate(new Date(emailed)) : "Not yet"}</dd>
          </dl>
          <ul className="mt-4 divide-y divide-black/5 border-t border-black/10 text-sm">
            {lines.map((l) => <li key={l.id} className="flex justify-between gap-4 py-2"><span>{l.description}</span><span className="whitespace-nowrap font-medium">{money(l.amount)}</span></li>)}
          </ul>
          {inv.invoice_pdf && <a href={inv.invoice_pdf} target="_blank" rel="noopener" className="mt-3 inline-block text-sm underline">Download PDF ↗</a>}
        </section>
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Client link (MacroSnaps invoice page)</h2>
          {inv.hosted_invoice_url ? (
            <div className="mt-3"><CopyLink url={link} text={sms} /><p className="mt-3 text-xs text-black/50">Opens your MacroSnaps invoice page; the Pay button there goes to Stripe&apos;s secure checkout. <a className="underline" href={inv.hosted_invoice_url} target="_blank" rel="noopener">Stripe page ↗</a></p></div>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-black/60">A draft has no pay link yet. Finalizing creates the link without emailing anyone; the invoice can&apos;t be edited after that.</p>
              <form action={invoiceAction}><input type="hidden" name="id" value={inv.id} /><input type="hidden" name="op" value="finalize" /><input type="hidden" name="back" value={`/admin/invoices/${inv.id}`} /><button className={btnGhost}>Finalize &amp; get link (no email)</button></form>
            </div>
          )}
        </section>
      </div>
      {inv.status === "paid" && (
        <section className="mt-6 rounded-lg border border-emerald-200 bg-emerald-50/50 p-5">
          <h2 className="font-semibold">Paid {inv.status_transitions?.paid_at ? fmtDate(new Date(inv.status_transitions.paid_at * 1000)) : ""} · {money(inv.amount_paid)}</h2>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {inv.metadata?.paid_team_notified ? <span>✓ Payment alert emailed to the team</span> : (
              <form action={invoicePaidAction}><input type="hidden" name="id" value={inv.id} /><input type="hidden" name="which" value="team" /><button className={btnGhost}>Email me the payment alert</button></form>
            )}
            {inv.metadata?.paid_client_notified ? <span>✓ Receipt emailed to the client</span> : (
              <form action={invoicePaidAction}><input type="hidden" name="id" value={inv.id} /><input type="hidden" name="which" value="client" /><button className={btnGhost}>Email the client a receipt</button></form>
            )}
          </div>
        </section>
      )}
      {(inv.status === "draft" || inv.status === "open") && (
        <section className="mt-6 rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-3 font-semibold">Email the invoice from MacroSnaps</h2>
          <InvoiceEmail id={inv.id!} draft={inv.status === "draft"} />
        </section>
      )}
    </>
  );
}
