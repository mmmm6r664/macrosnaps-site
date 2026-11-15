// One-time import: copies chosen photos from MacroSnaps' public Google Drive albums into our own Blob storage
// (two sizes) so the website never depends on Drive. Safe to remove after use.
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 300;

// Only these hand-picked photos can be imported, so the route is harmless if called by anyone else.
const ALLOWED = ["11ejLpnvEm0A-cgHi5ofb4QI5z4dgrdW6", "1SooDs3NmuMO6t8iyflLEyAlTij89-Ipx", "14vhpDtQaJSaVqbC3w2aR3wcaHDhkLubf", "1k3hMrEurS2veiS2n6b9k75cxwPCsKFPQ", "1Ax_9fiHCMDOAQPcGAFrrrjUvDuqMlTkz", "1XARWC7cO0ITu4UGWoveDX6IWLIZwxA51", "1kPHovDASQKeSsWn359LOBxpcXYxhtx5N", "1VtD_8OMl-6k3sXviZJ7ABfFWWnrhq7-X", "1n0LuxkPW_3P2SBsg0M8UBXslzg1-rrKs", "1TrlRnM85KF9omG67Is2LLNhGsWDd65QW", "1Ok_ZGzP1kGYFU6nn5TzUvWHCf9Y1v05u", "19Bam00xC4KqHi_XSOrBg83xdvnPYSVSN", "11j7ntSH0x0XoE7F-5XEBjiYAnrwE7Bv2", "1HxcxfxFlBLG6aMPc0nFSVtdKwSqUZOSd", "1aK3rE4zf9IvWtk155ESxjm22ZZAg1cZh", "10M2g9Qm6OuKi-4b4xVwbMqOCeVAbeJ7L"];

export async function GET(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Blob not connected" }, { status: 503 });
  const part = Number(new URL(req.url).searchParams.get("part") ?? 0);
  const ids = ALLOWED.slice(part * 10, part * 10 + 10);
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
