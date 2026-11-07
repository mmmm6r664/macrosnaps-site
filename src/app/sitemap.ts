import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICES, LOCAL_SLUGS, HUBS } from "@/lib/services";
import { cities, regions } from "@/lib/geo";
import { EVENT_TYPES } from "@/data/eventTypes";
import { VERTICALS } from "@/data/verticals";
import { AUDIENCES } from "@/lib/resources";
import { ALBUMS } from "@/lib/albums";

// Sitemap ids: core pages, one per local service and one per event type
// (each local sitemap = all states/provinces + all cities, < 2,000 URLs, far under the 50,000 limit).
const SITEMAP_IDS = ["core", ...LOCAL_SLUGS, ...EVENT_TYPES.map((e) => e.slug)];
export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

export default async function sitemap(props: { id: Promise<string> | string }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const now = new Date();
  const u = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${SITE.url}${path}`, lastModified: now, changeFrequency: "monthly", priority });
  if (id === "core") {
    return [
      u("/", 1), u("/corporate", 0.9), u("/book", 0.9), u("/locations", 0.8), u("/portfolio", 0.7), u("/about", 0.6), u("/contact", 0.6), u("/faq", 0.5), u("/support", 0.4), u("/investors", 0.4), u("/careers", 0.5), u("/events", 0.8), u("/industries", 0.8), u("/solutions", 0.8), u("/terms", 0.2), u("/privacy", 0.2), u("/legal", 0.2),
      ...SERVICES.map((s) => u(`/${s.slug}`, s.group === "corporate" ? 0.9 : 0.8)),
      ...Object.keys(HUBS).map((h) => u(`/${h}`, 0.8)),
      ...EVENT_TYPES.map((e) => u(`/${e.slug}`, 0.8)),
      ...VERTICALS.map((v) => u(`/${v.kind === "industry" ? "industries" : "solutions"}/${v.slug}`, 0.7)),
      u("/resources", 0.6),
      ...AUDIENCES.map((a) => u(`/resources/${a.slug}`, 0.5)),
      ...ALBUMS.map((a) => u(`/portfolio/${a.slug}`, 0.5)),
    ];
  }
  if (!SITEMAP_IDS.includes(id)) return [];
  const isEvent = EVENT_TYPES.some((e) => e.slug === id);
  return [...regions.map((r) => u(`/${id}/${r.slug}`, isEvent ? 0.6 : 0.7)), ...cities.map((c) => u(`/${id}/${c.slug}`, c.rank <= 10 ? (isEvent ? 0.6 : 0.7) : isEvent ? 0.4 : 0.5))];
}
