"use server";
import { photographerAccepted } from "@/lib/emails";
import { sendMail } from "@/lib/mail";
import { sendContract } from "@/lib/esign";
import { randomBytes } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, db, audit } from "@/lib/db";
import { requireUser, hashPassword, createPasswordToken } from "@/lib/auth";
import { resolveCity } from "@/lib/geo";
import { allPeople, parseRadius } from "@/lib/network";
import { emailPerson, textPerson, notifyUser, ORIGIN } from "@/lib/notify";

export type S = { error?: string; ok?: string } | undefined;

/** Approve an application: creates the staff login + profile and emails a "set your password" link. */
export async function approveApplicant(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const [a] = await q<{ id: number; name: string; email: string; phone: string | null; data: Record<string, string> }[]>`select id, name, email, phone, data from inquiries where id = ${id} and kind = 'application'`;
  if (!a) return { error: "Application not found." };
  const email = a.email.toLowerCase();
  const exists = await q`select 1 from users where email = ${email}`;
  if (exists.length) return { error: "This person already has a login." };
  const city = resolveCity(a.data.city ?? "");
  const roles = /both/i.test(a.data.role ?? "") ? ["Photographer", "Videographer"] : [a.data.role ?? "Photographer"];
  const shoots = String(a.data.shootTypes ?? "").split(",").map((x) => x.trim()).filter(Boolean);
  const sql = await db();
  const userId = await sql.begin(async (tx) => {
    const [nu] = await tx<{ id: number }[]>`insert into users (email, name, password_hash, role) values (${email}, ${a.name}, ${await hashPassword(randomBytes(24).toString("hex"))}, 'staff') returning id`;
    await tx`insert into staff_profiles (user_id, phone, city, lat, lng, radius_miles, roles, shoot_types, gear, portfolio, application_id)
      values (${nu.id}, ${a.phone}, ${city ? `${city.name}, ${city.state}` : a.data.city ?? ""}, ${city?.lat ?? null}, ${city?.lng ?? null}, ${parseRadius(a.data.radius)},
      ${roles}, ${shoots}, ${[a.data.camera, a.data.secondary, a.data.lenses, a.data.lighting].filter(Boolean).join("\n")}, ${a.data.portfolio ?? null}, ${a.id})`;
    await tx`update inquiries set status = 'done', notes = notes || ${`\nApproved by ${u.name} on ${new Date().toISOString().slice(0, 10)}`} where id = ${a.id}`;
    return nu.id;
  });
  const token = await createPasswordToken(userId, "set");
  const setupUrl = `${ORIGIN}/staff/set-password?t=${token}`;
  // One welcome email: congratulations + contract to e-sign (optional) + account setup.
  const contract = f.get("contract") === "on" ? await sendContract({ name: a.name, email, userId, inquiryId: a.id, companySigner: u.name, by: u.id, email_it: false }) : null;
  const m = photographerAccepted(a.name, contract?.url ?? null, setupUrl);
  const sent = (await sendMail({ to: email, subject: m.subject, html: m.html })).ok;
  await audit(u.id, "staff_approve", `${email} (application #${a.id})`);
  const contractNote = contract ? ` Contract MS-C${contract.id} is included for e-signature.` : "";
  return sent ? { ok: `Approved. ${a.name} has been emailed their welcome.${contractNote}` } : { ok: `Approved, but the welcome email couldn't be sent. Account setup link: ${setupUrl}${contract ? ` · Signing link: ${contract.url}` : ""}` };
}

/** Email and/or text a group of people from the directory. */
export async function messagePeople(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const keys = new Set(f.getAll("p").map(String));
  if (!keys.size) return { error: "Select at least one person." };
  const viaEmail = f.get("viaEmail") === "on", viaSms = f.get("viaSms") === "on";
  if (!viaEmail && !viaSms) return { error: "Choose email, text, or both." };
  const subject = String(f.get("subject") ?? "").trim().slice(0, 150);
  const body = String(f.get("body") ?? "").trim().slice(0, 5000);
  if (!body || (viaEmail && !subject)) return { error: "Write a subject and a message." };
  const people = (await allPeople()).filter((p) => keys.has(p.key));
  let e = 0, t = 0;
  for (const p of people) {
    if (viaEmail && (await emailPerson(p.email, subject, body, u.id))) e++;
    if (viaSms && p.phone && (await textPerson(p.phone, `MacroSnaps: ${body}`.slice(0, 600), u.id))) t++;
  }
  await audit(u.id, "network_message", `${people.length} people, ${e} emails, ${t} texts`);
  return { ok: `Sent ${e} email${e === 1 ? "" : "s"} and ${t} text${t === 1 ? "" : "s"} to ${people.length} people.${(viaEmail && e < people.length) || (viaSms && t < people.length) ? " Some weren't sent: check that email/text are connected and phone numbers are valid (see Sent emails & texts)." : ""}` };
}

/** Offer a shoot to selected people: email + text + staff-portal notification, each with Accept / Decline. */
export async function createOffer(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const keys = new Set(f.getAll("p").map(String));
  if (!keys.size) return { error: "Select at least one person to offer the shoot to." };
  const title = String(f.get("title") ?? "").trim().slice(0, 150);
  const city = String(f.get("city") ?? "").trim().slice(0, 120);
  const date = String(f.get("date") ?? "").trim().slice(0, 120);
  const details = String(f.get("details") ?? "").trim().slice(0, 5000);
  const pay = String(f.get("pay") ?? "").trim().slice(0, 120);
  const bookingId = Number(f.get("booking_id")) || null;
  if (!title || !date) return { error: "Add a title and the date/time." };
  const viaEmail = f.get("viaEmail") === "on", viaSms = f.get("viaSms") === "on";
  const people = (await allPeople()).filter((p) => keys.has(p.key));
  const [o] = await q<{ id: number }[]>`insert into offers (booking_id, title, city, shoot_date, details, pay, created_by) values (${bookingId}, ${title}, ${city}, ${date}, ${details}, ${pay || null}, ${u.id}) returning id`;
  for (const p of people) {
    const token = randomBytes(18).toString("base64url");
    await q`insert into offer_recipients (offer_id, user_id, inquiry_id, name, email, phone, token) values (${o.id}, ${p.userId}, ${p.inquiryId}, ${p.name}, ${p.email}, ${p.phone}, ${token})`;
    const link = `${ORIGIN}/offer/${token}`;
    const text = `Hi ${p.name.split(" ")[0]},\n\nWe have a shoot available and thought of you:\n\n${title}\n${date}${city ? ` · ${city}` : ""}${pay ? `\nPay: ${pay}` : ""}${details ? `\n\n${details}` : ""}\n\nAre you available? Accept or decline with the button below. The first confirmed photographer gets the job.`;
    if (p.userId) await notifyUser(p.userId, `New shoot available: ${title}`, `${date}${city ? ` · ${city}` : ""}`, `/staff/offers`);
    if (viaEmail) await emailPerson(p.email, `Shoot available: ${title} (${date})`, text, u.id, { label: "Accept or decline", url: link });
    if (viaSms && p.phone) await textPerson(p.phone, `MacroSnaps shoot available: ${title}, ${date}${city ? `, ${city}` : ""}${pay ? `, ${pay}` : ""}. Accept/decline: ${link}`, u.id);
  }
  await audit(u.id, "offer_create", `#${o.id} to ${people.length}`);
  redirect(`/admin/offers/${o.id}`);
}

/** Add a photographer you've hired outside the careers form: staff login + profile, contractor agreement, one welcome email. */
export async function addPhotographer(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const name = String(f.get("name") ?? "").replace(/[<>]/g, "").trim().replace(/\s+/g, " ").slice(0, 100);
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const phone = String(f.get("phone") ?? "").replace(/[^\d+()\-. ]/g, "").trim().slice(0, 30) || null;
  const cityIn = String(f.get("city") ?? "").trim().slice(0, 120);
  const role = String(f.get("role") ?? "Photographer");
  if (name.split(" ").length < 2) return { error: "Enter their first and last name." };
  if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)) return { error: "Enter a valid email address." };
  if ((await q`select 1 from users where email = ${email}`).length) return { error: "Someone with that email already has a login." };
  const city = cityIn ? resolveCity(cityIn) : null;
  const roles = role === "Both" ? ["Photographer", "Videographer"] : [role === "Videographer" ? "Videographer" : "Photographer"];
  const sql = await db();
  const userId = await sql.begin(async (tx) => {
    const [nu] = await tx<{ id: number }[]>`insert into users (email, name, password_hash, role) values (${email}, ${name}, ${await hashPassword(randomBytes(24).toString("hex"))}, 'staff') returning id`;
    await tx`insert into staff_profiles (user_id, phone, city, lat, lng, roles) values (${nu.id}, ${phone}, ${city ? `${city.name}, ${city.state}` : cityIn}, ${city?.lat ?? null}, ${city?.lng ?? null}, ${roles})`;
    return nu.id;
  });
  const token = await createPasswordToken(userId, "set");
  const setupUrl = `${ORIGIN}/staff/set-password?t=${token}`;
  const contract = f.get("contract") === "on" ? await sendContract({ name, email, userId, companySigner: u.name, by: u.id, email_it: false }) : null;
  const m = photographerAccepted(name, contract?.url ?? null, setupUrl);
  const sent = (await sendMail({ to: email, subject: m.subject, html: m.html })).ok;
  await audit(u.id, "staff_add", email);
  revalidatePath("/admin/photographers");
  const note = contract ? ` Contractor agreement MS-C${contract.id} is included for e-signature.` : "";
  return sent ? { ok: `${name} has been added and emailed their welcome.${note}` } : { ok: `${name} was added, but the email couldn't be sent. Account setup link: ${setupUrl}${contract ? ` · Signing link: ${contract.url}` : ""}` };
}

/** Ask a photographer/videographer for the Google Drive link of a shoot (due in 24 hours; automatic reminder + overdue alert). */
export async function requestFiles(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const name = String(f.get("name") ?? "").replace(/[<>]/g, "").trim().slice(0, 100);
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const shoot = String(f.get("shoot") ?? "").replace(/[<>]/g, "").trim().slice(0, 120) || "Photography";
  const date = String(f.get("date") ?? "").trim();
  if (!name) return { error: "Enter their name." };
  if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)) return { error: "Enter a valid email address." };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return { error: "Choose the shoot date." };
  const shootDate = new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
  const { createFileRequest } = await import("@/lib/crewDelivery");
  const r = await createFileRequest({ name, email, shoot, shootDate, by: u.id });
  revalidatePath("/admin/photographers");
  return r.emailed ? { ok: `Sent to ${email}. Files are due by ${r.due}. They'll get a reminder 6 hours before, and you'll be emailed when the link arrives (or if it's late).` } : { ok: `Created, but the email couldn't be sent. Send them this link: ${r.url}` };
}

/** Welcome email for a team member who is fully onboarded. Optionally records a contract signed outside the portal. */
export async function sendWelcome(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const id = Number(f.get("user"));
  const [m] = await q<{ id: number; email: string; name: string; role: string }[]>`select id, email, name, role from users where id = ${id} and active and role = 'staff'`;
  if (!m) return { error: "Choose a team member." };
  if (f.get("offline") === "on") {
    await q`update staff_profiles set contract_version = coalesce(contract_version, 'Signed outside the portal'), contract_signed_at = coalesce(contract_signed_at, now()) where user_id = ${id}`;
    await q`update contracts set status = 'voided' where lower(signer_email) = ${m.email.toLowerCase()} and status in ('sent', 'viewed')`;
  }
  const loggedIn = (await q`select 1 from sessions where user_id = ${id} limit 1`).length > 0 || (await q`select 1 from audit_log where user_id = ${id} and action = 'login' limit 1`.catch(() => [])).length > 0;
  const url = loggedIn ? `${ORIGIN}/staff` : `${ORIGIN}/staff/set-password?t=${await createPasswordToken(id, "set")}`;
  const { photographerWelcome } = await import("@/lib/emails");
  const msg = photographerWelcome(m.name, url, !loggedIn);
  const sent = (await sendMail({ to: m.email, subject: msg.subject, html: msg.html })).ok;
  await audit(u.id, "staff_welcome", m.email);
  revalidatePath("/admin/photographers");
  return sent ? { ok: `Welcome email sent to ${m.email}.${f.get("offline") === "on" ? " Contract recorded as signed outside the portal." : ""}` } : { error: "The email couldn't be sent. Please try again." };
}

export type AssignS = { error?: string; ok?: string; preview?: { to: string; subject: string; html: string } } | undefined;

/** Preview or send the "[CONFIRMED] …" assignment email to a photographer/videographer. */
export async function sendAssignment(_: AssignS, f: FormData): Promise<AssignS> {
  const u = await requireUser();
  const { crewAssignment } = await import("@/lib/emails");
  const g = (k: string) => String(f.get(k) ?? "").trim();
  let name = g("name"), email = g("email").toLowerCase();
  const member = Number(f.get("member") || 0);
  if (member) {
    const [m] = await q<{ name: string; email: string }[]>`select name, email from users where id = ${member}`;
    if (m) { name = name || m.name; email = email || m.email; }
  }
  if (!name || !/^\S+@\S+\.\S+$/.test(email)) return { error: "Choose a team member or enter a name and email." };
  const sessions = g("sessions").split("\n").map((l) => l.trim()).filter(Boolean).map((l) => {
    const i = l.indexOf("|");
    return i > 0 ? { day: l.slice(0, i).trim(), time: l.slice(i + 1).trim() } : { day: l, time: "" };
  });
  const a = {
    name, type: g("type") || "Event Photography", dates: g("dates"), city: g("city") || undefined, sessions,
    location: g("location"), pay: g("pay"), scope: g("scope").split("\n").map((l) => l.replace(/^[•\-*]\s*/, "").trim()).filter(Boolean),
  };
  if (!a.dates || !sessions.length || !a.location || !a.pay) return { error: "Fill in dates, schedule, location and compensation." };
  const m = crewAssignment(a);
  if (f.get("mode") !== "send") return { preview: { to: `${name} <${email}>`, subject: m.subject, html: m.html } };
  const sent = await sendMail({ to: email, subject: m.subject, html: m.html });
  await audit(u.id, "crew_assignment_email", `${email}: ${m.subject}`);
  return sent.ok ? { ok: `Sent to ${name} (${email}).` } : { error: "The email couldn't be sent. Check the email log for details." };
}
