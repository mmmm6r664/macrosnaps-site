import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { q } from "@/lib/db";
import { PageHead, Card, Notice } from "@/components/admin/ui";
import InvoiceForm, { type InvoiceInitial } from "@/components/admin/InvoiceForm";

export const metadata = { title: "New invoice" };

/** Prefill from an existing Stripe invoice (?from=in_…, to edit a sent invoice as a new copy) or a CRM client (?client=ID). */
async function prefill(sp: { from?: string; client?: string }): Promise<InvoiceInitial> {
  if (sp.from && /^in_[A-Za-z0-9]+$/.test(sp.from) && stripe) {
    try {
      const inv = await stripe.invoices.retrieve(sp.from, { expand: ["customer"] });
      const c = inv.customer && typeof inv.customer === "object" && !("deleted" in inv.customer) ? inv.customer : null;
      const md = (c?.metadata ?? {}) as Record<string, string>;
      const nm = (md.contact_name || inv.customer_name || c?.name || "").trim().split(/\s+/);
      const a = inv.customer_address ?? c?.address;
      return {
        firstName: md.first_name || nm[0] || "", lastName: md.last_name || nm.slice(1).join(" "), email: inv.customer_email ?? c?.email ?? "", phone: inv.customer_phone ?? c?.phone ?? "",
        company: md.company || "", line1: a?.line1 ?? "", line2: a?.line2 ?? "", city: a?.city ?? "", state: a?.state ?? "", zip: a?.postal_code ?? "", memo: inv.description ?? "",
        lines: inv.lines.data.map((l) => ({ desc: l.description ?? "", qty: String(l.quantity ?? 1), price: String(((l.amount ?? 0) / (l.quantity || 1)) / 100) })),
      };
    } catch (e) { console.error(e); }
  }
  if (sp.client && /^\d+$/.test(sp.client)) {
    const [c] = await q<{ first_name: string; last_name: string; email: string | null; phone: string | null; company: string | null }[]>`select first_name, last_name, email, phone, company from clients where id = ${Number(sp.client)}`;
    if (c) return { firstName: c.first_name, lastName: c.last_name, email: c.email ?? "", phone: c.phone ?? "", company: c.company ?? "" };
  }
  return {};
}

export default async function NewInvoice({ searchParams }: { searchParams: Promise<{ from?: string; client?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const initial = await prefill(sp);
  return (
    <>
      <PageHead title={sp.from ? "Edit invoice (new copy)" : "New invoice"} sub={sp.from ? "A sent invoice can't be changed, so this makes a corrected copy. After you send it, void the old invoice." : "Bill any customer for any amount, for example a multi-day conference or a custom package."} />
      {!stripe && <Notice>Stripe isn&apos;t connected yet. You can fill this in, but invoices can only be created once STRIPE_SECRET_KEY is added in Vercel.</Notice>}
      <Card><InvoiceForm key={sp.from ?? sp.client ?? "new"} initial={initial} /></Card>
    </>
  );
}
