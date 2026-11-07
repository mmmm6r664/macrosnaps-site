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

// The admin portal is invisible to the public: /admin answers with the normal "page not found"
// unless the browser first visited the secret address set in ADMIN_GATE_PATH (Vercel environment variable).
// With no ADMIN_GATE_PATH set, the portal stays hidden from everyone.
const GATE_COOKIE = "ms_gate";
async function gateToken(path: string) {
  const d = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${path}|macrosnaps-admin-gate`));
  return Array.from(new Uint8Array(d), (b) => b.toString(16).padStart(2, "0")).join("");
}
const notFound = (req: NextRequest) => {
  const r = NextResponse.rewrite(new URL("/__not-found", req.url));
  r.headers.set("x-robots-tag", "noindex, nofollow");
  return r;
};

export async function middleware(req: NextRequest) {
  const country = req.headers.get("x-vercel-ip-country")?.toUpperCase();
  if (country && BLOCKED.has(country)) {
    return new NextResponse(PAGE, { status: 451, headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" } });
  }

  const path = req.nextUrl.pathname;
  const gate = (process.env.ADMIN_GATE_PATH || "").replace(/^\/+|\/+$/g, "");
  const validGate = gate.length >= 16;
  if (validGate && path === `/${gate}`) {
    const res = NextResponse.redirect(new URL("/admin/login", req.url));
    res.cookies.set(GATE_COOKIE, await gateToken(gate), { httpOnly: true, secure: true, sameSite: "strict", path: "/", maxAge: 60 * 60 * 24 * 30 });
    res.headers.set("x-robots-tag", "noindex, nofollow");
    return res;
  }
  if (path === "/admin" || path.startsWith("/admin/") || path.startsWith("/api/admin")) {
    if (!validGate || req.cookies.get(GATE_COOKIE)?.value !== (await gateToken(gate))) return notFound(req);
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow");
    res.headers.set("cache-control", "no-store");
    return res;
  }
  if (path === "/staff" || path.startsWith("/staff/")) {
    const res = NextResponse.next();
    res.headers.set("x-robots-tag", "noindex, nofollow");
    res.headers.set("cache-control", "no-store");
    return res;
  }
  return NextResponse.next();
}

export const config = {
  // Everything except Next.js build assets and the Stripe webhook (Stripe's servers must always reach it).
  matcher: ["/((?!_next/static|_next/image|api/stripe-webhook|api/cron|favicon.ico).*)"],
};
