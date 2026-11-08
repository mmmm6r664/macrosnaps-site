// Client galleries (public Google Drive albums) shown on the Portfolio page and on one page per album.
// Hand-picked photos are copied into our own storage (src/data/drivePhotos.json maps Drive file id → hosted URLs);
// the full album is embedded from Drive.
import albums from "@/data/albums.json";
import hosted from "@/data/drivePhotos.json";

type Hosted = Record<string, { large: string; small: string }>;
const H = hosted as Hosted;
type Pick = { id: string; tags: string[]; alt: string; banner?: boolean };
type Raw = { source?: string; folderId: string; displayTitle: string; category: string; eventType: string; photoCount: number; date?: string; picks: Pick[] };

export const CATEGORIES: Record<string, { label: string; service: string; serviceName: string }> = {
  wedding: { label: "Weddings", service: "/wedding-photography", serviceName: "wedding photography" },
  engagement: { label: "Engagements", service: "/engagement-photography", serviceName: "engagement photography" },
  cultural: { label: "Weddings", service: "/indian-wedding-photography", serviceName: "cultural wedding photography" },
  conference: { label: "Conferences", service: "/conference-photography", serviceName: "conference photography" },
  corporate: { label: "Corporate events", service: "/corporate-event-photography", serviceName: "corporate event photography" },
  gala: { label: "Galas & parties", service: "/gala-fundraiser-photography", serviceName: "gala photography" },
  party: { label: "Galas & parties", service: "/event-photography", serviceName: "event photography" },
  family: { label: "Family & baby", service: "/family-photography", serviceName: "family photography" },
  baby: { label: "Family & baby", service: "/gender-reveal-baby-shower-photography", serviceName: "baby shower photography" },
  headshots: { label: "Headshots", service: "https://macroheadshots.com/", serviceName: "headshot photography" },
  newborn: { label: "Family & baby", service: "/newborn-photography", serviceName: "newborn photography" },
  maternity: { label: "Family & baby", service: "/maternity-photography", serviceName: "maternity photography" },
  graduation: { label: "Graduations", service: "/graduation-photography", serviceName: "graduation photography" },
  food: { label: "Food & commercial", service: "/food-photography", serviceName: "food photography" },
  commercial: { label: "Food & commercial", service: "/commercial-photography", serviceName: "commercial photography" },
};

const slugify = (s: string) => s.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").replace(/[\s_·]+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 70);

export type Album = Raw & { slug: string; photos: (Pick & { src: string })[]; cover?: string; group: string };
const seen = new Map<string, number>();
export const ALBUMS: Album[] = (albums as Raw[])
  .map((a) => {
    let slug = slugify(a.displayTitle) || a.folderId.slice(0, 10);
    const n = (seen.get(slug) ?? 0) + 1;
    seen.set(slug, n);
    if (n > 1) slug = `${slug}-${n}`;
    const photos = a.picks.filter((p) => H[p.id]).map((p) => ({ ...p, src: H[p.id].large }));
    return { ...a, slug, photos, cover: (photos.find((p) => p.banner) ?? photos[0])?.src, group: CATEGORIES[a.category]?.label ?? "Events" };
  })
  .filter((a) => a.photos.length)
  .sort((x, y) => (y.date ?? "").localeCompare(x.date ?? ""));

export const albumBySlug = (slug: string) => ALBUMS.find((a) => a.slug === slug);
export const driveFolderUrl = (id: string) => `https://drive.google.com/drive/folders/${id}`;
export const driveEmbedUrl = (id: string) => `https://drive.google.com/embeddedfolderview?id=${id}#grid`;

/** Hand-picked standout galleries shown first on the Portfolio page (matched by title; missing ones are skipped). */
const FEATURED_TITLES = [
  "FIX Trading Conference · October 2026",
  "Garden Wedding · October 2026",
  "Quality Trust Gala 2025",
  "Nikkah Ceremony · October 2024",
  "Healthcare Conference · October 2026",
  "Waterfront Wedding · August 2026",
  "Haldi Ceremony · November 2025",
  "IBM Event · November 2025",
  "Indian Engagement Session · July 2025",
  "Bat Mitzvah · April 2025",
  "Manufacturing Plant Team Photos · February 2024",
  "Newborn Session · Hoboken · March 2022",
];
export const FEATURED: Album[] = FEATURED_TITLES.map((t) => ALBUMS.find((a) => a.displayTitle === t)).filter((a): a is Album => !!a);
