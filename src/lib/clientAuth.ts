// Client portal sign-in: one-time email links, Google and Facebook. Sessions live in Postgres behind an httpOnly cookie.
// Clients see the bookings made with their email address (matched case-insensitively).
import "server-only";
import { createHash, randomBytes } from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { q } from "@/lib/db";
import { clientIp } from "@/lib/auth";

export type Client = { id: number; email: string; first_name: string; last_name: string; phone: string | null };

const COOKIE = "ms_client";
const DAYS = 30;
const sha = (s: string) => createHash("sha256").update(s).digest("hex");
export const normEmail = (e: string) => e.trim().toLowerCase();
export const validEmail = (e: string) => /^[^\s@<>()]{1,64}@[^\s@<>()]{1,190}\.[a-z]{2,}$/i.test(e);

/** Only same-site paths are allowed as a post-login destination. */
export const safeNext = (p: unknown) => (typeof p === "string" && /^\/account(\/[\w\-/]*)?$/.test(p) ? p : "/account");

export const oauthEnabled = {
  google: !!(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET),
  facebook: !!(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET),
};

/** Creates a one-time sign-in link (valid 20 minutes). */
export async function createLoginToken(email: string, next: string) {
  const token = randomBytes(32).toString("base64url");
  await q`insert into client_login_tokens (token_hash, email, next_path, expires_at) values (${sha(token)}, ${normEmail(email)}, ${safeNext(next)}, ${new Date(Date.now() + 20 * 60e3)})`;
  await q`delete from client_login_tokens where expires_at < now() - interval '1 day'`;
  return token;
}

/** Uses a sign-in link once. Returns the email and where to go, or null if invalid/expired/used. */
export async function consumeLoginToken(token: string) {
  if (!token || token.length > 100) return null;
  const rows = await q<{ email: string; next_path: string | null }[]>`
    update client_login_tokens set used_at = now()
    where token_hash = ${sha(token)} and used_at is null and expires_at > now()
    returning email, next_path`;
  return rows[0] ?? null;
}

/** Finds or creates the client account for an email, filling the name from their most recent booking when new. */
export async function upsertClient(email: string, info: { first?: string; last?: string; googleSub?: string; facebookId?: string } = {}) {
  const e = normEmail(email);
  let first = (info.first ?? "").slice(0, 60), last = (info.last ?? "").slice(0, 60);
  if (!first) {
    const b = await q<{ customer_name: string }[]>`select customer_name from bookings where lower(email) = ${e} order by created_at desc limit 1`;
    if (b[0]) [first, last] = [b[0].customer_name.split(" ")[0] ?? "", b[0].customer_name.split(" ").slice(1).join(" ")];
  }
  const rows = await q<{ id: number }[]>`
    insert into clients (email, first_name, last_name, google_sub, facebook_id, last_login_at)
    values (${e}, ${first}, ${last}, ${info.googleSub ?? null}, ${info.facebookId ?? null}, now())
    on conflict (email) do update set
      last_login_at = now(),
      first_name = case when clients.first_name = '' then excluded.first_name else clients.first_name end,
      last_name = case when clients.last_name = '' then excluded.last_name else clients.last_name end,
      google_sub = coalesce(clients.google_sub, excluded.google_sub),
      facebook_id = coalesce(clients.facebook_id, excluded.facebook_id)
    returning id`;
  return rows[0].id;
}

export async function startClientSession(clientId: number) {
  const token = randomBytes(32).toString("base64url");
  const expires = new Date(Date.now() + DAYS * 864e5);
  await q`insert into client_sessions (token_hash, client_id, expires_at) values (${sha(token)}, ${clientId}, ${expires})`;
  await q`delete from client_sessions where expires_at < now()`;
  (await cookies()).set(COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", expires });
}

export async function endClientSession() {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token) await q`delete from client_sessions where token_hash = ${sha(token)}`;
  jar.delete(COOKIE);
}

export async function currentClient(): Promise<Client | null> {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token || token.length > 100) return null;
  try {
    const rows = await q<Client[]>`
      select c.id, c.email, c.first_name, c.last_name, c.phone from client_sessions s join clients c on c.id = s.client_id
      where s.token_hash = ${sha(token)} and s.expires_at > now()`;
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

export async function requireClient(next = "/account"): Promise<Client> {
  const c = await currentClient();
  if (!c) redirect(`/account/login?next=${encodeURIComponent(next)}`);
  return c;
}

/** At most 5 sign-in emails per address and 20 per IP per hour. */
export async function tooManyLinks(email: string) {
  const ip = await clientIp();
  const rows = await q<{ by_email: number; by_ip: number }[]>`
    select count(*) filter (where detail = ${"email:" + normEmail(email)})::int as by_email,
           count(*) filter (where detail = ${"ip:" + ip})::int as by_ip
    from audit_log where action = 'client_link' and created_at > now() - interval '1 hour'`;
  const r = rows[0];
  return r.by_email >= 5 || r.by_ip >= 20;
}
export async function logLinkSent(email: string) {
  const ip = await clientIp();
  await q`insert into audit_log (user_id, action, detail) values (null, 'client_link', ${"email:" + normEmail(email)}), (null, 'client_link', ${"ip:" + ip})`;
}

/** OAuth state cookie (CSRF protection for Google/Facebook sign-in). */
export async function newOauthState(next: string) {
  const state = randomBytes(24).toString("base64url");
  (await cookies()).set("ms_oauth", `${state}|${safeNext(next)}`, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 600 });
  return state;
}
export async function checkOauthState(state: string | null) {
  const jar = await cookies();
  const v = jar.get("ms_oauth")?.value ?? "";
  jar.delete("ms_oauth");
  const [s, next] = v.split("|");
  return s && state && s === state ? safeNext(next) : null;
}
