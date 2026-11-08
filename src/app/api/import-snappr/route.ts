// One-time import of MacroSnaps' own industrial shoot (delivered via Snappr, used with permission) into Blob storage.
// ?sheet=N returns a numbered contact sheet (base64 JPEG) for choosing photos; ?part=N copies 10 photos in two sizes.
// Only the fixed list of photo IDs below can be fetched, so the route is harmless if called by anyone else. Safe to remove after use.
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import IDS from "@/data/snapprImport.json";

export const maxDuration = 300;
const LIST = IDS as [string, string][];
const src = (id: string, w: number) => `https://img.snappr.com/unsafe/fit-in/${w}x0/${id}`;

async function sheet(n: number) {
  const sharp = (await import("sharp")).default;
  const per = 30, cols = 6, cw = 300, ch = 200;
  const items = LIST.slice(n * per, n * per + per);
  const tiles = await Promise.all(items.map(async ([id], k) => {
    const buf = Buffer.from(await (await fetch(src(id, 400))).arrayBuffer());
    const img = await sharp(buf).resize(cw, ch, { fit: "contain", background: "#111" }).toBuffer();
    const label = Buffer.from(`<svg width="40" height="22"><rect width="40" height="22" fill="#ff0"/><text x="4" y="17" font-size="16" font-family="Arial" font-weight="bold">${n * per + k}</text></svg>`);
    return { input: await sharp(img).composite([{ input: label, top: 0, left: 0 }]).toBuffer(), left: (k % cols) * cw, top: Math.floor(k / cols) * ch };
  }));
  const rows = Math.ceil(items.length / cols);
  const out = await sharp({ create: { width: cols * cw, height: rows * ch, channels: 3, background: "#111" } }).composite(tiles).jpeg({ quality: 70 }).toBuffer();
  return out.toString("base64");
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  if (sp.has("sheet")) return new NextResponse(await sheet(Number(sp.get("sheet")) || 0), { headers: { "content-type": "text/plain" } });
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Blob not connected" }, { status: 503 });
  const only = (sp.get("ids") ?? "").split(",").filter(Boolean);
  const part = Number(sp.get("part") ?? 0);
  const pool = only.length ? LIST.filter(([id]) => only.includes(id)) : LIST.slice(part * 10, part * 10 + 10);
  const out: { id: string; large?: string; small?: string; error?: string }[] = [];
  for (const [id] of pool.slice(0, 12)) {
    try {
      const r: Record<string, string> = {};
      for (const [k, w] of [["large", 2000], ["small", 800]] as const) {
        const res = await fetch(src(id, w));
        const type = res.headers.get("content-type") ?? "";
        if (!res.ok || !type.startsWith("image/")) throw new Error(`fetch ${res.status} ${type}`);
        const b = await put(`portfolio/snappr-${id}-${w}.jpg`, Buffer.from(await res.arrayBuffer()), { access: "public", contentType: "image/jpeg", addRandomSuffix: false });
        r[k] = b.url;
      }
      out.push({ id, large: r.large, small: r.small });
    } catch (e) { out.push({ id, error: String(e).slice(0, 200) }); }
  }
  return NextResponse.json({ out });
}
