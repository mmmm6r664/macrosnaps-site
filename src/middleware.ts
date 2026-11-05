import { NextResponse, type NextRequest } from "next/server";

// Countries where the site is not shown (Vercel sets x-vercel-ip-country from the visitor's IP).
// Russia, Iran, Ukraine and every African country (ISO 3166-1 alpha-2).
const AFRICA = [
  "DZ", "AO", "BJ", "BW", "BF", "BI", "CV", "CM", "CF", "TD", "KM", "CG", "CD", "CI", "DJ", "EG", "GQ", "ER", "SZ", "ET",
  "GA", "GM", "GH", "GN", "GW", "KE", "LS", "LR", "LY", "MG", "MW", "ML", "MR", "MU", "YT", "MA", "MZ", "NA", "NE", "NG",
  "RE", "RW", "SH", "ST", "SN", "SC", "SL", "SO", "ZA", "SS", "SD", "TZ", "TG", "TN", "UG", "EH", "ZM", "ZW",
];
const BLOCKED = new Set(["RU", "IR", "UA", ...AFRICA]);

const PAGE = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="robots" content="noindex"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Not available</title></head><body style="font-family:Arial,sans-serif;background:#000;color:#fff;display:grid;place-items:center;min-height:100vh;margin:0;text-align:center"><div><h1 style="color:#ccba56;font-weight:400">MacroSnaps</h1><p>This website is not available in your region.</p></div></body></html>`;

export function middleware(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (country && BLOCKED.has(country)) {
    return new NextResponse(PAGE, { status: 451, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next.js build assets and the Stripe webhook (Stripe's servers must always reach it).
  matcher: ["/((?!_next/static|_next/image|api/stripe-webhook|favicon.ico).*)"],
};
