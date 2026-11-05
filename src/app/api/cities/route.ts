import { NextResponse } from "next/server";
import { cities, cityLabel, regions } from "@/lib/geo";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const INDEX = [
  ...cities.map((c) => ({ key: norm(`${c.name} ${c.state} ${c.stateName}`), name: norm(c.name), slug: c.slug, label: cityLabel(c), pop: c.population, type: "city" as const })),
  ...regions.map((r) => ({ key: norm(`${r.name} ${r.code}`), name: norm(r.name), slug: r.slug, label: r.name, pop: 1e9, type: "region" as const })),
];

export const revalidate = 86400;

export async function GET(req: Request) {
  const q = norm(new URL(req.url).searchParams.get("q") ?? "").trim().replace(/,/g, " ").replace(/\s+/g, " ");
  if (q.length < 2) return NextResponse.json([]);
  const words = q.split(" ");
  const hits = INDEX.filter((e) => words.every((w) => e.key.includes(w)))
    .sort((a, b) => Number(b.name.startsWith(q)) - Number(a.name.startsWith(q)) || b.pop - a.pop)
    .slice(0, 8)
    .map(({ slug, label, type }) => ({ slug, label, type }));
  return NextResponse.json(hits, { headers: { "Cache-Control": "public, max-age=3600, s-maxage=86400" } });
}
