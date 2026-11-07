import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PageHead, Card, Notice } from "@/components/admin/ui";
import InvoiceForm from "@/components/admin/InvoiceForm";

export const metadata = { title: "New invoice" };

export default async function NewInvoice() {
  await requireUser();
  return (
    <>
      <PageHead title="New invoice" sub="Bill any customer for any amount, for example a multi-day conference or a custom package." />
      {!stripe && <Notice>Stripe isn&apos;t connected yet. You can fill this in, but invoices can only be created once STRIPE_SECRET_KEY is added in Vercel.</Notice>}
      <Card><InvoiceForm /></Card>
    </>
  );
}
