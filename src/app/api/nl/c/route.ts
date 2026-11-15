// Newsletter click redirect: logs the click, then sends the reader on to the link.
import { NextResponse } from "next/server";
import { q } from "@/lib/db";
import { sign } from "@/lib/nlTrack";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const p = new URL(req.url).searchParams;
  const n = Number(p.get("n")) || 0, t = (p.get("t") ?? "").slice(0, 80), url = p.get("u") ?? "", s = p.get("s") ?? "";
  if (!/^https?:\/\//.test(url) || s !== sign(n, url)) return NextResponse.redirect(new URL("/", req.url));
  try {
    await q`insert into newsletter_events (newsletter_id, subscriber_id, kind, url, ua)
      select ${n}, s.id, 'click', ${url.slice(0, 1000)}, ${(req.headers.get("user-agent") ?? "").slice(0, 200)} from subscribers s where s.token = ${t}`;
  } catch (e) { console.error("[nl click]", e); }
  return NextResponse.redirect(url, 302);
}
