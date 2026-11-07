// Support tickets for clients, photographers/videographers and website visitors, with email automations on every step.
import "server-only";
import { q, db, audit } from "@/lib/db";
import { sendMail, TEAM_INBOX } from "@/lib/mail";
import { ORIGIN } from "@/lib/emailTemplate";
import { ticketOpened, ticketUpdated, ticketTeam, type TicketMail } from "@/lib/emails";
import { signRef, verifyRef } from "@/lib/automations";

export const STATUSES = ["open", "in_progress", "waiting", "resolved", "closed"] as const;
export type Status = (typeof STATUSES)[number];
export const STATUS_LABEL: Record<string, string> = { open: "Open", in_progress: "In progress", waiting: "Waiting on customer", resolved: "Resolved", closed: "Closed" };
export const CATEGORIES = ["General question", "Booking or scheduling", "Change or cancel a booking", "Payment or invoice", "My photos or video", "Shoot assignment", "Payout or tax", "Website or account problem", "Other"];

export type Ticket = {
  id: number; source: string; user_id: number | null; client_id: number | null; name: string; email: string; phone: string | null; order_ref: string | null;
  category: string; subject: string; status: string; priority: string; created_at: Date; updated_at: Date; resolved_at: Date | null;
};
export type Message = { id: number; author: string; author_name: string; body: string; created_at: Date };

export const ticketNo = (id: number) => `MS-T${id}`;
/** Private link to the ticket for the person who opened it (works without logging in). */
export const signedPath = (id: number) => `/support/ticket/${id}?k=${signRef(`t${id}`, "ticket")}`;
export const ticketUrl = (id: number) => `${ORIGIN}${signedPath(id)}`;
export const verifyTicketKey = (id: number, k: string) => verifyRef(`t${id}`, "ticket", k);
const adminUrl = (id: number) => `${ORIGIN}/admin/support/${id}`;
const mail = (t: Ticket): TicketMail => ({ no: ticketNo(t.id), name: t.name, subject: t.subject, category: t.category, orderRef: t.order_ref, url: ticketUrl(t.id) });

export async function getTicket(id: number) {
  return (await q<Ticket[]>`select * from tickets where id = ${id}`)[0] ?? null;
}
export async function messagesFor(id: number, includeNotes = false) {
  const sql = await db();
  return sql<Message[]>`select id, author, author_name, body, created_at from ticket_messages where ticket_id = ${id} ${includeNotes ? sql`` : sql`and author <> 'note'`} order by id`;
}

/** Opens a ticket and sends the confirmation (to them) and the alert (to the team). */
export async function createTicket(o: { source: "client" | "photographer" | "guest"; userId?: number | null; clientId?: number | null; name: string; email: string; phone?: string | null; orderRef?: string | null; category: string; subject: string; body: string }) {
  const [t] = await q<Ticket[]>`
    insert into tickets (source, user_id, client_id, name, email, phone, order_ref, category, subject)
    values (${o.source}, ${o.userId ?? null}, ${o.clientId ?? null}, ${o.name}, ${o.email.toLowerCase()}, ${o.phone ?? null}, ${o.orderRef ?? null}, ${o.category}, ${o.subject}) returning *`;
  await q`insert into ticket_messages (ticket_id, author, author_name, body) values (${t.id}, 'customer', ${o.name}, ${o.body})`;
  const m = mail(t);
  const toThem = ticketOpened(m, o.body);
  await sendMail({ to: t.email, subject: toThem.subject, html: toThem.html });
  const toTeam = ticketTeam("new", { ...m, url: adminUrl(t.id), email: t.email, source: t.source, phone: t.phone }, o.body);
  await sendMail({ to: TEAM_INBOX, replyTo: t.email, subject: toTeam.subject, html: toTeam.html });
  await q`insert into notifications (user_id, title, body, link) values (null, ${`New ticket ${ticketNo(t.id)}: ${o.subject}`.slice(0, 200)}, ${o.body.slice(0, 2000)}, ${`/admin/support/${t.id}`})`.catch(() => null);
  return t;
}

/** The customer adds a reply (reopens a resolved ticket) and the team is emailed. */
export async function customerReply(id: number, body: string) {
  const t = await getTicket(id);
  if (!t) return { error: "Ticket not found." };
  if (t.status === "closed") return { error: "This ticket is closed. Please open a new request." };
  await q`insert into ticket_messages (ticket_id, author, author_name, body) values (${id}, 'customer', ${t.name}, ${body})`;
  await q`update tickets set status = case when status in ('resolved', 'waiting') then 'open' else status end, resolved_at = null, updated_at = now() where id = ${id}`;
  const toTeam = ticketTeam("reply", { ...mail(t), url: adminUrl(id), email: t.email, source: t.source, phone: t.phone }, body);
  await sendMail({ to: TEAM_INBOX, replyTo: t.email, subject: toTeam.subject, html: toTeam.html });
  await q`insert into notifications (user_id, title, body, link) values (null, ${`Reply on ${ticketNo(id)}: ${t.subject}`.slice(0, 200)}, ${body.slice(0, 2000)}, ${`/admin/support/${id}`})`.catch(() => null);
  if (t.user_id) await q`insert into notifications (user_id, title, body, link) values (${t.user_id}, ${`Your reply on ${ticketNo(id)} was sent`}, ${""}, ${"/staff/support"})`.catch(() => null);
  return { ok: true as const };
}

/** The team replies and/or changes status. The customer is emailed for a reply or any status change (not for internal notes). */
export async function teamUpdate(id: number, o: { by: { id: number; name: string }; reply?: string; note?: string; status?: string }) {
  const t = await getTicket(id);
  if (!t) return { error: "Ticket not found." };
  const status = o.status && (STATUSES as readonly string[]).includes(o.status) ? o.status : t.status;
  const reply = o.reply?.trim() || null;
  if (o.note?.trim()) await q`insert into ticket_messages (ticket_id, author, author_name, body) values (${id}, 'note', ${o.by.name}, ${o.note.trim()})`;
  if (reply) await q`insert into ticket_messages (ticket_id, author, author_name, body) values (${id}, 'team', ${"MacroSnaps"}, ${reply})`;
  // A reply on an open ticket moves it to "in progress" unless a status was chosen.
  const next = reply && status === t.status && t.status === "open" ? "in_progress" : status;
  await q`update tickets set status = ${next}, updated_at = now(), resolved_at = ${next === "resolved" ? new Date() : null} where id = ${id}`;
  const changed = next !== t.status;
  let emailed = false;
  if ((reply || changed) && next !== "closed") {
    const m = ticketUpdated(mail({ ...t, status: next }), next, reply);
    emailed = (await sendMail({ to: t.email, subject: m.subject, html: m.html })).ok;
  }
  if (t.user_id && (reply || changed)) await q`insert into notifications (user_id, title, body, link) values (${t.user_id}, ${`Update on ${ticketNo(id)}: ${STATUS_LABEL[next] ?? next}`}, ${(reply ?? "").slice(0, 300)}, ${"/staff/support"})`.catch(() => null);
  await audit(o.by.id, "ticket_update", `${ticketNo(id)} ${t.status}→${next}${reply ? " +reply" : ""}${o.note ? " +note" : ""}`);
  return { ok: true as const, emailed, status: next };
}

export async function ticketsFor(o: { email?: string; userId?: number }) {
  const sql = await db();
  return sql<Ticket[]>`select * from tickets where ${o.userId ? sql`user_id = ${o.userId}` : sql`lower(email) = ${(o.email ?? "").toLowerCase()}`} order by updated_at desc limit 100`;
}
