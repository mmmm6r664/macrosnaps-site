"use server";
import { redirect } from "next/navigation";
import { q, audit, hasDb } from "@/lib/db";
import { clientIp, createSession, destroySession, verifyPassword, dummyHash, tooManyAttempts, createPasswordToken, consumePasswordToken, passwordProblem } from "@/lib/auth";
import { emailPerson, ORIGIN } from "@/lib/notify";

export type FS = { error?: string; ok?: string } | undefined;

export async function staffLogin(_: FS, f: FormData): Promise<FS> {
  if (!hasDb) return { error: "Sign-in is temporarily unavailable." };
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const password = String(f.get("password") ?? "").slice(0, 200);
  const ip = await clientIp();
  if (await tooManyAttempts(email, ip)) return { error: "Too many attempts. Try again in 15 minutes." };
  const [u] = await q<{ id: number; password_hash: string; active: boolean; totp_enabled: boolean }[]>`select id, password_hash, active, totp_enabled from users where email = ${email}`;
  const ok = await verifyPassword(password, u?.password_hash ?? dummyHash());
  if (!u || !ok || !u.active) {
    await audit(null, "login_failed", email);
    await audit(null, "login_failed", "ip:" + ip);
    return { error: "Wrong email or password." };
  }
  if (u.totp_enabled) {
    await createSession(u.id, true); // password OK; the 2FA code is next
    redirect("/staff/verify");
  }
  await createSession(u.id);
  await audit(u.id, "staff_login", ip);
  redirect("/staff");
}

export async function staffLogout() {
  await destroySession();
  redirect("/staff/login");
}

/** Always answers the same way, so it can't be used to find out which emails have accounts. */
export async function forgotPassword(_: FS, f: FormData): Promise<FS> {
  if (!hasDb) return { error: "Unavailable right now." };
  const email = String(f.get("email") ?? "").trim().toLowerCase().slice(0, 200);
  const ip = await clientIp();
  if (await tooManyAttempts(email, ip)) return { error: "Too many attempts. Try again in 15 minutes." };
  await audit(null, "login_failed", "ip:" + ip); // counts toward the rate limit
  const [u] = await q<{ id: number; name: string; active: boolean }[]>`select id, name, active from users where email = ${email}`;
  if (u?.active) {
    const t = await createPasswordToken(u.id, "reset");
    await emailPerson(email, "Reset your MacroSnaps password", `Hi ${u.name.split(" ")[0]},\n\nUse the button below to choose a new password. The link works for 2 hours. If you didn't ask for this, ignore this email.`, null, { label: "Choose a new password", url: `${ORIGIN}/staff/set-password?t=${t}` });
  }
  return { ok: "If that email has an account, we've sent a link to reset the password." };
}

export async function setPassword(_: FS, f: FormData): Promise<FS> {
  const pw = String(f.get("password") ?? "");
  if (pw !== String(f.get("confirm") ?? "")) return { error: "The passwords don't match." };
  const p = passwordProblem(pw);
  if (p) return { error: p };
  const userId = await consumePasswordToken(String(f.get("t") ?? ""), pw);
  if (!userId) return { error: "This link has expired or was already used. Ask for a new one." };
  await audit(userId, "password_set");
  await createSession(userId);
  redirect("/staff");
}
