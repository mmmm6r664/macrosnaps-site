"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db, audit, q } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { sendNewsletter, sendTest } from "@/lib/newsletter";

export type S = { error?: string; ok?: string } | undefined;

export async function newDraft() {
  const u = await requireUser();
  const [n] = await q<{ id: number }[]>`insert into newsletters (subject, body, created_by) values ('Untitled newsletter', '', ${u.id}) returning id`;
  redirect(`/admin/newsletters/${n.id}`);
}

export async function saveNewsletter(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const subject = String(f.get("subject") ?? "").trim().slice(0, 200);
  const preheader = String(f.get("preheader") ?? "").trim().slice(0, 200);
  const body = String(f.get("body") ?? "").slice(0, 50000);
  const op = String(f.get("op") ?? "save");
  if (!subject) return { error: "Add a subject line." };
  const sql = await db();
  const [cur] = await sql<{ status: string }[]>`select status from newsletters where id = ${id}`;
  if (!cur) return { error: "Not found." };
  if (cur.status === "sent" || cur.status === "sending") return { error: "This newsletter has already been sent." };
  await sql`update newsletters set subject = ${subject}, preheader = ${preheader}, body = ${body}, updated_at = now() where id = ${id}`;
  if (op === "test") {
    const r = await sendTest(id, u.email);
    return r.ok ? { ok: `Test sent to ${u.email}.` } : { error: r.error };
  }
  if (op === "schedule") {
    const date = String(f.get("date") ?? "");
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date <= new Date().toISOString().slice(0, 10)) return { error: "Pick a date from tomorrow onward." };
    await sql`update newsletters set status = 'scheduled', scheduled_at = ${`${date}T13:00:00Z`} where id = ${id}`;
    await audit(u.id, "newsletter_schedule", `#${id} ${date}`);
    revalidatePath(`/admin/newsletters/${id}`);
    return { ok: `Scheduled for ${date}, about 8–9 AM Eastern.` };
  }
  if (op === "unschedule") {
    await sql`update newsletters set status = 'draft', scheduled_at = null where id = ${id} and status = 'scheduled'`;
    revalidatePath(`/admin/newsletters/${id}`);
    return { ok: "Back to draft." };
  }
  if (op === "send") {
    if (f.get("confirm") !== "on") return { error: "Tick the box to confirm sending to all subscribers." };
    const r = await sendNewsletter(id);
    await audit(u.id, "newsletter_send", `#${id} sent=${r.sent}`);
    revalidatePath(`/admin/newsletters/${id}`);
    return r.ok ? { ok: `Sent to ${r.sent} subscribers.` } : { error: `${r.error} (${r.sent} sent before the error)` };
  }
  revalidatePath(`/admin/newsletters/${id}`);
  return { ok: "Saved." };
}

export async function deleteNewsletter(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  await q`delete from newsletters where id = ${id} and status in ('draft', 'scheduled', 'failed')`;
  await audit(u.id, "newsletter_delete", `#${id}`);
  redirect("/admin/newsletters");
}
