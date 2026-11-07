"use server";
import { redirect } from "next/navigation";
import { db, audit, hasDb } from "@/lib/db";
import { clientIp, dummyHash, createSession, destroySession, hashPassword, passwordProblem, setupCodeMatches, tooManyAttempts, verifyPassword } from "@/lib/auth";

export type FormState = { error?: string; ok?: string } | undefined;
const str = (f: FormData, k: string, max = 200) => String(f.get(k) ?? "").trim().slice(0, max);

export async function login(_: FormState, f: FormData): Promise<FormState> {
  if (!hasDb) return { error: "The database isn't connected yet." };
  const email = str(f, "email").toLowerCase();
  const password = String(f.get("password") ?? "").slice(0, 200);
  const ip = await clientIp();
  if (await tooManyAttempts(email, ip)) return { error: "Too many attempts. Try again in 15 minutes." };
  const sql = await db();
  const [u] = await sql<{ id: number; password_hash: string; active: boolean }[]>`select id, password_hash, active from users where email = ${email}`;
  // Compare against a dummy hash when the user doesn't exist so timing doesn't reveal valid emails.
  const ok = await verifyPassword(password, u?.password_hash ?? dummyHash());
  if (!u || !ok || !u.active) {
    await audit(null, "login_failed", email);
    await audit(null, "login_failed", "ip:" + ip);
    return { error: "Wrong email or password." };
  }
  await createSession(u.id);
  await audit(u.id, "login", ip);
  redirect("/admin");
}

export async function logout() {
  await destroySession();
  redirect("/admin/login");
}

/** One-time owner setup: only while no users exist, and only with the setup code. */
export async function setupOwner(_: FormState, f: FormData): Promise<FormState> {
  if (!hasDb) return { error: "The database isn't connected yet." };
  const sql = await db();
  const [{ n }] = await sql<{ n: number }[]>`select count(*)::int as n from users`;
  if (n > 0) return { error: "Setup is already complete. Please sign in." };
  const ip = await clientIp();
  if (await tooManyAttempts("setup", ip)) return { error: "Too many attempts. Try again in 15 minutes." };
  if (!setupCodeMatches(str(f, "code"))) {
    await audit(null, "login_failed", "ip:" + ip);
    return { error: "That setup code isn't right." };
  }
  const email = str(f, "email").toLowerCase();
  const name = str(f, "name", 80);
  const password = String(f.get("password") ?? "");
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || !name) return { error: "Enter your name and email." };
  const p = passwordProblem(password);
  if (p) return { error: p };
  const [u] = await sql<{ id: number }[]>`insert into users (email, name, password_hash, role) values (${email}, ${name}, ${await hashPassword(password)}, 'owner') returning id`;
  await audit(u.id, "owner_setup", email);
  await createSession(u.id);
  redirect("/admin");
}
