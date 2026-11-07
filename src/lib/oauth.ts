// Google and Facebook sign-in for the client portal (standard OAuth 2.0 authorization-code flow).
import "server-only";

export type Provider = "google" | "facebook";
export const isProvider = (p: string): p is Provider => p === "google" || p === "facebook";
type Profile = { email: string; first: string; last: string; id: string };

const V = "v19.0";
const redirectUri = (origin: string, p: Provider) => `${origin}/api/client/oauth/${p}/callback`;

export function authUrl(p: Provider, origin: string, state: string) {
  if (p === "google") {
    const u = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    u.search = new URLSearchParams({ client_id: process.env.GOOGLE_CLIENT_ID!, redirect_uri: redirectUri(origin, p), response_type: "code", scope: "openid email profile", state, prompt: "select_account" }).toString();
    return u.toString();
  }
  const u = new URL(`https://www.facebook.com/${V}/dialog/oauth`);
  u.search = new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, redirect_uri: redirectUri(origin, p), response_type: "code", scope: "email,public_profile", state }).toString();
  return u.toString();
}

/** Exchanges the code for a verified profile. Returns null if anything is off. */
export async function profileFrom(p: Provider, origin: string, code: string): Promise<Profile | null> {
  if (p === "google") {
    const t = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST", headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ code, client_id: process.env.GOOGLE_CLIENT_ID!, client_secret: process.env.GOOGLE_CLIENT_SECRET!, redirect_uri: redirectUri(origin, p), grant_type: "authorization_code" }),
    }).then((r) => r.json()).catch(() => null);
    if (!t?.access_token) return null;
    const u = await fetch("https://openidconnect.googleapis.com/v1/userinfo", { headers: { authorization: `Bearer ${t.access_token}` } }).then((r) => r.json()).catch(() => null);
    if (!u?.sub || !u.email || u.email_verified !== true) return null;
    return { id: String(u.sub), email: String(u.email), first: String(u.given_name ?? ""), last: String(u.family_name ?? "") };
  }
  const t = await fetch(`https://graph.facebook.com/${V}/oauth/access_token?${new URLSearchParams({ client_id: process.env.FACEBOOK_APP_ID!, client_secret: process.env.FACEBOOK_APP_SECRET!, redirect_uri: redirectUri(origin, p), code })}`).then((r) => r.json()).catch(() => null);
  if (!t?.access_token) return null;
  const u = await fetch(`https://graph.facebook.com/${V}/me?${new URLSearchParams({ fields: "id,first_name,last_name,email", access_token: t.access_token })}`).then((r) => r.json()).catch(() => null);
  if (!u?.id) return null;
  return { id: String(u.id), email: String(u.email ?? ""), first: String(u.first_name ?? ""), last: String(u.last_name ?? "") };
}
