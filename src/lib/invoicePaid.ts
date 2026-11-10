import type Stripe from "stripe";
import { stripe } from "./stripe";
import { sendMail, TEAM_INBOX } from "./mail";
import { SITE } from "./site";
import { ORIGIN } from "./emailTemplate";
import { invoiceLink } from "./invoiceLink";
import { invoicePaidTeam, invoiceReceipt, type PaidInvoice } from "./emails";

const METHOD: Record<string, string> = { card: "Card", us_bank_account: "Bank transfer (ACH)", link: "Card (Link)", cashapp: "Cash App Pay", ach_credit_transfer: "Bank transfer", customer_balance: "Bank transfer" };

async function details(inv: Stripe.Invoice): Promise<PaidInvoice> {
  let method: string | null = null; let receiptUrl: string | null = null;
  try {
    const full = await stripe!.invoices.retrieve(inv.id!, { expand: ["charge", "payment_intent.latest_charge"] });
    const pi = typeof full.payment_intent === "object" ? full.payment_intent : null;
    const ch = (typeof full.charge === "object" && full.charge) || (pi && typeof pi.latest_charge === "object" ? pi.latest_charge : null);
    if (ch) { method = METHOD[ch.payment_method_details?.type ?? ""] ?? ch.payment_method_details?.type ?? null; receiptUrl = ch.receipt_url ?? null;
      if (ch.payment_method_details?.card?.last4) method = `${ch.payment_method_details.card.brand?.toUpperCase() ?? "Card"} ending ${ch.payment_method_details.card.last4}`; }
  } catch (e) { console.error("[invoice paid] payment lookup", e); }
  const a = inv.customer_address;
  return {
    name: inv.metadata?.contact_name || inv.customer_name || inv.customer_email || "there",
    billTo: a?.line1 ? [inv.customer_name, a.line1, a.line2, [a.city, [a.state, a.postal_code].filter(Boolean).join(" ")].filter(Boolean).join(", ")].filter(Boolean).join("\n") : inv.customer_name,
    number: inv.number ?? inv.id!, amount: inv.amount_paid / 100,
    paidAt: new Date(((inv.status_transitions?.paid_at ?? Math.floor(Date.now() / 1000))) * 1000),
    method, memo: inv.description, viewUrl: invoiceLink(inv.id!), receiptUrl, adminUrl: `${ORIGIN}/admin/invoices/${inv.id}`,
  };
}

/** Email the team and/or the client about a paid invoice. Remembers what was sent (invoice metadata) so nothing goes twice. */
export async function notifyInvoicePaid(id: string, opts: { team?: boolean; client?: boolean } = { team: true, client: true }) {
  if (!stripe) return { team: false, client: false };
  const inv = await stripe.invoices.retrieve(id);
  if (inv.status !== "paid") return { team: false, client: false };
  const d = await details(inv);
  const md = { ...(inv.metadata ?? {}) };
  let team = false, client = false;
  if (opts.team && !md.paid_team_notified) {
    const m = invoicePaidTeam(d);
    team = (await sendMail({ to: TEAM_INBOX, replyTo: inv.customer_email || undefined, subject: m.subject, html: m.html })).ok;
    if (team) md.paid_team_notified = new Date().toISOString();
  }
  if (opts.client && !md.paid_client_notified && inv.customer_email) {
    const m = invoiceReceipt(d);
    client = (await sendMail({ to: inv.customer_email, replyTo: SITE.email, subject: m.subject, html: m.html })).ok;
    if (client) md.paid_client_notified = new Date().toISOString();
  }
  if (team || client) await stripe.invoices.update(id, { metadata: md });
  return { team, client };
}
