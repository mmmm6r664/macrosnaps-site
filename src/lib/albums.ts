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
  // Albums with only one or two usable photos are too thin to show.
  .filter((a) => a.photos.length >= 3)
  .sort((x, y) => (y.date ?? "").localeCompare(x.date ?? ""));

export const albumBySlug = (slug: string) => ALBUMS.find((a) => a.slug === slug);
export const driveFolderUrl = (id: string) => `https://drive.google.com/drive/folders/${id}`;
export const driveEmbedUrl = (id: string) => `https://drive.google.com/embeddedfolderview?id=${id}#grid`;

/** Hand-picked standout galleries shown first on the Portfolio page (by slug; missing ones are skipped). */
const FEATURED_SLUGS = [
  "fix-trading-conference-october-2026",
  "garden-wedding-october-2026",
  "maternity-session-jersey-city-february-2022",
  "quality-trust-gala-2025",
  "nikkah-ceremony-october-2024",
  "graduation-portraits-new-york-may-2022-2",
  "healthcare-conference-october-2026",
  "engagement-session-warwick-september-2022",
  "waterfront-wedding-august-2026",
  "portrait-session-alexandria-december-2021",
  "haldi-ceremony-november-2025",
  "newborn-session-hoboken-march-2022",
  "ibm-event-november-2025",
  "family-session-washington-december-2021",
  "indian-engagement-session-july-2025",
  "restaurant-chef-photos-new-york-may-2022",
  "bat-mitzvah-april-2025",
  "manufacturing-plant-team-photos-february-2024",
];
export const FEATURED: Album[] = FEATURED_SLUGS.map((s) => albumBySlug(s)).filter((a): a is Album => !!a);
