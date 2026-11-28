// First-party, cookie-free page analytics: one row per page view, plus time-on-page pings.
import { createHash } from "crypto";
import { q } from "@/lib/db";
import { limited } from "@/lib/rateLimit";

export const dynamic = "force-dynamic";
const BOT = /bot|crawl|spider|slurp|preview|headless|lighthouse|pingdom|uptime|monitor|facebookexternalhit|curl|wget|python|axios|node-fetch/i;
const SOCIAL: [RegExp, string][] = [[/facebook|fb\.|messenger/, "Facebook"], [/instagram/, "Instagram"], [/pinterest|pin\.it/, "Pinterest"], [/linkedin|lnkd/, "LinkedIn"], [/t\.co$|twitter|x\.com/, "X / Twitter"], [/youtube|youtu\.be/, "YouTube"], [/tiktok/, "TikTok"], [/reddit/, "Reddit"], [/threads\.net/, "Threads"], [/yelp/, "Yelp"]];
const SEARCH: [RegExp, string][] = [[/google\./, "Google"], [/bing\./, "Bing"], [/yahoo\./, "Yahoo"], [/duckduckgo/, "DuckDuckGo"], [/ecosia/, "Ecosia"], [/baidu/, "Baidu"], [/yandex/, "Yandex"], [/chatgpt|openai/, "ChatGPT"], [/perplexity/, "Perplexity"], [/claude\.ai/, "Claude"], [/gemini\.google/, "Gemini"]];
const MAIL = /mail\.|outlook|gmail/;

function classify(ref: string, utm: { s?: string; m?: string }, host: string) {
  const um = (utm.m ?? "").toLowerCase(), us = (utm.s ?? "").toLowerCase();
  if (us || um) {
    const medium = /cpc|ppc|paid|ads?$/.test(um) ? "paid" : /email|newsletter/.test(um) ? "email" : /social/.test(um) ? "social" : um ? "referral" : "referral";
    return { source: us || um, medium };
  }
  let h = "";
  try { h = ref ? new URL(ref).hostname.replace(/^www\./, "") : ""; } catch { h = ""; }
  if (!h || h.endsWith(host)) return { source: "Direct", medium: "direct", h: "" };
  for (const [re, n] of SEARCH) if (re.test(h)) return { source: n, medium: /chatgpt|openai|perplexity|claude|gemini/.test(h) ? "ai" : "organic", h };
  for (const [re, n] of SOCIAL) if (re.test(h)) return { source: n, medium: "social", h };
  if (MAIL.test(h)) return { source: h, medium: "email", h };
  return { source: h, medium: "referral", h };
}

export async function POST(req: Request) {
  const ua = req.headers.get("user-agent") ?? "";
  if (BOT.test(ua)) return new Response(null, { status: 204 });
  if (limited(`t:${(req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim()}`, 120, 60_000)) return new Response(null, { status: 429 });
  let b: { k?: string; id?: number; ms?: number; sid?: string; p?: string; r?: string; us?: string; um?: string; uc?: string } = {};
  try { b = JSON.parse(await req.text()); } catch { return new Response(null, { status: 204 }); }
  try {
    if (b.k === "ping") {
      const ms = Math.min(Math.max(Number(b.ms) || 0, 0), 30 * 60 * 1000);
      if (b.id && b.sid) await q`update site_visits set duration_ms = greatest(duration_ms, ${ms}) where id = ${Number(b.id)} and sid = ${String(b.sid).slice(0, 40)}`;
      return new Response(null, { status: 204 });
    }
    const path = String(b.p ?? "/").slice(0, 300);
    if (/^\/(admin|staff|account|api|ms-)/.test(path)) return new Response(null, { status: 204 });
    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const day = new Date().toISOString().slice(0, 10);
    const vid = createHash("sha256").update(`${ip}|${ua}|${day}|${process.env.CRON_SECRET ?? "ms"}`).digest("base64url").slice(0, 22);
    const host = new URL(req.url).hostname.replace(/^www\./, "");
    const c = classify(String(b.r ?? ""), { s: b.us?.slice(0, 80), m: b.um?.slice(0, 80) }, host);
    const device = /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|iphone|android/i.test(ua) ? "Mobile" : "Desktop";
    const browser = /edg\//i.test(ua) ? "Edge" : /chrome|crios/i.test(ua) ? "Chrome" : /safari/i.test(ua) ? "Safari" : /firefox|fxios/i.test(ua) ? "Firefox" : "Other";
    const dec = (v: string | null) => { try { return v ? decodeURIComponent(v) : null; } catch { return v; } };
    const [r] = await q<{ id: number }[]>`insert into site_visits (vid, sid, path, ref_host, source, medium, campaign, country, region, city, device, browser)
      values (${vid}, ${String(b.sid ?? vid).slice(0, 40)}, ${path}, ${("h" in c ? c.h : "") || null}, ${c.source.slice(0, 80)}, ${c.medium}, ${b.uc?.slice(0, 120) || null},
        ${req.headers.get("x-vercel-ip-country")}, ${req.headers.get("x-vercel-ip-country-region")}, ${dec(req.headers.get("x-vercel-ip-city"))}, ${device}, ${browser}) returning id`;
    return Response.json({ id: r.id });
  } catch (e) {
    console.error("[t]", e);
    return new Response(null, { status: 204 });
  }
}
