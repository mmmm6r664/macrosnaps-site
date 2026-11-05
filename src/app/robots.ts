import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";
import { LOCAL_SLUGS } from "@/lib/services";
import { EVENT_TYPES } from "@/data/eventTypes";
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/book/success"] }],
    sitemap: ["core", ...LOCAL_SLUGS, ...EVENT_TYPES.map((e) => e.slug)].map((id) => `${SITE.url}/sitemap/${id}.xml`),
  };
}
