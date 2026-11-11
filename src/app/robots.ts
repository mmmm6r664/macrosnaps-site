import type { MetadataRoute } from "next";
import { SITE } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/", "/book/success"] }],
    // One entry point: the sitemap index lists every sitemap group.
    sitemap: `${SITE.url}/sitemap.xml`,
  };
}
