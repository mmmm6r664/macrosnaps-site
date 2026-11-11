import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICES, HUBS } from "@/lib/services";
import { cities, regions } from "@/lib/geo";
import { EVENT_TYPES } from "@/data/eventTypes";
import { VERTICALS } from "@/data/verticals";
import { AUDIENCES } from "@/lib/resources";
import { ALBUMS } from "@/lib/albums";
import { RATES, EDIT_RATES } from "@/lib/pricing";
import { cityContent, regionContent, resolveTarget } from "@/lib/content";
import { getEventType, eventCityContent, eventRegionContent } from "@/lib/eventLocal";
import { lastModified, type Versioned } from "@/lib/lastmod";
import { SITEMAP_IDS } from "@/lib/sitemaps";

// One sitemap per group: core pages, one per local service and one per event type
// (each local sitemap = all states/provinces + all cities, < 2,000 URLs, far under the 50,000 limit).
// /sitemap.xml is the index that lists them all (see src/app/sitemap-index.xml/route.ts).
export const revalidate = 86400;

export async function generateSitemaps() {
  return SITEMAP_IDS.map((id) => ({ id }));
}

type Entry = { path: string; priority: number; content?: unknown };
const PRICES = { RATES, EDIT_RATES };

/** Each URL with the data its page is built from, so lastmod reflects real content changes. Pages whose content
 *  lives only in page code (about, terms…) carry no content and are listed without a lastmod. */
function entries(id: string): Entry[] {
  if (id === "core") {
    const plain = (path: string, priority: number): Entry => ({ path, priority });
    return [
      plain("/", 1), plain("/corporate", 0.9), plain("/book", 0.9), plain("/locations", 0.8), { path: "/portfolio", priority: 0.7, content: ALBUMS.map((a) => [a.slug, a.cover]) },
      plain("/about", 0.6), plain("/contact", 0.6), plain("/faq", 0.5), plain("/support", 0.4), plain("/investors", 0.4), plain("/careers", 0.5),
      { path: "/events", priority: 0.8, content: EVENT_TYPES.map((e) => [e.slug, e.name]) }, { path: "/industries", priority: 0.8, content: VERTICALS.filter((v) => v.kind === "industry").map((v) => v.slug) },
      { path: "/solutions", priority: 0.8, content: VERTICALS.filter((v) => v.kind !== "industry").map((v) => v.slug) }, plain("/terms", 0.2), plain("/privacy", 0.2), plain("/legal", 0.2),
      ...SERVICES.map((s) => ({ path: `/${s.slug}`, priority: s.group === "corporate" ? 0.9 : 0.8, content: [s, PRICES] })),
      ...Object.entries(HUBS).map(([h, hub]) => ({ path: `/${h}`, priority: 0.8, content: [hub, PRICES] })),
      ...EVENT_TYPES.map((e) => ({ path: `/${e.slug}`, priority: 0.8, content: [e, PRICES] })),
      ...VERTICALS.map((v) => ({ path: `/${v.kind === "industry" ? "industries" : "solutions"}/${v.slug}`, priority: 0.7, content: v })),
      { path: "/resources", priority: 0.6, content: AUDIENCES.map((a) => a.slug) },
      ...AUDIENCES.map((a) => ({ path: `/resources/${a.slug}`, priority: 0.5, content: a })),
      ...ALBUMS.map((a) => ({ path: `/portfolio/${a.slug}`, priority: 0.5, content: a })),
    ];
  }
  const ev = getEventType(id);
  if (ev) {
    return [
      ...regions.map((r) => ({ path: `/${id}/${r.slug}`, priority: 0.6, content: [eventRegionContent(ev, r), PRICES] })),
      ...cities.map((c) => ({ path: `/${id}/${c.slug}`, priority: c.rank <= 10 ? 0.6 : 0.4, content: [eventCityContent(ev, c), PRICES] })),
    ];
  }
  const t = resolveTarget(id);
  if (!t) return [];
  return [
    ...regions.map((r) => ({ path: `/${id}/${r.slug}`, priority: 0.7, content: [regionContent(t, r), PRICES] })),
    ...cities.map((c) => ({ path: `/${id}/${c.slug}`, priority: c.rank <= 10 ? 0.7 : 0.5, content: [cityContent(t, c), PRICES] })),
  ];
}

export default async function sitemap(props: { id: Promise<string> | string }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  if (!SITEMAP_IDS.includes(id)) return [];
  const list = entries(id);
  const dates = await lastModified(id, list.filter((e) => e.content !== undefined).map((e): Versioned => ({ url: e.path, content: e.content })));
  return list.map((e) => {
    const at = dates.get(e.path);
    return { url: `${SITE.url}${e.path}`, priority: e.priority, ...(at ? { lastModified: at } : {}) };
  });
}
