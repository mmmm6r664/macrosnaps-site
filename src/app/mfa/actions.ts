"use server";
import { createHash, randomBytes } from "crypto";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import QRCode from "qrcode";
import { q, audit } from "@/lib/db";
import { currentUser, pendingMfaUser, completeMfa, clientIp, tooManyAttempts, isManager } from "@/lib/auth";
import { newSecret, verifyTotp, otpauthUrl } from "@/lib/totp";
import { encrypt, decrypt, canEncrypt } from "@/lib/crypto";
import { emailPerson } from "@/lib/notify";

export type M = { error?: string; ok?: string; qr?: string; secret?: string; codes?: string[] } | undefined;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const seal = (s: string) => (canEncrypt() ? encrypt(s) : `p:${s}`);
const unseal = (s: string) => (s.startsWith("p:") ? s.slice(2) : decrypt(s));

async function newRecoveryCodes(userId: number) {
  const codes = Array.from({ length: 10 }, () => randomBytes(5).toString("hex").toUpperCase().replace(/(.{5})/, "$1-"));
  await q`delete from recovery_codes where user_id = ${userId}`;
  for (const c of codes) await q`insert into recovery_codes (user_id, code_hash) values (${userId}, ${sha(c.replace("-", ""))})`;
  return codes;
}

async function loginAlert(userId: number, email: string, name: string) {
  const ip = await clientIp();
  await emailPerson(email, "New sign-in to your MacroSnaps account", `Hi ${name.split(" ")[0]},\n\nYour MacroSnaps account was just signed in to${ip ? ` from IP address ${ip}` : ""} on ${new Date().toUTCString()}.\n\nIf this wasn't you, change your password right away and tell the MacroSnaps owner.`, null);
  void userId;
}

/** Step 2 of sign-in: 6-digit authenticator code or a one-time recovery code. */
export async function verifyMfa(_: M, f: FormData): Promise<M> {
  const u = await pendingMfaUser();
  if (!u) return { error: "Your sign-in timed out. Please start again." };
  const ip = await clientIp();
  if (await tooManyAttempts(`mfa:${u.id}`, ip)) return { error: "Too many attempts. Try again in 15 minutes." };
  const code = String(f.get("code") ?? "").trim().toUpperCase();
  const [row] = await q<{ totp_secret: string | null; totp_last_counter: string }[]>`select totp_secret, totp_last_counter from users where id = ${u.id}`;
  let ok = false;
  if (/^\d{6}$/.test(code.replace(/\s/g, "")) && row?.totp_secret) {
    const counter = verifyTotp(unseal(row.totp_secret), code);
    if (counter !== null && counter > Number(row.totp_last_counter)) {
      await q`update users set totp_last_counter = ${counter} where id = ${u.id}`;
      ok = true;
    }
  } else if (/^[0-9A-F]{5}-?[0-9A-F]{5}$/.test(code)) {
    const used = await q`update recovery_codes set used_at = now() where user_id = ${u.id} and code_hash = ${sha(code.replace("-", ""))} and used_at is null returning id`;
    ok = used.length > 0;
    if (ok) await audit(u.id, "recovery_code_used");
  }
  if (!ok) {
    await audit(null, "login_failed", `mfa:${u.id}`);
    await audit(null, "login_failed", "ip:" + ip);
    return { error: "That code isn't right. Codes change every 30 seconds." };
  }
  await completeMfa(u.id);
  await audit(u.id, "login", `${ip} (2FA)`);
  await loginAlert(u.id, u.email, u.name);
  redirect(isManager(u) ? "/admin" : "/staff");
}

/** Start setup: new secret + QR code (not active until confirmed). */
export async function startSetup(): Promise<M> {
  const u = await currentUser();
  if (!u) return { error: "Please sign in again." };
  const secret = newSecret();
  await q`update users set totp_secret = ${seal(secret)}, totp_enabled = false where id = ${u.id}`;
  const qr = await QRCode.toDataURL(otpauthUrl(secret, u.email), { margin: 1, width: 220 });
  return { qr, secret: secret.replace(/(.{4})/g, "$1 ").trim() };
}

export async function confirmSetup(_: M, f: FormData): Promise<M> {
  const u = await currentUser();
  if (!u) return { error: "Please sign in again." };
  const [row] = await q<{ totp_secret: string | null }[]>`select totp_secret from users where id = ${u.id}`;
  const counter = row?.totp_secret ? verifyTotp(unseal(row.totp_secret), String(f.get("code") ?? "")) : null;
  if (counter === null) return { error: "That code isn't right. Check your phone's time is automatic and try the newest code." };
  await q`update users set totp_enabled = true, totp_last_counter = ${counter} where id = ${u.id}`;
  const codes = await newRecoveryCodes(u.id);
  await audit(u.id, "2fa_enabled");
  return { ok: "Two-factor authentication is on.", codes };
}

export async function regenerateCodes(): Promise<M> {
  const u = await currentUser();
  if (!u?.totp_enabled) return { error: "Turn on two-factor authentication first." };
  const codes = await newRecoveryCodes(u.id);
  await audit(u.id, "recovery_codes_regenerated");
  return { ok: "New recovery codes. The old ones no longer work.", codes };
}

export async function disableMfa(): Promise<M> {
  const u = await currentUser();
  if (!u) return { error: "Please sign in again." };
  if (isManager(u)) return { error: "Two-factor authentication is required for owner and admin accounts." };
  await q`update users set totp_enabled = false, totp_secret = null where id = ${u.id}`;
  await q`delete from recovery_codes where user_id = ${u.id}`;
  await audit(u.id, "2fa_disabled");
  return { ok: "Two-factor authentication is off." };
}

/** Signs out every other device and browser. */
export async function signOutOthers(): Promise<M> {
  const u = await currentUser();
  if (!u) return { error: "Please sign in again." };
  const token = (await cookies()).get("ms_admin")?.value ?? "";
  await q`delete from sessions where user_id = ${u.id} and token_hash <> ${sha(token)}`;
  await audit(u.id, "signout_others");
  return { ok: "Signed out of all other devices." };
}
