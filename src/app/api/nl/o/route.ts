// Newsletter open pixel.
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";
const GIF = Buffer.from("R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7", "base64");

export async function GET(req: Request) {
  const u = new URL(req.url);
  const n = Number(u.searchParams.get("n")) || 0, t = (u.searchParams.get("t") ?? "").slice(0, 80);
  if (n && t) {
    try {
      await q`insert into newsletter_events (newsletter_id, subscriber_id, kind, ua)
        select ${n}, s.id, 'open', ${(req.headers.get("user-agent") ?? "").slice(0, 200)} from subscribers s where s.token = ${t}
          and exists (select 1 from newsletters where id = ${n})`;
    } catch (e) { console.error("[nl open]", e); }
  }
  return new Response(GIF, { headers: { "content-type": "image/gif", "cache-control": "no-store, max-age=0" } });
}
