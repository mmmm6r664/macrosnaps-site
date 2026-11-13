import { AsyncLocalStorage } from "node:async_hooks";
// Admin portal authentication: hashed passwords, server-side sessions in Postgres, httpOnly cookie.
import "server-only";
import { createHash, randomBytes, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { db, q } from "@/lib/db";

export type Role = "owner" | "admin" | "staff";
export type User = { id: number; email: string; name: string; role: Role; active: boolean; totp_enabled: boolean };

const COOKIE = "ms_admin";
const DAYS = 14;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");

export const hashPassword = (pw: string) => bcrypt.hash(pw, 12);
export const verifyPassword = (pw: string, hash: string) => bcrypt.compare(pw, hash);

/** Passwords: at least 10 characters with a letter and a number. */
export const passwordProblem = (pw: string) =>
  pw.length < 10 ? "Use at least 10 characters." : !/[A-Za-z]/.test(pw) || !/\d/.test(pw) ? "Use letters and at least one number." : pw.length > 200 ? "Too long." : null;

/** Starts a session. With pending=true the password was right but the 2FA code is still needed (5-minute window). */
export async function createSession(userId: number, pending = false) {
  const sql = await db();
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + (pending ? 5 * 60e3 : DAYS * 864e5));
  const h = await headers();
  await sql`insert into sessions (token_hash, user_id, expires_at, mfa_pending, ip, user_agent)
    values (${sha(token)}, ${userId}, ${expires}, ${pending}, ${await clientIp()}, ${(h.get("user-agent") ?? "").slice(0, 200)})`;
  await sql`delete from sessions where expires_at < now()`;
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}

/** The user who passed the password step and still owes a 2FA code. */
export async function pendingMfaUser(): Promise<User | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const rows = await q<User[]>`
    select u.id, u.email, u.name, u.role, u.active, u.totp_enabled from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${sha(token)} and s.expires_at > now() and s.mfa_pending and u.active`;
  return rows[0] ?? null;
}

/** 2FA passed: replace the short pending session with a full one. */
export async function completeMfa(userId: number) {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token) await q`delete from sessions where token_hash = ${sha(token)}`;
  await createSession(userId, false);
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await q`delete from sessions where token_hash = ${sha(token)}`;
  jar.delete(COOKIE);
}

/** Lets the CRM connector (/api/mcp) run admin actions as a chosen admin user, for that request only. */
export const actingAs = new AsyncLocalStorage<User>();

export async function currentUser(): Promise<User | null> {
  const acting = actingAs.getStore();
  if (acting) return acting;
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const sql = await db();
  const rows = await sql<User[]>`
    select u.id, u.email, u.name, u.role, u.active, u.totp_enabled from sessions s join users u on u.id = s.user_id
    where s.token_hash = ${sha(token)} and s.expires_at > now() and not s.mfa_pending and u.active`;
  return rows[0] ?? null;
}

/** Use at the top of every admin page and action. Staff can only reach pages that allow "staff". */
export async function requireUser(roles: Role[] = ["owner", "admin"]): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (!roles.includes(u.role)) redirect("/admin");
  // Owners and admins must use two-factor authentication.
  if ((u.role === "owner" || u.role === "admin") && !u.totp_enabled) redirect("/admin/security");
  return u;
}

export const isManager = (u: User) => u.role === "owner" || u.role === "admin";

export async function clientIp() {
  return ((await headers()).get("x-forwarded-for") ?? "").split(",")[0].trim().slice(0, 45);
}

/** At most 8 failed sign-ins per email and per IP in 15 minutes. */
export async function tooManyAttempts(email: string, ip: string) {
  const sql = await db();
  const [r] = await sql<{ n: number }[]>`
    select count(*)::int as n from audit_log
    where action = 'login_failed' and created_at > now() - interval '15 minutes' and (detail = ${email} or detail = ${"ip:" + ip})`;
  return r.n >= 8;
}

export function setupCodeMatches(code: string) {
  const want = process.env.ADMIN_SETUP_CODE || "";
  if (!want || !code) return false;
  const a = Buffer.from(sha(code)), b = Buffer.from(sha(want));
  return timingSafeEqual(a, b);
}

let dummy: string | undefined;
/** A real bcrypt hash used when an email doesn't exist, so response time doesn't reveal which emails are valid. */
export const dummyHash = () => (dummy ??= bcrypt.hashSync(randomBytes(16).toString("hex"), 12));

/** Staff portal pages (/staff): photographers and videographers. Managers may view it too. */
export async function requireStaff(): Promise<User> {
  const u = await currentUser();
  if (!u) redirect("/staff/login");
  return u;
}

/** One-time link for setting or resetting a password (valid 7 days for invites, 2 hours for resets). */
export async function createPasswordToken(userId: number, purpose: "set" | "reset") {
  const token = randomBytes(32).toString("base64url");
  const hours = purpose === "set" ? 24 * 7 : 2;
  const sql = await db();
  await sql`delete from password_tokens where user_id = ${userId}`;
  await sql`insert into password_tokens (token_hash, user_id, purpose, expires_at) values (${sha(token)}, ${userId}, ${purpose}, ${new Date(Date.now() + hours * 3600e3)})`;
  return token;
}

export async function consumePasswordToken(token: string, newPassword: string): Promise<number | null> {
  if (!token || token.length > 100) return null;
  const sql = await db();
  const [row] = await sql<{ user_id: number }[]>`delete from password_tokens where token_hash = ${sha(token)} and expires_at > now() returning user_id`;
  if (!row) return null;
  await sql`update users set password_hash = ${await hashPassword(newPassword)} where id = ${row.user_id}`;
  await sql`delete from sessions where user_id = ${row.user_id}`;
  return row.user_id;
}
