// MacroSnaps' own photos, hand-tagged by subject (src/data/photos.json).
// Only MacroSnaps' own work is used in galleries: no stock (Unsplash / stock libraries), no duplicates, no graphics.
import catalog from "@/data/photos.json";
import illustrations from "@/data/illustrations.json";

export type Photo = { src: string; tags: string[]; alt: string; orient?: string; banner?: boolean };
const PHOTOS = catalog as Photo[];
const ILLUS = illustrations as Photo[];
const ALT = new Map<string, string>([...PHOTOS, ...ILLUS].map((p) => [p.src, p.alt]));

/** Own photos having any of the tags, in catalog order. */
export const byTags = (...tags: string[]) => {
  // Priority order: every photo with the first tag, then the second tag, …
  const out: string[] = [];
  for (const t of tags) for (const p of PHOTOS) if (p.tags.includes(t) && !out.includes(p.src)) out.push(p.src);
  return out;
};
/** Illustrative (non-portfolio) images for subjects we have no own photos of — never used in "Our Work" galleries. */
export const illustrationsFor = (...tags: string[]) => ILLUS.filter((p) => p.tags.some((t) => tags.includes(t))).map((p) => p.src);
export const altFor = (src: string) => ALT.get(src);
const BANNER = new Set(PHOTOS.filter((p) => p.banner).map((p) => p.src));
/** Photos that still read well in wide crops (heroes, banners): wide-safe first, others never in wide slots. */
export const bannerSafe = (list: string[]) => list.filter((s) => BANNER.has(s) || s.includes("ytimg.com"));
export const isBannerSafe = (src?: string) => !!src && (BANNER.has(src) || src.includes("ytimg.com"));

const W = "https://static.wixstatic.com/media/";

export const IMG = {
  hero: `${W}1f3625_d2741b395b5d446da5d8ca57e5f286b2~mv2.jpg`,
  about: `${W}1f3625_79013331208a4ec8826fcde024545575~mv2.jpg`,
  conferenceHero: `${W}b8cb3c_af143925a50c4d24a9cdd29895d94165~mv2.jpg`, // audience in a darkened auditorium (wide-safe)
  conference: byTags("conference"),
  corporate: byTags("corporate", "gala"),
  conferenceVideo: byTags("conference"),
  wedding: byTags("wedding"),
  engagement: byTags("engagement"),
  event: byTags("event", "party", "gala"),
  personal: byTags("family", "maternity", "newborn", "graduation", "portrait"),
  portfolio: [...byTags("wedding").slice(0, 6), ...byTags("conference").slice(0, 4), ...byTags("engagement").slice(0, 3), ...byTags("family").slice(0, 3)],
  commercial: byTags("studio", "corporate"),
  realEstate: byTags("realestate"),
};

/** Which subjects belong on each service page. */
const SERVICE_TAGS: Record<string, string[]> = {
  "conference-photography": ["conference"],
  "corporate-event-photography": ["corporate", "gala"],
  "trade-show-photography": ["tradeshow", "conference"],
  "conference-videography": ["conference"],
  "corporate-videography": ["corporate", "conference"],
  "event-photography": ["party", "gala", "event"],
  "event-videography": ["party", "gala", "event"],
  "wedding-photography": ["wedding"],
  "wedding-videography": ["wedding"],
  "engagement-photography": ["engagement"],
  "engagement-videography": ["engagement"],
  "commercial-photography": ["studio", "commercial"],
  "commercial-videography": ["studio", "commercial"],
  "product-photography": ["product", "studio"],
  "food-photography": ["food"],
  "real-estate-photography": ["realestate"],
  "real-estate-videography": ["realestate"],
  "music-videography": ["music"],
  "family-photography": ["family"],
  "maternity-photography": ["maternity"],
  "newborn-photography": ["newborn"],
  "graduation-photography": ["graduation"],
  "dating-photography": ["dating", "portrait"],
  "live-stream": ["conference"],
  "photo-booth": ["photobooth", "party"],
  "video-editing": ["conference", "wedding"],
  "photo-retouching": ["retouching"],
  virtualtours: ["realestate"],
};
export const serviceTags = (slug: string) => SERVICE_TAGS[slug] ?? ["conference"];
/** Own photos for a service page. */
export const photosForService = (slug: string) => byTags(...serviceTags(slug));
/** Hero image for a service: own photo first, an illustration if we have none. */
export const heroForService = (slug: string) => bannerSafe(photosForService(slug))[0] ?? illustrationsFor(...serviceTags(slug))[0];

/** Hands out photos for one page so the same photo never appears twice on that page. */
export function photoPicker() {
  const used = new Set<string>();
  const take = (src: string) => (used.add(src), src);
  return {
    use: (src: string) => take(src),
    one: (...lists: string[][]) => {
      for (const l of lists) for (const s of l) if (!used.has(s)) return take(s);
      return lists.flat()[0] ?? IMG.hero;
    },
    many: (n: number, ...lists: string[][]) => {
      const out: string[] = [];
      for (const s of lists.flat()) {
        if (out.length >= n) break;
        if (!used.has(s)) out.push(take(s));
      }
      return out;
    },
  };
}

/** Rotate a list by a seed so different pages lead with different photos. */
export const rotate = <T,>(list: T[], seed: number) => (list.length ? [...list.slice(seed % list.length), ...list.slice(0, seed % list.length)] : list);
