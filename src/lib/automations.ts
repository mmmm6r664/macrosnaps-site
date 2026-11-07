// Email automations: abandoned-booking reminders (3), new-subscriber welcome series (3) and post-delivery review requests.
// Reminder #1 is triggered by Stripe's checkout.session.expired webhook (about an hour after someone leaves checkout);
// everything else runs from the daily cron (/api/cron/newsletters).
import "server-only";
import { createHmac, timingSafeEqual } from "crypto";
import { q, hasDb } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { ORIGIN } from "@/lib/emailTemplate";
import { abandoned1, abandoned2, abandoned3, nurture1, nurture2, nurture3, feedbackRequest } from "@/lib/emails";
import { unsubUrl, listUnsubscribe } from "@/lib/newsletter";

const SECRET = () => process.env.CRON_SECRET || process.env.ADMIN_SETUP_CODE || "dev-only-secret";
export const signRef = (ref: string, purpose: string) => createHmac("sha256", SECRET()).update(`${purpose}:${ref}`).digest("base64url").slice(0, 32);
export function verifyRef(ref: string, purpose: string, token: string) {
  const a = Buffer.from(signRef(ref, purpose)), b = Buffer.from(String(token));
  return a.length === b.length && timingSafeEqual(a, b);
}
export const resumeUrl = (ref: string) => `${ORIGIN}/book/resume?ref=${encodeURIComponent(ref)}&t=${signRef(ref, "resume")}`;
export const stopUrl = (ref: string) => `${ORIGIN}/api/reminders/stop?ref=${encodeURIComponent(ref)}&t=${signRef(ref, "stop")}`;

type Pending = { id: number; ref: string; email: string; customer_name: string; service_name: string; schedule: { date: string; start: string; end: string }[]; city: string | null; lines: { label: string; amount: number }[]; total_cents: number; reminders_sent: number };
const t12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const when = (s: Pending["schedule"]) => s.map((x) => `${new Date(`${x.date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", timeZone: "UTC" })}${x.start ? `, ${t12(x.start)}–${t12(x.end)}` : ""}`).join("; ");

/** Sends abandoned-booking reminder n (1–3) and records it. Skips if the person has since paid for any booking. */
export async function sendReminder(b: Pending, n: 1 | 2 | 3) {
  const paidSince = await q<{ n: number }[]>`select count(*)::int as n from bookings where lower(email) = ${b.email.toLowerCase()} and status in ('paid','confirmed','completed') and created_at > (select created_at from bookings where id = ${b.id})`;
  if (paidSince[0].n > 0) { await q`update bookings set reminders_stopped = true where id = ${b.id}`; return false; }
  // Claim the step first so two runs can never send the same reminder twice.
  const claimed = await q<{ id: number }[]>`update bookings set reminders_sent = ${n}, last_reminder_at = now() where id = ${b.id} and reminders_sent = ${n - 1} and status = 'pending_payment' and not reminders_stopped returning id`;
  if (!claimed.length) return false;
  const a = { firstName: b.customer_name, service: b.service_name, schedule: when(b.schedule), city: b.city ?? undefined, lines: b.lines, total: `$${(b.total_cents / 100).toLocaleString("en-US")} USD`, resumeUrl: resumeUrl(b.ref), stopUrl: stopUrl(b.ref) };
  const m = n === 1 ? abandoned1(a) : n === 2 ? abandoned2(a) : abandoned3(a);
  const r = await sendMail({ to: b.email, subject: m.subject, html: m.html, headers: { "List-Unsubscribe": `<${stopUrl(b.ref)}>`, "List-Unsubscribe-Post": "List-Unsubscribe=One-Click" } });
  return r.ok;
}


/** Webhook: a Stripe checkout page expired without payment → reminder #1 (only for the booking's current session). */
export async function onCheckoutExpired(sessionId: string) {
  if (!hasDb) return;
  const rows = await q<Pending[]>`select id, ref, email, customer_name, service_name, schedule, city, lines, total_cents, reminders_sent from bookings
    where stripe_session_id = ${sessionId} and status = 'pending_payment' and reminders_sent = 0 and not reminders_stopped and first_date >= (now() at time zone 'America/New_York')::date + 2`;
  if (rows[0]) await sendReminder(rows[0], 1);
}

/** Daily: abandoned-booking reminders, welcome series and review requests. Returns counts for the cron log. */
export async function runDailyAutomations() {
  const out = { reminders: 0, nurture: 0, feedback: 0 };
  if (!hasDb) return out;
  // Abandoned bookings from the last 14 days whose date is still at least 2 days away.
  const pending = await q<(Pending & { due: number })[]>`
    select id, ref, email, customer_name, service_name, schedule, city, lines, total_cents, reminders_sent,
      case
        when reminders_sent = 0 and created_at < now() - interval '2 hours' then 1
        when reminders_sent = 1 and last_reminder_at < now() - interval '20 hours' then 2
        when reminders_sent = 2 and last_reminder_at < now() - interval '44 hours' then 3
        else 0 end as due
    from bookings
    where status = 'pending_payment' and not reminders_stopped and reminders_sent < 3
      and created_at > now() - interval '14 days'
      and first_date >= (now() at time zone 'America/New_York')::date + 2`;
  for (const b of pending) if (b.due && (await sendReminder(b, b.due as 1 | 2 | 3))) out.reminders++;

  // Welcome series: #1 is sent on signup (or here if that failed), #2 after 2 days, #3 three days after that.
  const subs = await q<{ id: number; email: string; name: string; token: string; nurture_step: number }[]>`
    select id, email, name, token, nurture_step from subscribers where status = 'subscribed' and nurture_step < 3 and (
      nurture_step = 0 or (nurture_step = 1 and nurture_at < now() - interval '2 days') or (nurture_step = 2 and nurture_at < now() - interval '3 days'))`;
  for (const s of subs) if (await sendNurture(s, (s.nurture_step + 1) as 1 | 2 | 3)) out.nurture++;

  // Review requests: 3 days after a gallery is published, if the client hasn't rated yet.
  const galleries = await q<{ gid: number; ref: string; email: string; customer_name: string; service_name: string }[]>`
    select g.id as gid, b.ref, b.email, b.customer_name, b.service_name from galleries g join bookings b on b.id = g.booking_id
    where g.status = 'published' and g.published_at < now() - interval '3 days' and g.published_at > now() - interval '30 days'
      and g.feedback_asked_at is null and not exists (select 1 from feedback f where f.booking_id = b.id)`;
  for (const g of galleries) {
    const claimed = await q<{ id: number }[]>`update galleries set feedback_asked_at = now() where id = ${g.gid} and feedback_asked_at is null returning id`;
    if (!claimed.length) continue;
    const m = feedbackRequest(g.customer_name, g.service_name, `${ORIGIN}/account/orders/${g.ref}`);
    if ((await sendMail({ to: g.email, subject: m.subject, html: m.html })).ok) out.feedback++;
  }
  // Keep the email log light: drop the stored copy of emails older than 180 days (the log line stays).
  await q`update email_log set html = null where html is not null and created_at < now() - interval '180 days'`.catch(() => null);
  return out;
}

/** Sends welcome-series email n to a subscriber and records the step (claimed first, so never twice). */
export async function sendNurture(s: { id: number; email: string; name: string; token: string }, n: 1 | 2 | 3) {
  const claimed = await q<{ id: number }[]>`update subscribers set nurture_step = ${n}, nurture_at = now() where id = ${s.id} and nurture_step = ${n - 1} and status = 'subscribed' returning id`;
  if (!claimed.length) return false;
  const u = unsubUrl(s.token);
  const m = n === 1 ? nurture1(s.name, u) : n === 2 ? nurture2(s.name, u) : nurture3(s.name, u);
  return (await sendMail({ to: s.email, subject: m.subject, html: m.html, headers: listUnsubscribe(s.token) })).ok;
}

/** New subscriber: start the welcome series right away. */
export async function startNurture(email: string) {
  if (!hasDb) return;
  const s = await q<{ id: number; email: string; name: string; token: string }[]>`select id, email, name, token from subscribers where email = ${email.toLowerCase()} and nurture_step = 0 and status = 'subscribed'`;
  if (s[0]) await sendNurture(s[0], 1).catch((e) => console.error("[nurture]", e));
}
