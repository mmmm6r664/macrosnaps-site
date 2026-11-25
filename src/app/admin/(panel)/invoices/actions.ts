"use server";
import { phoneForEmail } from "@/lib/phoneLookup";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { stripe } from "@/lib/stripe";
import { requireUser } from "@/lib/auth";
import { audit } from "@/lib/db";
import { SITE } from "@/lib/site";
import type Stripe from "stripe";
import { emailInvoice, isReminder, mailFor } from "@/lib/invoiceMail";

/** Email a finalized invoice from MacroSnaps (a payment reminder if it was already emailed and is still open). */
export async function sendInvoiceEmail(id: string, by: { id: number; email: string }) {
  await requireUser();
  return emailInvoice(id, by.id);
}

export type PreviewS = { error?: string; ok?: string; html?: string; subject?: string; to?: string; reminder?: boolean } | undefined;
/** Preview or send the MacroSnaps invoice email for an invoice (finalizes a draft only on send). */
export async function invoiceEmailAction(_: PreviewS, f: FormData): Promise<PreviewS> {
  const u = await requireUser();
  if (!stripe) return { error: "Stripe isn't connected yet." };
  const id = String(f.get("id") ?? "");
  if (!/^in_[A-Za-z0-9]+$/.test(id)) return { error: "Unknown invoice." };
  try {
    let inv = await stripe.invoices.retrieve(id);
    if (f.get("mode") !== "send") {
      const m = await mailFor(inv.status === "draft" ? { ...inv, number: inv.number ?? "(number assigned when sent)", hosted_invoice_url: inv.hosted_invoice_url ?? `${SITE.url}/admin/invoices/${id}?draft-preview=1` } as Stripe.Invoice : inv, isReminder(inv));
      return { html: m.html, subject: m.subject, to: inv.customer_email ?? "", reminder: isReminder(inv) };
    }
    if (inv.status === "draft") inv = await stripe.invoices.finalizeInvoice(id);
    const r = await sendInvoiceEmail(inv.id!, u);
    revalidatePath("/admin/invoices"); revalidatePath(`/admin/invoices/${id}`);
    return r.ok ? { ok: `${r.reminder ? "Payment reminder emailed" : "Emailed"} from MacroSnaps to ${inv.customer_email}.` } : { error: r.error };
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
  const rawDays = String(f.get("days") ?? "").trim();
  // 0 = due today (an empty field means the usual 7 days).
  const days = Math.min(90, Math.max(0, rawDays === "" || !Number.isFinite(Number(rawDays)) ? 7 : Math.round(Number(rawDays))));
  const descs = f.getAll("desc").map((v) => clip(v, 250));
  const qtys = f.getAll("qty").map((v) => Number(v));
  const prices = f.getAll("price").map((v) => Number(String(v).replace(/[$,]/g, "")));
  // A negative price is a discount line (e.g. "Corporate discount (10%)  -250").
  const items = descs.map((d, i) => ({ d, q: Math.round(qtys[i] || 0), c: Math.round((prices[i] || 0) * 100) })).filter((x) => x.d && x.q > 0 && x.c !== 0);
  if (!items.some((x) => x.c > 0)) return { error: "Add at least one line with a description, quantity and price." };
  if (items.some((x) => x.q > 1000 || Math.abs(x.c) > 10_000_000)) return { error: "Check the quantities and prices." };
  if (items.reduce((t, x) => t + x.q * x.c, 0) <= 0) return { error: "Discounts can't be more than the invoice total." };
  const send = f.get("send") === "1";
  let invoiceId: string;
  try {
    const company = clip(f.get("company"), 200);
    const line1 = clip(f.get("line1"), 200);
    const address = line1 ? { line1, line2: clip(f.get("line2"), 200) || undefined, city: clip(f.get("city"), 100) || undefined, state: clip(f.get("state"), 60) || undefined, postal_code: clip(f.get("zip"), 20) || undefined, country: "US" } : undefined;
    const billName = company || name;
    // Keep the client's phone on the invoice so they're easy to reach; fall back to what we have on file.
    const phone = clip(f.get("phone"), 40) || (await phoneForEmail(email)) || "";
    // The invoice copies the customer's name and address when it's finalized, so keep them current.
    const existing = await stripe.customers.list({ email, limit: 1 });
    const customer = existing.data[0]
      ? await stripe.customers.update(existing.data[0].id, { name: billName, ...(address ? { address } : {}), ...(phone ? { phone } : {}) })
      : await stripe.customers.create({ email, name: billName, address, phone: phone || undefined });
    const inv = await stripe.invoices.create({
      customer: customer.id, collection_method: "send_invoice", days_until_due: days, auto_advance: false,
      description: clip(f.get("memo"), 500) || undefined, footer: `${SITE.name} · ${SITE.phone} · ${SITE.email}`,
      custom_fields: company ? [{ name: "Attn", value: name.slice(0, 140) }] : undefined,
      metadata: { created_by: u.email, source: "admin", contact_name: name, ...(phone ? { phone } : {}) },
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

/** Paid invoice: send the team alert and/or the client receipt by hand (e.g. for payments made before the webhook handled invoices). */
export async function invoicePaidAction(f: FormData) {
  const u = await requireUser();
  const id = String(f.get("id") ?? "");
  if (!/^in_[A-Za-z0-9]+$/.test(id)) return;
  const which = String(f.get("which") ?? "");
  const { notifyInvoicePaid } = await import("@/lib/invoicePaid");
  const r = await notifyInvoicePaid(id, { team: which === "team", client: which === "client" });
  await audit(u.id, "invoice_paid_notice", `${id} team=${r.team} client=${r.client}`);
  revalidatePath(`/admin/invoices/${id}`);
}
