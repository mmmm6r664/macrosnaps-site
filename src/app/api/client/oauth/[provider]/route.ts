import { NextResponse, type NextRequest } from "next/server";
import { newOauthState, oauthEnabled } from "@/lib/clientAuth";
import { authUrl, isProvider } from "@/lib/oauth";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ provider: string }> }) {
  const p = (await params).provider;
  if (!isProvider(p) || !oauthEnabled[p]) return NextResponse.redirect(new URL("/account/login", req.url));
  const state = await newOauthState(req.nextUrl.searchParams.get("next") ?? "/account");
  return NextResponse.redirect(authUrl(p, req.nextUrl.origin, state));
}
