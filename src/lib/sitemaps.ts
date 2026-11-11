import { LOCAL_SLUGS } from "@/lib/services";
import { EVENT_TYPES } from "@/data/eventTypes";

/** Sitemap groups: core pages, one per local service, one per event type. Each is /sitemap/<id>.xml; /sitemap.xml indexes them. */
export const SITEMAP_IDS = ["core", ...LOCAL_SLUGS, ...EVENT_TYPES.map((e) => e.slug)];
