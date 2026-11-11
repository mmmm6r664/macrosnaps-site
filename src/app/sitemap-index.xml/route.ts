import { SITE } from "@/lib/site";
import { SITEMAP_IDS } from "@/lib/sitemaps";
import { groupLastModified } from "@/lib/lastmod";

export const revalidate = 86400;

/** Sitemap index, served at /sitemap.xml (rewrite in next.config): one entry point that lists every sitemap group,
 *  each with the date of the newest content change it contains (omitted when no change has been recorded yet). */
export async function GET() {
  const dates = await groupLastModified();
  const items = SITEMAP_IDS.map((id) => {
    const at = dates.get(id);
    return `  <sitemap>\n    <loc>${SITE.url}/sitemap/${id}.xml</loc>${at ? `\n    <lastmod>${at.toISOString()}</lastmod>` : ""}\n  </sitemap>`;
  }).join("\n");
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${items}\n</sitemapindex>\n`;
  return new Response(xml, { headers: { "content-type": "application/xml; charset=utf-8", "cache-control": "public, max-age=3600" } });
}
