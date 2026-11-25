// Automatic payment reminders for open invoices: 3 days and 7 days after MacroSnaps emailed the invoice.
// Only for shoots dated after December 1, 2026 (owner, Nov 25) that are still ahead; invoices without a readable date are skipped.
import "server-only";
import type Stripe from "stripe";
import { stripe } from "@/lib/stripe";
import { emailInvoice } from "@/lib/invoiceMail";

const EVENTS_AFTER = "2026-12-01";
const DAY = 86_400_000;
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
const M = "(January|February|March|April|May|June|July|August|September|October|November|December)";

/** First event date in the invoice note/lines: "May 14, 2027", "December 4–5, 2026", or just "January 2027" / "mid-October 2027" (→ the 1st). */
export function eventDate(text: string): string | null {
  const iso = (y: string, mon: string, d: string | number) => `${y}-${String(MONTHS.indexOf(mon.toLowerCase()) + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
  const full = text.match(new RegExp(`\\b${M}\\s+(\\d{1,2})(?:\\s*[–—-]\\s*\\d{1,2})?,?\\s+(20\\d{2})\\b`, "i"));
  if (full) return iso(full[3], full[1], full[2]);
  const month = text.match(new RegExp(`\\b${M},?\\s+(20\\d{2})\\b`, "i"));
  return month ? iso(month[2], month[1], 1) : null;
}

/** Which reminder (1 or 2) is due now for this invoice, or 0. */
export function reminderDue(inv: Stripe.Invoice, text: string, now = Date.now()): 0 | 1 | 2 {
  const md = inv.metadata ?? {};
  if (inv.status !== "open" || !md.emailed_by_macrosnaps || md.reminders === "off" || !inv.customer_email) return 0;
  const date = eventDate(text);
  const today = new Date(now).toLocaleDateString("en-CA", { timeZone: "America/New_York" });
  if (!date || date <= EVENTS_AFTER || date <= today) return 0;
  const sent = Date.parse(md.emailed_by_macrosnaps), n = Number(md.reminders_sent || 0);
  const last = md.reminded_at ? Date.parse(md.reminded_at) : 0;
  if (n === 0 && now - sent >= 3 * DAY) return 1;
  // The second one never lands right after the first (older invoices catching up).
  if (n === 1 && now - sent >= 7 * DAY && now - last >= 2 * DAY) return 2;
  return 0;
}

export async function runInvoiceReminders() {
  const out = { sent: 0, failed: 0 };
  if (!stripe) return out;
  const since = Math.floor((Date.now() - 60 * DAY) / 1000);
  for await (const inv of stripe.invoices.list({ status: "open", created: { gte: since }, limit: 100 })) {
    const text = [inv.description, ...(inv.lines?.data ?? []).map((l) => l.description)].filter(Boolean).join(" \n ");
    if (!reminderDue(inv, text)) continue;
    const r = await emailInvoice(inv.id!, null).catch(() => ({ ok: false as const }));
    if (r.ok) out.sent++; else out.failed++;
  }
  return out;
}
