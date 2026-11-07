// One-time import: copies chosen photos from MacroSnaps' public Google Drive albums into our own Blob storage
// (two sizes) so the website never depends on Drive. Protected by CRON_SECRET; safe to remove after use.
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 300;

export async function POST(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Blob not connected" }, { status: 503 });
  const { ids } = (await req.json()) as { ids: string[] };
  const out: { id: string; large?: string; small?: string; error?: string }[] = [];
  for (const id of (ids ?? []).filter((x) => /^[\w-]{20,60}$/.test(x)).slice(0, 25)) {
    try {
      const r: Record<string, string> = {};
      for (const [k, w] of [["large", 2000], ["small", 800]] as const) {
        const res = await fetch(`https://drive.google.com/thumbnail?id=${id}&sz=w${w}`, { redirect: "follow" });
        const type = res.headers.get("content-type") ?? "";
        if (!res.ok || !type.startsWith("image/")) throw new Error(`fetch ${res.status} ${type}`);
        const b = await put(`portfolio/${id}-${w}.jpg`, Buffer.from(await res.arrayBuffer()), { access: "public", contentType: "image/jpeg", addRandomSuffix: false });
        r[k] = b.url;
      }
      out.push({ id, large: r.large, small: r.small });
    } catch (e) { out.push({ id, error: String(e).slice(0, 200) }); }
  }
  return NextResponse.json({ out });
}
