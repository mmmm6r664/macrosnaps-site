// One-time import: copies chosen photos from MacroSnaps' public Google Drive albums into our own Blob storage
// (two sizes) so the website never depends on Drive. Safe to remove after use.
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 300;

// Only these hand-picked photos can be imported, so the route is harmless if called by anyone else.
const ALLOWED = ["1u1loA8qHbUDxparrUfFt0kG7N_AvpSpe", "1-5KYpwoWuCDh3vdFO43F8eKnTzNtLL8H", "1o8m7_2FETgW4Mm4qdeovgnXxU_MD_chu", "1-Qt3d7JZJDy5pL8Pi_wBR42cfMeZtY8X", "1syTdevblvaC4xkeE3WPhScSw3boIQmPN", "1SfxBEcAtLmqb6X2qy3Ncq50p9S9XuTsJ", "1aCx3Ky-2DQ10925ooQJZaDMZWzsQCFb4", "1pQhsafsR3Cf8a_s7o5-q61RwwLSaLAM7", "1eV0UdJyRO3pnvQo58WEwotP2I5YCYiaJ", "1QiyvlsaRWlo-zIvvXImC-0SiTiMKxBjn", "1T78Z4FKMz0wt_0Md2oPlsZrEhQjWfpjR", "1h0aWf1DgpSLi46BKUk6JHoqQxiovEkBq", "1gczXn8dDdM49Ay_7bhQP-CCwHEU3Pr2K", "1kcI30_LgEEk2AHLHbh3zfwZBFcC5sV6r", "1nO-ns4bqsqGzRABx_3sA4_ge3LV4prYy", "18Kw9EgE6CrMk5sKBxIm85E5WzrzFPbIR", "1ZwizKcMeeUHXZWzdulvtBaF-RJ3lGD26", "1r4Nl6wkbkqPfDh0qcALSQG3FCTQQSQC0", "1Uyd4HIlalah97WMRtRGo8VJVKPMLrrNg", "11Aywqkf2SVJ5trbzAtKXiRaU12r0LA4C", "1Gt44UFKjYF6pVjyHXWyTHPIgGTjRqRNz", "17lySduabl33LeqiovUOltv0fyek5oQxg"];

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
