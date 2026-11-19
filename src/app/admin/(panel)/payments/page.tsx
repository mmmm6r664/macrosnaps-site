import Link from "next/link";
import type Stripe from "stripe";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PageHead, Table, Badge, Empty, Notice, money, fmtDate, btnGhost } from "@/components/admin/ui";
import PaymentRefund from "@/components/admin/PaymentRefund";

export const metadata = { title: "Payments & refunds" };

export default async function Payments({ searchParams }: { searchParams: Promise<{ after?: string }> }) {
  await requireUser();
  if (!stripe) return (<><PageHead title="Payments & refunds" /><Notice>Stripe isn&apos;t connected yet. Add STRIPE_SECRET_KEY in Vercel and every payment will show here, with refunds.</Notice></>);
  const { after } = await searchParams;
  // Listed by charge (when the money moved), not by PaymentIntent: an invoice's PaymentIntent is created when the invoice
  // is sent, so a payment days later would sit far down the list, and abandoned checkouts would crowd the page.
  let list: Stripe.ApiList<Stripe.Charge>;
  try {
    list = await stripe.charges.list({ limit: 40, ...(after && /^ch_|^py_/.test(after) ? { starting_after: after } : {}), expand: ["data.payment_intent"] });
  } catch (e) {
    return (<><PageHead title="Payments & refunds" /><Notice tone="red">Stripe error: {e instanceof Error ? e.message : "unknown"}</Notice></>);
  }
  const rows = list.data.filter((c) => c.status === "succeeded" || c.status === "pending");
  return (
    <>
      <PageHead title="Payments & refunds" sub="Payments received through Stripe (website bookings and invoices), newest first. PayPal and other outside payments aren\u2019t listed here." actions={<a className={btnGhost} href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener">Open Stripe ↗</a>} />
      {rows.length ? (
        <Table head={["Date", "Customer", "Description", "Amount", "Refunded", "Status", ""]}>
          {rows.map((ch) => {
            const p = ch.payment_intent && typeof ch.payment_intent !== "string" ? ch.payment_intent : null;
            const refunded = ch.amount_refunded ?? 0;
            const left = ch.amount - refunded;
            const status = ch.status === "succeeded" ? (refunded >= ch.amount ? "refunded" : refunded > 0 ? "partially_refunded" : "succeeded") : ch.status;
            const md = { ...(p?.metadata ?? {}), ...(ch.metadata ?? {}) };
            return (
              <tr key={ch.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3">{fmtDate(new Date(ch.created * 1000), true)}</td>
                <td className="px-4 py-3">{ch.billing_details?.name || md.customer_name || "—"}<div className="text-xs text-black/50">{ch.billing_details?.email || ch.receipt_email || p?.receipt_email || ""}</div></td>
                <td className="max-w-xs px-4 py-3 text-black/70">{ch.description || p?.description || "—"}{md.booking_ref && <div className="text-xs">Booking {md.booking_ref}</div>}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{money(ch.amount)}</td>
                <td className="whitespace-nowrap px-4 py-3">{refunded ? money(refunded) : "—"}</td>
                <td className="px-4 py-3"><Badge status={status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    {ch.status === "succeeded" && left > 0 && p && <PaymentRefund pi={p.id} leftCents={left} />}
                    <a className="text-xs underline" href={`https://dashboard.stripe.com/payments/${p?.id ?? ch.id}`} target="_blank" rel="noopener">Stripe ↗</a>
                  </div>
                </td>
              </tr>
            );
          })}
        </Table>
      ) : <Empty>No payments yet.</Empty>}
      <div className="mt-4 flex justify-end gap-2">
        {after && <Link className={btnGhost} href="/admin/payments">← Newest</Link>}
        {list.has_more && <Link className={btnGhost} href={`/admin/payments?after=${list.data[list.data.length - 1].id}`}>Older →</Link>}
      </div>
    </>
  );
}
