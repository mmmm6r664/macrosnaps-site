import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PageHead, Notice, Badge, money, fmtDate, btnGhost } from "@/components/admin/ui";
import { CopyLink, InvoiceEmail } from "@/components/admin/InvoiceTools";
import { invoiceAction } from "../actions";

export const metadata = { title: "Invoice" };

export default async function InvoicePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ created?: string; "draft-preview"?: string }> }) {
  await requireUser();
  const { id } = await params; const sp = await searchParams; const created = sp.created;
  if (!stripe || !/^in_[A-Za-z0-9]+$/.test(id)) notFound();
  const inv = await stripe.invoices.retrieve(id).catch(() => null);
  if (!inv) notFound();
  const lines = (await stripe.invoices.listLineItems(id, { limit: 50 })).data;
  const first = (inv.customer_name || "").split(" ")[0] || "there";
  const due = inv.due_date ? new Date(inv.due_date * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" }) : "";
  const sms = inv.hosted_invoice_url ? `Hi ${first}, this is MacroSnaps. Here's your invoice ${inv.number} for ${money(inv.amount_due)}${due ? ` (due ${due})` : ""}. You can view and pay it securely here: ${inv.hosted_invoice_url}` : "";
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
            <dt className="text-black/50">Due</dt><dd>{inv.due_date ? new Date(inv.due_date * 1000).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" }) : "—"}</dd>
            <dt className="text-black/50">Note</dt><dd>{inv.description || "—"}</dd>
            <dt className="text-black/50">Emailed</dt><dd>{emailed ? fmtDate(new Date(emailed)) : "Not yet"}</dd>
          </dl>
          <ul className="mt-4 divide-y divide-black/5 border-t border-black/10 text-sm">
            {lines.map((l) => <li key={l.id} className="flex justify-between gap-4 py-2"><span>{l.description}</span><span className="whitespace-nowrap font-medium">{money(l.amount)}</span></li>)}
          </ul>
          {inv.invoice_pdf && <a href={inv.invoice_pdf} target="_blank" rel="noopener" className="mt-3 inline-block text-sm underline">Download PDF ↗</a>}
        </section>
        <section className="rounded-lg border border-black/10 bg-white p-5">
          <h2 className="font-semibold">Pay link (web)</h2>
          {inv.hosted_invoice_url ? (
            <div className="mt-3"><CopyLink url={inv.hosted_invoice_url} text={sms} /></div>
          ) : (
            <div className="mt-3 space-y-2 text-sm">
              <p className="text-black/60">A draft has no pay link yet. Finalizing creates the link without emailing anyone; the invoice can&apos;t be edited after that.</p>
              <form action={invoiceAction}><input type="hidden" name="id" value={inv.id} /><input type="hidden" name="op" value="finalize" /><input type="hidden" name="back" value={`/admin/invoices/${inv.id}`} /><button className={btnGhost}>Finalize &amp; get link (no email)</button></form>
            </div>
          )}
        </section>
      </div>
      {(inv.status === "draft" || inv.status === "open") && (
        <section className="mt-6 rounded-lg border border-black/10 bg-white p-5">
          <h2 className="mb-3 font-semibold">Email the invoice from MacroSnaps</h2>
          <InvoiceEmail id={inv.id!} draft={inv.status === "draft"} />
        </section>
      )}
    </>
  );
}
