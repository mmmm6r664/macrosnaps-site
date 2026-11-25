// Invoice emails (new invoice + payment reminders), sent from MacroSnaps via Resend. Shared by admin actions, MCP and the daily cron.
import "server-only";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { audit } from "@/lib/db";
import { SITE } from "@/lib/site";
import { invoiceEmail } from "@/lib/emails";
import { sendMail } from "@/lib/mail";
import { invoiceLink } from "@/lib/invoiceLink";

/** Build our own invoice email from a finalized Stripe invoice. */
/** An open invoice MacroSnaps already emailed gets the reminder version of the email. */
export const isReminder = (inv: Stripe.Invoice) => inv.status === "open" && !!inv.metadata?.emailed_by_macrosnaps;

export async function mailFor(inv: Stripe.Invoice, reminder = false) {
  const lines = (await stripe!.invoices.listLineItems(inv.id!, { limit: 50 })).data.slice().reverse().map((l) => ({ label: l.description ?? "Item", amount: l.amount / 100 }));
  return invoiceEmail({
    name: inv.metadata?.contact_name || inv.customer_name || inv.customer_email || "there",
    billTo: inv.customer_address?.line1 ? [inv.customer_name, inv.customer_address.line1, inv.customer_address.line2, [inv.customer_address.city, [inv.customer_address.state, inv.customer_address.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ")].filter(Boolean).join("\n") : null, number: inv.number ?? "Draft", total: inv.amount_due / 100,
    due: inv.due_date ? new Date(inv.due_date * 1000) : null, memo: inv.description, lines,
    payUrl: inv.hosted_invoice_url ? invoiceLink(inv.id!) : SITE.url, pdfUrl: inv.invoice_pdf, reminder,
  });
}

/** Email a finalized invoice from MacroSnaps (Resend), logged in Sent emails. */
export async function emailInvoice(id: string, byUserId: number | null) {
  const inv = await stripe!.invoices.retrieve(id);
  if (!inv.customer_email || !inv.hosted_invoice_url) return { ok: false as const, error: "The invoice needs a customer email and must be finalized first." };
  const reminder = isReminder(inv);
  const m = await mailFor(inv, reminder);
  // A copy goes to info@ so every client email also shows up in Gmail.
  const r = await sendMail({ to: inv.customer_email, subject: m.subject, html: m.html, bcc: SITE.email });
  if (r.ok) {
    const now = new Date().toISOString();
    const md = inv.metadata ?? {};
    await stripe!.invoices.update(id, { metadata: reminder ? { ...md, reminded_at: now, reminders_sent: String(Number(md.reminders_sent || 0) + 1) } : { ...md, emailed_by_macrosnaps: now } });
    await audit(byUserId, reminder ? "invoice_reminder" : "invoice_emailed", `${id} ${inv.customer_email}`);
  }
  return r.ok ? { ok: true as const, reminder } : { ok: false as const, error: "The email couldn't be sent. Check Sent emails for details." };
}

