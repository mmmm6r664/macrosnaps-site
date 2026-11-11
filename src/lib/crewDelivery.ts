// After each shoot: ask every assigned photographer/videographer for the Google Drive link (due within 24 hours),
// remind them once, and alert the team if it's overdue. Runs hourly from Vercel cron.
import "server-only";
import { q, hasDb, audit } from "@/lib/db";
import { sendMail, TEAM_INBOX } from "@/lib/mail";
import { ORIGIN } from "@/lib/emailTemplate";
import { crewDriveRequest, crewDriveTeam } from "@/lib/emails";
import { signRef, verifyRef } from "@/lib/automations";
import { resolveCity } from "@/lib/geo";

type Session = { date: string; start: string; end: string; venue?: string };
type Row = {
  booking_id: number; user_id: number; ref: string; service_name: string; customer_name: string; city: string | null; venue_address: string | null;
  schedule: Session[]; name: string; email: string; drive_asked_at: Date | null; drive_reminded_at: Date | null;
};

const HOUR = 3600_000;
export const deliverUrl = (bookingId: number, userId: number) => `${ORIGIN}/deliver?b=${bookingId}&u=${userId}&t=${signRef(`${bookingId}.${userId}`, "deliver")}`;
export const verifyDeliver = (b: number, u: number, t: string) => verifyRef(`${b}.${u}`, "deliver", t);

/** The event's time zone, from the city's longitude (US/Canada). Defaults to Eastern. */
export function zoneFor(city: string | null) {
  const c = city ? resolveCity(city) : undefined;
  const lng = c?.lng;
  if (lng === undefined) {
    // Smaller towns aren't in the city list: go by the state (or province) after the comma.
    const st = (city ?? "").split(",").pop()?.trim().toUpperCase().slice(0, 2) ?? "";
    if (["CA", "WA", "OR", "NV", "BC"].includes(st)) return "America/Los_Angeles";
    if (["AZ"].includes(st)) return "America/Phoenix";
    if (["CO", "UT", "NM", "MT", "WY", "ID", "AB"].includes(st)) return "America/Denver";
    if (["TX", "IL", "MN", "WI", "IA", "MO", "AR", "LA", "MS", "AL", "OK", "KS", "NE", "SD", "ND", "TN", "MB", "SK"].includes(st)) return "America/Chicago";
    if (st === "AK") return "America/Anchorage";
    if (st === "HI") return "Pacific/Honolulu";
    return "America/New_York";
  }
  if (lng > -87) return "America/New_York";
  if (lng > -101) return "America/Chicago";
  if (lng > -115) return "America/Denver";
  return "America/Los_Angeles";
}

/** Local wall-clock date + time in a time zone → the real instant. */
function zoned(date: string, time: string, tz: string) {
  const guess = new Date(`${date}T${time || "23:00"}:00Z`);
  const parts = Object.fromEntries(new Intl.DateTimeFormat("en-US", { timeZone: tz, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit" }).formatToParts(guess).map((p) => [p.type, p.value]));
  const asLocal = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute);
  return new Date(guess.getTime() - (asLocal - guess.getTime()));
}

/** When the last session of the booking ends. An end time before the start (e.g. 6 PM–1 AM) means the next day. */
export function shootEnd(schedule: Session[], tz: string): Date | null {
  const last = [...schedule].filter((s) => s.date).sort((a, b) => `${a.date}${a.end}`.localeCompare(`${b.date}${b.end}`)).pop();
  if (!last) return null;
  const end = zoned(last.date, last.end, tz);
  if (last.start && last.end && last.end < last.start) end.setTime(end.getTime() + 24 * HOUR);
  return end;
}

const fmt = (d: Date, tz: string) => d.toLocaleString("en-US", { timeZone: tz, weekday: "short", month: "short", day: "numeric", hour: "numeric", minute: "2-digit", timeZoneName: "short" });
const t12 = (t: string) => { const [h, m] = t.split(":").map(Number); return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h < 12 ? "AM" : "PM"}`; };
const whenText = (s: Session[]) => s.map((x) => `${new Date(`${x.date}T12:00:00Z`).toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric", timeZone: "UTC" })}${x.start ? `, ${t12(x.start)}–${t12(x.end)}` : ""}`).join("; ");

function shootFor(r: Row, deadline: Date, tz: string) {
  return { name: r.name, service: r.service_name, ref: r.ref, order: r.ref, folder: `${r.ref} - ${r.customer_name}`, client: r.customer_name, when: whenText(r.schedule), venue: r.venue_address || r.schedule.find((s) => s.venue)?.venue || r.city || "", deadline: fmt(deadline, tz), url: deliverUrl(r.booking_id, r.user_id) };
}

export async function runCrewDelivery(now = new Date()) {
  const out = { asked: 0, reminded: 0, overdue: 0 };
  if (!hasDb) return out;
  const rows = await q<Row[]>`
    select c.booking_id, c.user_id, b.ref, b.service_name, b.customer_name, b.city, b.venue_address, b.schedule, u.name, u.email, c.drive_asked_at, c.drive_reminded_at
    from crew_assignments c join bookings b on b.id = c.booking_id join users u on u.id = c.user_id
    where c.drive_link is null and c.drive_overdue_at is null and u.active
      and b.status in ('paid', 'confirmed', 'completed', 'partially_refunded')
      and b.first_date between (now() - interval '20 days')::date and (now() + interval '1 day')::date`;
  for (const r of rows) {
    const tz = zoneFor(r.city);
    const end = shootEnd(r.schedule ?? [], tz);
    if (!end || now.getTime() < end.getTime() + HOUR) continue; // ~1 hour after the shoot ends
    const deadline = new Date(end.getTime() + 24 * HOUR);
    const since = now.getTime() - end.getTime();
    if (!r.drive_asked_at) {
      if (since > 4 * 24 * HOUR) continue; // assigned long after the fact: don't send a stale request
      const claimed = await q<{ booking_id: number }[]>`update crew_assignments set drive_asked_at = now() where booking_id = ${r.booking_id} and user_id = ${r.user_id} and drive_asked_at is null returning booking_id`;
      if (!claimed.length) continue;
      const m = crewDriveRequest(shootFor(r, deadline, tz));
      if ((await sendMail({ to: r.email, subject: m.subject, html: m.html })).ok) out.asked++;
    } else if (!r.drive_reminded_at && since >= 18 * HOUR) { // 6 hours before the 24-hour deadline
      const claimed = await q<{ booking_id: number }[]>`update crew_assignments set drive_reminded_at = now() where booking_id = ${r.booking_id} and user_id = ${r.user_id} and drive_reminded_at is null returning booking_id`;
      if (!claimed.length) continue;
      const m = crewDriveRequest(shootFor(r, deadline, tz), true);
      if ((await sendMail({ to: r.email, subject: m.subject, html: m.html })).ok) out.reminded++;
    } else if (r.drive_reminded_at && since >= 25 * HOUR) {
      const claimed = await q<{ booking_id: number }[]>`update crew_assignments set drive_overdue_at = now() where booking_id = ${r.booking_id} and user_id = ${r.user_id} and drive_overdue_at is null returning booking_id`;
      if (!claimed.length) continue;
      const m = crewDriveTeam("overdue", { name: r.name, email: r.email, ref: r.ref, service: r.service_name, client: r.customer_name, adminUrl: `${ORIGIN}/admin/bookings/${r.booking_id}` });
      await sendMail({ to: TEAM_INBOX, replyTo: r.email, subject: m.subject, html: m.html });
      out.overdue++;
    }
  }
  const asg = await runAssignments(now);
  const extra = await runFileRequests(now);
  return { ...out, assignmentsAsked: asg, requestReminders: extra.reminded, requestsOverdue: extra.overdue };
}

/** Saves the link a crew member sent and tells the team. Returns false for a bad link or token. */
export async function saveDriveLink(bookingId: number, userId: number, token: string, link: string) {
  if (!verifyDeliver(bookingId, userId, token)) return { error: "This link isn't valid. Please use the button in your email." };
  const url = link.trim();
  if (!/^https:\/\/\S+\.\S+/.test(url) || url.length > 1000) return { error: "Please paste the full link, starting with https://" };
  const [r] = await q<(Row & { drive_link: string | null })[]>`
    update crew_assignments c set drive_link = ${url}, drive_link_at = now() from bookings b, users u
    where c.booking_id = ${bookingId} and c.user_id = ${userId} and b.id = c.booking_id and u.id = c.user_id
    returning b.ref, b.service_name, b.customer_name, u.name, u.email`;
  if (!r) return { error: "We couldn't find this shoot. Please reply to the email instead." };
  await audit(userId, "crew_drive_link", `${r.ref}`);
  const m = crewDriveTeam("received", { name: r.name, email: r.email, ref: r.ref, service: r.service_name, client: r.customer_name, link: url, adminUrl: `${ORIGIN}/admin/bookings/${bookingId}` });
  await sendMail({ to: TEAM_INBOX, replyTo: r.email, subject: m.subject, html: m.html });
  await q`insert into notifications (user_id, title, body, link) values (null, ${`${r.name} delivered files for ${r.ref}`}, ${url}, ${`/admin/bookings/${bookingId}`})`.catch(() => null);
  return { ok: true as const, ref: r.ref, name: r.name };
}

export async function deliveryInfo(bookingId: number, userId: number, token: string) {
  if (!verifyDeliver(bookingId, userId, token)) return null;
  const [r] = await q<{ ref: string; service_name: string; customer_name: string; schedule: Session[]; name: string; drive_link: string | null }[]>`
    select b.ref, b.service_name, b.customer_name, b.schedule, u.name, c.drive_link from crew_assignments c join bookings b on b.id = c.booking_id join users u on u.id = c.user_id
    where c.booking_id = ${bookingId} and c.user_id = ${userId}`;
  return r ? { ...r, when: whenText(r.schedule ?? []) } : null;
}


/* ---------- one-off file requests (crew not on a booking in the system) ---------- */
export const requestUrl = (id: number) => `${ORIGIN}/deliver?r=${id}&t=${signRef(`r${id}`, "deliver")}`;
const tzName = "America/New_York";

/** Creates a request and emails it right away. Due 24 hours from now unless dueAt is given. */
export async function createFileRequest(o: { name: string; email: string; shoot: string; shootDate: string; by: number | null; dueAt?: Date }) {
  const due = o.dueAt ?? new Date(Date.now() + 24 * HOUR);
  const [r] = await q<{ id: number }[]>`insert into file_requests (name, email, shoot, shoot_date, due_at, created_by) values (${o.name}, ${o.email}, ${o.shoot}, ${o.shootDate}, ${due}, ${o.by}) returning id`;
  const m = crewDriveRequest({ name: o.name, service: o.shoot, ref: `your ${o.shootDate} shoot`, folder: `${o.shootDate} - ${o.shoot}`, client: "", when: o.shootDate, venue: "", deadline: fmt(due, tzName), url: requestUrl(r.id) });
  const sent = await sendMail({ to: o.email, subject: m.subject, html: m.html });
  await audit(o.by, "file_request", `#${r.id} ${o.email}`);
  return { id: r.id, url: requestUrl(r.id), emailed: sent.ok, due: fmt(due, tzName) };
}

async function runFileRequests(now: Date) {
  const out = { reminded: 0, overdue: 0 };
  const rows = await q<{ id: number; name: string; email: string; shoot: string; shoot_date: string; due_at: Date; reminded_at: Date | null }[]>`
    select id, name, email, shoot, shoot_date, due_at, reminded_at from file_requests where drive_link is null and overdue_at is null and due_at > now() - interval '7 days'`;
  for (const r of rows) {
    const left = new Date(r.due_at).getTime() - now.getTime();
    if (!r.reminded_at && left <= 6 * HOUR && left > 0) {
      const c = await q`update file_requests set reminded_at = now() where id = ${r.id} and reminded_at is null returning id`;
      if (!c.length) continue;
      const m = crewDriveRequest({ name: r.name, service: r.shoot, ref: `your ${r.shoot_date} shoot`, folder: `${r.shoot_date} - ${r.shoot}`, client: "", when: r.shoot_date, venue: "", deadline: fmt(new Date(r.due_at), tzName), url: requestUrl(r.id) }, true);
      if ((await sendMail({ to: r.email, subject: m.subject, html: m.html })).ok) out.reminded++;
    } else if (left <= -HOUR) {
      const c = await q`update file_requests set overdue_at = now() where id = ${r.id} and overdue_at is null returning id`;
      if (!c.length) continue;
      const m = crewDriveTeam("overdue", { name: r.name, email: r.email, ref: `${r.shoot_date} shoot`, service: r.shoot, client: "", adminUrl: `${ORIGIN}/admin/photographers` });
      await sendMail({ to: TEAM_INBOX, replyTo: r.email, subject: m.subject, html: m.html });
      out.overdue++;
    }
  }
  return out;
}

export async function requestInfo(id: number, token: string) {
  if (!verifyRef(`r${id}`, "deliver", token)) return null;
  const [r] = await q<{ name: string; shoot: string; shoot_date: string; drive_link: string | null }[]>`select name, shoot, shoot_date, drive_link from file_requests where id = ${id}`;
  return r ? { ref: `${r.shoot_date} shoot`, service_name: r.shoot, customer_name: "", when: r.shoot_date, name: r.name, drive_link: r.drive_link } : null;
}

export async function saveRequestLink(id: number, token: string, link: string) {
  if (!verifyRef(`r${id}`, "deliver", token)) return { error: "This link isn't valid. Please use the button in your email." };
  const url = link.trim();
  if (!/^https:\/\/\S+\.\S+/.test(url) || url.length > 1000) return { error: "Please paste the full link, starting with https://" };
  const [r] = await q<{ name: string; email: string; shoot: string; shoot_date: string }[]>`update file_requests set drive_link = ${url}, drive_link_at = now() where id = ${id} returning name, email, shoot, shoot_date`;
  if (!r) return { error: "We couldn't find this request. Please reply to the email instead." };
  const m = crewDriveTeam("received", { name: r.name, email: r.email, ref: `${r.shoot_date} shoot`, service: r.shoot, client: "", link: url, adminUrl: `${ORIGIN}/admin/photographers` });
  await sendMail({ to: TEAM_INBOX, replyTo: r.email, subject: m.subject, html: m.html });
  await q`insert into notifications (user_id, title, body, link) values (null, ${`${r.name} delivered files for the ${r.shoot_date} shoot`}, ${url}, ${"/admin/photographers"})`.catch(() => null);
  return { ok: true as const, ref: `your ${r.shoot_date} shoot`, name: r.name };
}

export async function listFileRequests() {
  return q<{ id: number; name: string; email: string; shoot: string; shoot_date: string; due_at: Date; drive_link: string | null; drive_link_at: Date | null; created_at: Date }[]>`
    select id, name, email, shoot, shoot_date, due_at, drive_link, drive_link_at, created_at from file_requests order by id desc limit 50`;
}

/* ---------- shoots assigned by email from the admin (not tied to a website booking) ---------- */
/** When an assigned shoot ends: the last time in the schedule line (e.g. "9:00 AM – 6:00 PM") on the shoot date, in the city's time zone. */
export function assignmentEnd(date: string, timeText: string, city: string) {
  const times = [...timeText.matchAll(/(\d{1,2})(?::(\d{2}))?\s*([ap])\.?m\.?/gi)].map((m) => {
    const h = (Number(m[1]) % 12) + (m[3].toLowerCase() === "p" ? 12 : 0);
    return `${String(h).padStart(2, "0")}:${m[2] ?? "00"}`;
  });
  const tz = zoneFor(city || null);
  const end = zoned(date, times.length ? times[times.length - 1] : "23:00", tz);
  if (times.length >= 2 && times[times.length - 1] < times[0]) end.setTime(end.getTime() + 24 * HOUR);
  return end;
}

/** About an hour after an assigned shoot ends, send the Drive-link request (with the usual reminder and overdue alert). */
async function runAssignments(now: Date) {
  let asked = 0;
  const rows = await q<{ id: number; name: string; email: string; type: string; dates: string; ends_at: Date; created_by: number | null }[]>`
    select id, name, email, type, dates, ends_at, created_by from assignments
    where drive_asked_at is null and ends_at is not null and ends_at <= ${new Date(now.getTime() - HOUR)} and ends_at > ${new Date(now.getTime() - 4 * 24 * HOUR)}`;
  for (const r of rows) {
    const claimed = await q`update assignments set drive_asked_at = now() where id = ${r.id} and drive_asked_at is null returning id`;
    if (!claimed.length) continue;
    const fr = await createFileRequest({ name: r.name, email: r.email, shoot: r.type, shootDate: r.dates, by: r.created_by, dueAt: new Date(new Date(r.ends_at).getTime() + 24 * HOUR) });
    await q`update assignments set file_request_id = ${fr.id} where id = ${r.id}`;
    if (fr.emailed) asked++;
  }
  return asked;
}
