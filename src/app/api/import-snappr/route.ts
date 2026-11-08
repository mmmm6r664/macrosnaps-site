// One-time import of MacroSnaps' past shoots delivered through Snappr (used with permission) into our own Blob storage.
//   POST ?k=KEY          the browser sends one shoot's photo list {job, meta, photos:[[id,"L"|"P"],...]} (CORS from app.snappr.com)
//   GET  ?k=KEY&jobs=1   list stored shoots
//   GET  ?k=KEY&sheet=job1,job2,...&n=8   numbered contact sheet (base64 JPEG) of n evenly spaced photos per shoot
//   GET  ?k=KEY&import=job&pick=0,3,5     copy the chosen photos (index into that shoot's list) in two sizes
//   GET  ?sheet=N (no key)                the first shoot's contact sheet (kept for compatibility)
// Safe to remove after use.
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { q } from "@/lib/db";
import IDS from "@/data/snapprImport.json";
import { importKey } from "@/lib/snapprKey";

export const maxDuration = 300;
const src = (id: string, w: number) => `https://img.snappr.com/unsafe/fit-in/${w}x0/${id}`;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;
const CORS = { "access-control-allow-origin": "https://app.snappr.com", "access-control-allow-methods": "POST, OPTIONS", "access-control-allow-headers": "content-type" };
const ok = (k: string | null) => !!k && k === importKey();

type Photo = [string, string];
const spread = (list: Photo[], n: number) => {
  if (list.length <= n) return list.map((p, i) => ({ p, i }));
  return Array.from({ length: n }, (_, k) => { const i = Math.round((k * (list.length - 1)) / (n - 1)); return { p: list[i], i }; });
};

async function sheetFor(rows: { label: string; items: { id: string; i: number }[] }[], cols: number) {
  const sharp = (await import("sharp")).default;
  const cw = 225, ch = 150;
  const tiles: { input: Buffer; left: number; top: number }[] = [];
  let r = 0;
  for (const row of rows) {
    for (let k = 0; k < row.items.length; k++) {
      const it = row.items[k];
      const buf = Buffer.from(await (await fetch(src(it.id, 300))).arrayBuffer());
      tiles.push({ input: await sharp(buf).resize(cw, ch, { fit: "contain", background: "#111" }).toBuffer(), left: (k % cols) * cw, top: (r + Math.floor(k / cols)) * ch });
    }
    r += Math.ceil(row.items.length / cols);
  }
  const out = await sharp({ create: { width: cols * cw, height: Math.max(1, r) * ch, channels: 3, background: "#111" } }).composite(tiles).jpeg({ quality: 68 }).toBuffer();
  return out.toString("base64");
}

export async function OPTIONS() { return new NextResponse(null, { status: 204, headers: CORS }); }

export async function POST(req: Request) {
  const u = new URL(req.url);
  if (!ok(u.searchParams.get("k"))) return NextResponse.json({ error: "no" }, { status: 403, headers: CORS });
  const b = JSON.parse(await req.text()) as { job: string; meta: string; photos: Photo[] };
  if (!UUID.test(b.job)) return NextResponse.json({ error: "bad job" }, { status: 400, headers: CORS });
  const photos = (b.photos ?? []).filter((p) => Array.isArray(p) && UUID.test(p[0])).map((p) => [p[0], p[1] === "P" ? "P" : "L"]).slice(0, 3000);
  await q`insert into snappr_jobs (job_id, meta, photos) values (${b.job}, ${String(b.meta ?? "").slice(0, 300)}, ${JSON.stringify(photos)}::jsonb)
    on conflict (job_id) do update set meta = excluded.meta, photos = excluded.photos`;
  return NextResponse.json({ ok: true, n: photos.length }, { headers: CORS });
}

export async function GET(req: Request) {
  const sp = new URL(req.url).searchParams;
  if (!sp.get("k")) {
    if (!sp.has("sheet")) return NextResponse.json({ error: "no" }, { status: 403 });
    const n = Number(sp.get("sheet")) || 0;
    const items = (IDS as Photo[]).slice(n * 30, n * 30 + 30).map(([id], k) => ({ id, i: n * 30 + k }));
    return new NextResponse(await sheetFor([{ label: "", items }], 6), { headers: { "content-type": "text/plain" } });
  }
  if (!ok(sp.get("k"))) return NextResponse.json({ error: "no" }, { status: 403 });
  const parse = (r: { photos: unknown }) => (typeof r.photos === "string" ? JSON.parse(r.photos) : r.photos) as Photo[];
  if (sp.has("jobs")) {
    const rows = await q<{ job_id: string; meta: string; photos: unknown }[]>`select job_id, meta, photos from snappr_jobs order by created_at`;
    return NextResponse.json(rows.map((r) => [r.job_id, r.meta, parse(r).length, parse(r).filter((p) => p[1] === "L").length]));
  }
  if (sp.has("sheet")) {
    const jobs = (sp.get("sheet") ?? "").split(",").filter((j) => UUID.test(j)).slice(0, 8);
    const n = Math.min(12, Number(sp.get("n")) || 8);
    const rows = [];
    for (const j of jobs) {
      const [r] = await q<{ photos: unknown }[]>`select photos from snappr_jobs where job_id = ${j}`;
      if (!r) continue;
      rows.push({ label: j, items: spread(parse(r), n).map(({ p, i }) => ({ id: p[0], i })) });
    }
    return new NextResponse(await sheetFor(rows, n), { headers: { "content-type": "text/plain" } });
  }
  if (sp.has("picks")) {
    const rows = await q<{ job_id: string; meta: string; picks: unknown }[]>`select job_id, meta, picks from snappr_jobs where picks is not null order by created_at`;
    return NextResponse.json(rows.map((r) => [r.job_id, r.meta, typeof r.picks === "string" ? JSON.parse(r.picks) : r.picks]));
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Blob not connected" }, { status: 503 });
  if (sp.has("imp")) {
    // imp=job:k,k,k;job2:k,k  (k = position on that shoot's contact sheet row)
    const res: Record<string, string> = {};
    await Promise.all((sp.get("imp") ?? "").split(";").filter(Boolean).slice(0, 8).map(async (part) => {
      const [job, ks] = part.split(":");
      const [r] = await q<{ photos: unknown }[]>`select photos from snappr_jobs where job_id = ${job}`;
      if (!r) { res[job] = "unknown"; return; }
      const n = Math.min(12, Number(sp.get("n")) || 8);
      const sel = spread(parse(r), n);
      const chosen = (ks ?? "").split(",").filter(Boolean).map(Number).filter((k) => sel[k]).map((k) => sel[k].p);
      const good: Photo[] = [];
      await Promise.all(chosen.map(async ([id, o]) => {
        try {
          for (const w of [2000, 800]) {
            const f = await fetch(src(id, w));
            if (!f.ok || !(f.headers.get("content-type") ?? "").startsWith("image/")) throw new Error(String(f.status));
            await put(`portfolio/snappr-${id}-${w}.jpg`, Buffer.from(await f.arrayBuffer()), { access: "public", contentType: "image/jpeg", addRandomSuffix: false });
          }
          good.push([id, o]);
        } catch { /* skipped */ }
      }));
      await q`update snappr_jobs set picks = ${JSON.stringify(good)}::jsonb where job_id = ${job}`;
      res[job.slice(0, 8)] = `${good.length}/${chosen.length}`;
    }));
    return NextResponse.json(res);
  }
  const job = sp.get("import") ?? "";
  const [r] = await q<{ photos: unknown }[]>`select photos from snappr_jobs where job_id = ${job}`;
  if (!r) return NextResponse.json({ error: "unknown job" }, { status: 404 });
  const list = parse(r);
  const n = Math.min(12, Number(sp.get("n")) || 8);
  const idx = new Set(spread(list, n).map((x) => x.i));
  const pick = (sp.get("pick") ?? "").split(",").filter(Boolean).map(Number).filter((i) => idx.has(i)).slice(0, 12);
  const out: { id: string; o: string; error?: string }[] = [];
  await Promise.all(pick.map(async (i) => {
    const [id, o] = list[i];
    try {
      for (const w of [2000, 800]) {
        const res = await fetch(src(id, w));
        if (!res.ok || !(res.headers.get("content-type") ?? "").startsWith("image/")) throw new Error(`fetch ${res.status}`);
        await put(`portfolio/snappr-${id}-${w}.jpg`, Buffer.from(await res.arrayBuffer()), { access: "public", contentType: "image/jpeg", addRandomSuffix: false });
      }
      out.push({ id, o });
    } catch (e) { out.push({ id, o, error: String(e).slice(0, 100) }); }
  }));
  return NextResponse.json({ out });
}
