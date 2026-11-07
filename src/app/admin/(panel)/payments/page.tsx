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
  let list: Stripe.ApiList<Stripe.PaymentIntent>;
  try {
    list = await stripe.paymentIntents.list({ limit: 25, ...(after && /^pi_/.test(after) ? { starting_after: after } : {}), expand: ["data.latest_charge"] });
  } catch (e) {
    return (<><PageHead title="Payments & refunds" /><Notice tone="red">Stripe error: {e instanceof Error ? e.message : "unknown"}</Notice></>);
  }
  const rows = list.data.filter((p) => p.status !== "requires_payment_method" && p.status !== "canceled");
  return (
    <>
      <PageHead title="Payments & refunds" sub="Card payments from Stripe: bookings and paid invoices." actions={<a className={btnGhost} href="https://dashboard.stripe.com/payments" target="_blank" rel="noopener">Open Stripe ↗</a>} />
      {rows.length ? (
        <Table head={["Date", "Customer", "Description", "Amount", "Refunded", "Status", ""]}>
          {rows.map((p) => {
            const ch = p.latest_charge && typeof p.latest_charge !== "string" ? p.latest_charge : null;
            const refunded = ch?.amount_refunded ?? 0;
            const left = (ch?.amount ?? p.amount_received) - refunded;
            const status = p.status === "succeeded" ? (refunded >= (ch?.amount ?? 1) ? "refunded" : refunded > 0 ? "partially_refunded" : "succeeded") : p.status;
            return (
              <tr key={p.id} className="align-top">
                <td className="whitespace-nowrap px-4 py-3">{fmtDate(new Date(p.created * 1000), true)}</td>
                <td className="px-4 py-3">{ch?.billing_details?.name || p.metadata.customer_name || "—"}<div className="text-xs text-black/50">{ch?.billing_details?.email || p.receipt_email || ""}</div></td>
                <td className="max-w-xs px-4 py-3 text-black/70">{p.description || "—"}{p.metadata.booking_ref && <div className="text-xs">Booking {p.metadata.booking_ref}</div>}</td>
                <td className="whitespace-nowrap px-4 py-3 font-semibold">{money(p.amount)}</td>
                <td className="whitespace-nowrap px-4 py-3">{refunded ? money(refunded) : "—"}</td>
                <td className="px-4 py-3"><Badge status={status} /></td>
                <td className="px-4 py-3 text-right">
                  <div className="flex flex-col items-end gap-1">
                    {p.status === "succeeded" && left > 0 && <PaymentRefund pi={p.id} leftCents={left} />}
                    <a className="text-xs underline" href={`https://dashboard.stripe.com/payments/${p.id}`} target="_blank" rel="noopener">Stripe ↗</a>
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
