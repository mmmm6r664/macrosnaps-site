"use server";
import { revalidatePath } from "next/cache";
import { db, audit } from "@/lib/db";
import { requireUser, hashPassword, passwordProblem, type Role } from "@/lib/auth";

export type S = { error?: string; ok?: string } | undefined;

export async function addMember(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const name = [f.get("firstName"), f.get("lastName")].map((v) => String(v ?? "").trim().slice(0, 60)).filter(Boolean).join(" ");
  if (!String(f.get("firstName") ?? "").trim() || !String(f.get("lastName") ?? "").trim()) return { error: "Enter both first and last name." };
  const role = String(f.get("role") ?? "staff") as Role;
  const password = String(f.get("password") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name) return { error: "Enter a name and a valid email." };
  if (!["admin", "staff"].includes(role)) return { error: "Choose admin or staff." };
  if (role === "admin" && u.role !== "owner") return { error: "Only the owner can add admins." };
  const p = passwordProblem(password);
  if (p) return { error: `Temporary password: ${p}` };
  const sql = await db();
  const exists = await sql`select 1 from users where email = ${email}`;
  if (exists.length) return { error: "Someone with that email already has an account." };
  await sql`insert into users (email, name, password_hash, role) values (${email}, ${name}, ${await hashPassword(password)}, ${role})`;
  await audit(u.id, "user_add", `${email} ${role}`);
  revalidatePath("/admin/team");
  return { ok: `${name} can now sign in at /admin with that email and temporary password. Ask them to change it under My account.` };
}

export async function setActive(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const active = f.get("active") === "1";
  const sql = await db();
  const [t] = await sql<{ role: string }[]>`select role from users where id = ${id}`;
  if (!t || t.role === "owner" || (t.role === "admin" && u.role !== "owner") || id === u.id) return;
  await sql`update users set active = ${active} where id = ${id}`;
  if (!active) await sql`delete from sessions where user_id = ${id}`;
  await audit(u.id, active ? "user_enable" : "user_disable", String(id));
  revalidatePath("/admin/team");
}

export async function changePassword(_: S, f: FormData): Promise<S> {
  const u = await requireUser(["owner", "admin", "staff"]);
  const { verifyPassword } = await import("@/lib/auth");
  const sql = await db();
  const [row] = await sql<{ password_hash: string }[]>`select password_hash from users where id = ${u.id}`;
  if (!(await verifyPassword(String(f.get("current") ?? ""), row.password_hash))) return { error: "Your current password isn't right." };
  const next = String(f.get("next") ?? "");
  const p = passwordProblem(next);
  if (p) return { error: p };
  await sql`update users set password_hash = ${await hashPassword(next)} where id = ${u.id}`;
  await audit(u.id, "password_change");
  return { ok: "Password changed." };
}

/** Emails a fresh "set your password" link (also shown here in case email isn't connected). */
export async function sendLoginLink(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const sql = await db();
  const [t] = await sql<{ email: string; name: string; role: string }[]>`select email, name, role from users where id = ${id} and active`;
  if (!t || t.role === "owner") return { error: "Not available for this account." };
  const { createPasswordToken } = await import("@/lib/auth");
  const { emailPerson, ORIGIN } = await import("@/lib/notify");
  const token = await createPasswordToken(id, "set");
  const url = `${ORIGIN}/staff/set-password?t=${token}`; // admins can also sign in through /staff, then use their private admin address
  const sent = await emailPerson(t.email, "Your MacroSnaps login link", `Hi ${t.name.split(" ")[0]},\n\nUse the button below to set your password. The link works for 7 days.`, u.id, { label: "Set my password", url });
  await audit(u.id, "login_link", t.email);
  return { ok: sent ? `Emailed a login link to ${t.email}.` : `Email isn't connected. Send ${t.name} this link: ${url}` };
}
