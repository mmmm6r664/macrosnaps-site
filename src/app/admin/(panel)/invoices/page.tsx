import Link from "next/link";
import type Stripe from "stripe";
import { requireUser } from "@/lib/auth";
import { stripe } from "@/lib/stripe";
import { PageHead, Table, Badge, Empty, Notice, money, fmtDate, btnGold, btnGhost } from "@/components/admin/ui";
import { invoiceAction } from "./actions";

export const metadata = { title: "Invoices" };

function Act({ id, op, label, danger }: { id: string; op: string; label: string; danger?: boolean }) {
  return <form action={invoiceAction}><input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} /><button className={`text-xs underline ${danger ? "text-red-700" : ""}`}>{label}</button></form>;
}

export default async function Invoices({ searchParams }: { searchParams: Promise<{ after?: string; created?: string }> }) {
  await requireUser();
  const head = <PageHead title="Invoices" sub="Custom invoices. Emails come from MacroSnaps; Stripe hosts the secure pay page." actions={<Link href="/admin/invoices/new" className={btnGold}>New invoice</Link>} />;
  if (!stripe) return (<>{head}<Notice>Stripe isn&apos;t connected yet. Add STRIPE_SECRET_KEY in Vercel to create and send invoices.</Notice></>);
  const { after, created } = await searchParams;
  let list: Stripe.ApiList<Stripe.Invoice>;
  try { list = await stripe.invoices.list({ limit: 25, ...(after && /^in_/.test(after) ? { starting_after: after } : {}) }); }
  catch (e) { return (<>{head}<Notice tone="red">Stripe error: {e instanceof Error ? e.message : "unknown"}</Notice></>); }
  return (
    <>
      {head}
      {created && <Notice tone="green">{created === "sent" ? "Invoice created and emailed from MacroSnaps." : "Draft saved. Send it when you're ready."}</Notice>}
      {list.data.length ? (
        <Table head={["Number", "Customer", "Amount", "Due", "Status", ""]}>
          {list.data.map((i) => (
            <tr key={i.id} className="align-top">
              <td className="px-4 py-3"><Link href={`/admin/invoices/${i.id}`} className="underline">{i.number ?? "Draft"}</Link><div className="text-xs text-black/50">{fmtDate(new Date(i.created * 1000))}</div></td>
              <td className="px-4 py-3">{i.customer_name || "—"}<div className="text-xs text-black/50">{i.customer_email}</div></td>
              <td className="whitespace-nowrap px-4 py-3 font-semibold">{money(i.total)}{i.amount_paid > 0 && i.status !== "paid" && <div className="text-xs text-black/50">Paid {money(i.amount_paid)}</div>}</td>
              <td className="whitespace-nowrap px-4 py-3">{i.due_date ? fmtDate(new Date(i.due_date * 1000)) : "—"}</td>
              <td className="px-4 py-3"><Badge status={i.status ?? "draft"} /></td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-end gap-1">
                  {i.hosted_invoice_url && <a className="text-xs underline" href={i.hosted_invoice_url} target="_blank" rel="noopener">View / pay link ↗</a>}
                  {i.invoice_pdf && <a className="text-xs underline" href={i.invoice_pdf} target="_blank" rel="noopener">PDF ↗</a>}
                  {(i.status === "draft" || i.status === "open") && <Act id={i.id!} op="send" label={i.status === "draft" ? "Finalize & email" : "Resend email"} />}
                  {i.status === "open" && <Act id={i.id!} op="paid" label="Mark paid (cash/check)" />}
                  {i.status === "open" && <Act id={i.id!} op="void" label="Void" danger />}
                  {i.status === "draft" && <Act id={i.id!} op="delete" label="Delete draft" danger />}
                </div>
              </td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No invoices yet.</Empty>}
      <div className="mt-4 flex justify-end gap-2">
        {after && <Link className={btnGhost} href="/admin/invoices">← Newest</Link>}
        {list.has_more && <Link className={btnGhost} href={`/admin/invoices?after=${list.data[list.data.length - 1].id}`}>Older →</Link>}
      </div>
    </>
  );
}
