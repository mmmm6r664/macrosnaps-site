import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { SERVICES, LOCAL_SLUGS, HUBS } from "@/lib/services";
import { cities, regions } from "@/lib/geo";

// One sitemap per local service (each < 2,000 URLs) plus one for core pages.
export async function generateSitemaps() {
  return [{ id: "core" }, ...LOCAL_SLUGS.map((id) => ({ id }))];
}

export default async function sitemap(props: { id: Promise<string> | string }): Promise<MetadataRoute.Sitemap> {
  const id = await props.id;
  const now = new Date();
  const u = (path: string, priority: number): MetadataRoute.Sitemap[number] => ({ url: `${SITE.url}${path}`, lastModified: now, changeFrequency: "monthly", priority });
  if (id === "core") {
    return [
      u("/", 1), u("/corporate", 0.9), u("/book", 0.9), u("/locations", 0.8), u("/portfolio", 0.7), u("/about", 0.6), u("/contact", 0.6), u("/faq", 0.5), u("/terms", 0.2), u("/privacy", 0.2),
      ...SERVICES.map((s) => u(`/${s.slug}`, s.group === "corporate" ? 0.9 : 0.8)),
      ...Object.keys(HUBS).map((h) => u(`/${h}`, 0.8)),
    ];
  }
  return [...regions.map((r) => u(`/${id}/${r.slug}`, 0.7)), ...cities.map((c) => u(`/${id}/${c.slug}`, c.rank <= 10 ? 0.7 : 0.5))];
}
