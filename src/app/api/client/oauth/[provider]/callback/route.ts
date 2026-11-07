import { NextResponse, type NextRequest } from "next/server";
import { checkOauthState, oauthEnabled, startClientSession, upsertClient, validEmail } from "@/lib/clientAuth";
import { isProvider, profileFrom } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const p = (await params).provider;
  const fail = (e: string) => NextResponse.redirect(new URL(`/account/login?error=${e}`, req.url));
  if (!isProvider(p) || !oauthEnabled[p]) return fail("oauth");
  const next = await checkOauthState(req.nextUrl.searchParams.get("state"));
  const code = req.nextUrl.searchParams.get("code");
  if (!next || !code || code.length > 2000) return fail("oauth");
  const prof = await profileFrom(p, req.nextUrl.origin, code);
  if (!prof) return fail("oauth");
  if (!validEmail(prof.email)) return fail("noemail");
  const id = await upsertClient(prof.email, { first: prof.first, last: prof.last, ...(p === "google" ? { googleSub: prof.id } : { facebookId: prof.id }) });
  await startClientSession(id);
  return NextResponse.redirect(new URL(next, req.url));
}
