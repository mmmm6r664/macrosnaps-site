"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import { SITE } from "@/lib/site";
import type Stripe from "stripe";
import { invoiceEmail } from "@/lib/emails";
import { sendMail } from "@/lib/mail";

/** Build our own invoice email from a finalized Stripe invoice. */
async function mailFor(inv: Stripe.Invoice) {
  const lines = (await stripe!.invoices.listLineItems(inv.id!, { limit: 50 })).data.map((l) => ({ label: l.description ?? "Item", amount: l.amount / 100 }));
  return invoiceEmail({
    name: inv.customer_name || inv.customer_email || "there", number: inv.number ?? "Draft", total: inv.amount_due / 100,
    due: inv.due_date ? new Date(inv.due_date * 1000) : null, memo: inv.description, lines,
    payUrl: inv.hosted_invoice_url ?? SITE.url, pdfUrl: inv.invoice_pdf,
  });
}

/** Email a finalized invoice from MacroSnaps (Resend), logged in Sent emails. */
export async function sendInvoiceEmail(id: string, by: { id: number; email: string }) {
  const inv = await stripe!.invoices.retrieve(id);
  if (!inv.customer_email || !inv.hosted_invoice_url) return { ok: false as const, error: "The invoice needs a customer email and must be finalized first." };
  const m = await mailFor(inv);
  const r = await sendMail({ to: inv.customer_email, subject: m.subject, html: m.html });
  if (r.ok) {
    await stripe!.invoices.update(id, { metadata: { ...(inv.metadata ?? {}), emailed_by_macrosnaps: new Date().toISOString() } });
    await audit(by.id, "invoice_emailed", `${id} ${inv.customer_email}`);
  }
  return r.ok ? { ok: true as const } : { ok: false as const, error: "The email couldn't be sent. Check Sent emails for details." };
}

export type PreviewS = { error?: string; ok?: string; html?: string; subject?: string; to?: string } | undefined;
/** Preview or send the MacroSnaps invoice email for an invoice (finalizes a draft only on send). */
export async function invoiceEmailAction(_: PreviewS, f: FormData): Promise<PreviewS> {
  const u = await requireUser();
  if (!stripe) return { error: "Stripe isn't connected yet." };
  const id = String(f.get("id") ?? "");
  if (!/^in_[A-Za-z0-9]+$/.test(id)) return { error: "Unknown invoice." };
  try {
    let inv = await stripe.invoices.retrieve(id);
    if (f.get("mode") !== "send") {
      const m = await mailFor(inv.status === "draft" ? { ...inv, number: inv.number ?? "(number assigned when sent)", hosted_invoice_url: inv.hosted_invoice_url ?? "#pay-link" } as Stripe.Invoice : inv);
      return { html: m.html, subject: m.subject, to: inv.customer_email ?? "" };
    }
    if (inv.status === "draft") inv = await stripe.invoices.finalizeInvoice(id);
    const r = await sendInvoiceEmail(inv.id!, u);
    revalidatePath("/admin/invoices"); revalidatePath(`/admin/invoices/${id}`);
    return r.ok ? { ok: `Emailed from MacroSnaps to ${inv.customer_email}.` } : { error: r.error };
  } catch (e) { return { error: e instanceof Error ? e.message : "Stripe error." }; }
}

export type S = { error?: string; ok?: string } | undefined;
const clip = (v: FormDataEntryValue | null, n = 200) => String(v ?? "").trim().slice(0, n);

export async function createInvoice(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  if (!stripe) return { error: "Stripe isn't connected yet." };
  const name = [f.get("firstName"), f.get("lastName")].map((v) => String(v ?? "").trim().slice(0, 60)).filter(Boolean).join(" ");
  if (!String(f.get("firstName") ?? "").trim() || !String(f.get("lastName") ?? "").trim()) return { error: "Enter both first and last name." };
  const email = clip(f.get("email")).toLowerCase();
  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { error: "Enter the customer's name and a valid email." };
  const days = Math.min(90, Math.max(0, Number(f.get("days")) || 7));
  const descs = f.getAll("desc").map((v) => clip(v, 250));
  const qtys = f.getAll("qty").map((v) => Number(v));
  const prices = f.getAll("price").map((v) => Number(String(v).replace(/[$,]/g, "")));
  const items = descs.map((d, i) => ({ d, q: Math.round(qtys[i] || 0), c: Math.round((prices[i] || 0) * 100) })).filter((x) => x.d && x.q > 0 && x.c > 0);
  if (!items.length) return { error: "Add at least one line with a description, quantity and price." };
  if (items.some((x) => x.q > 1000 || x.c > 10_000_000)) return { error: "Check the quantities and prices." };
  const send = f.get("send") === "1";
  let invoiceId: string;
  try {
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0] ?? (await stripe.customers.create({ email, name, phone: clip(f.get("phone"), 40) || undefined }));
    const inv = await stripe.invoices.create({
      customer: customer.id, collection_method: "send_invoice", days_until_due: days, auto_advance: false,
      description: clip(f.get("memo"), 500) || undefined, footer: `${SITE.name} · ${SITE.phone} · ${SITE.email}`, metadata: { created_by: u.email, source: "admin" },
    });
    for (const x of items) {
      await stripe.invoiceItems.create({ customer: customer.id, invoice: inv.id, currency: "usd", amount: x.q * x.c, description: x.q > 1 ? `${x.d} (${x.q} × $${(x.c / 100).toFixed(2)})` : x.d });
    }
    invoiceId = inv.id!;
    if (send) {
      await stripe.invoices.finalizeInvoice(invoiceId);
      const r = await sendInvoiceEmail(invoiceId, u);
      if (!r.ok) return { error: `Invoice created, but the email failed: ${r.error}` };
    }
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Stripe couldn't create the invoice." };
  }
  await audit(u.id, send ? "invoice_sent" : "invoice_draft", `${invoiceId} ${email}`);
  revalidatePath("/admin/invoices");
  redirect(`/admin/invoices/${invoiceId}?created=${send ? "sent" : "draft"}`);
}

export async function invoiceAction(f: FormData) {
  const u = await requireUser();
  if (!stripe) return;
  const id = String(f.get("id") ?? "");
  const op = String(f.get("op") ?? "");
  if (!/^in_[A-Za-z0-9]+$/.test(id)) return;
  try {
    if (op === "send") { const inv = await stripe.invoices.retrieve(id); if (inv.status === "draft") await stripe.invoices.finalizeInvoice(id); await sendInvoiceEmail(id, u); }
    else if (op === "finalize") { await stripe.invoices.finalizeInvoice(id); }
    else if (op === "void") await stripe.invoices.voidInvoice(id);
    else if (op === "delete") await stripe.invoices.del(id);
    else if (op === "paid") await stripe.invoices.pay(id, { paid_out_of_band: true });
    else return;
  } catch (e) { console.error(e); }
  await audit(u.id, `invoice_${op}`, id);
  revalidatePath("/admin/invoices"); revalidatePath(`/admin/invoices/${id}`);
}
