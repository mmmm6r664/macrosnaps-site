// Where each old Wix blog post (/post/<slug>) now lives. Built from the URLs Google had indexed and sent traffic to
// before launch (Search Console, Oct 2026): every post goes to the closest live page instead of the homepage.
import "server-only";
import { cities } from "@/lib/geo";

const slugify = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

/** Cities by name slug, largest first, so "top-dallas-conference-photographer" finds Dallas, TX. */
let byName: { key: string; slug: string }[] | undefined;
function findCity(slug: string) {
  byName ??= [...cities].sort((a, b) => b.population - a.population).map((c) => ({ key: slugify(c.name), slug: c.slug }));
  const s = `-${slug}-`;
  let best: { key: string; slug: string } | undefined;
  for (const c of byName) if (s.includes(`-${c.key}-`) && (!best || c.key.length > best.key.length)) best = c; // "north-las-vegas" beats "las-vegas"
  return best?.slug;
}

const RULES: [RegExp, string][] = [
  [/^macrosnaps-faq/, "/faq"],
  [/virtual-tour|matterport|3d-tour|360-degree/, "/virtualtours"],
  [/seo|link-building|website|core-web-vitals|google-ads|digital-marketing|backlink|keyword|jdm-engine/, "https://www.macrohype.com/"],
  [/live-?stream/, "/live-stream"],
  [/video-editing|youtube-video|reels-and-tiktok|editing-for-business/, "/video-editing"],
  [/retouch|airbrush|photo-editing|photo-editor|color-correction|post-production|background-replacement|photo-manipulation|bulk-photo/, "/photo-retouching"],
  [/headshot/, "https://macroheadshots.com/"],
  [/trade-?show/, "/trade-show-photography"],
  [/conference.*video|recap-video|hybrid-event-video/, "/conference-videography"],
  [/conference|convention|keynote|panel-discussion|annual-meeting/, "/conference-photography"],
  [/indian|sangeet|mehndi/, "/indian-wedding-photography"],
  [/jewish-wedding/, "/jewish-wedding-photography"],
  [/bar-mitzvah|bat-mitzvah/, "/bar-mitzvah-photography"],
  [/quinceanera/, "/quinceanera-photography"],
  [/bridal-shower/, "/bridal-shower-photography"],
  [/rehearsal-dinner/, "/rehearsal-dinner-photography"],
  [/elopement|courthouse|micro-wedding/, "/elopement-photography"],
  [/wedding.*video|wedding-highlight-film|wedding-videographer|photographer-and-videographer/, "/wedding-videography"],
  [/wedding|bride|first-look/, "/wedding-photography"],
  [/real-estate.*video|airbnb|vacation-rental/, "/real-estate-videography"],
  [/real-estate|property|listing|realtor|hotel|model-home|construction|architectur|twilight/, "/real-estate-photography"],
  [/couple|engagement|proposal/, "/engagement-photography"],
  [/graduation-party/, "/graduation-party-photography"],
  [/senior|graduation/, "/graduation-photography"],
  [/holiday-party/, "/holiday-party-photography"],
  [/award-ceremony/, "/award-ceremony-photography"],
  [/gala|nonprofit/, "/gala-fundraiser-photography"],
  [/photo-?booth/, "/photo-booth"],
  [/music-video/, "/music-videography"],
  [/food|restaurant|menu/, "/food-photography"],
  [/product|ecommerce|amazon|ghost-mannequin|jewelry|fashion/, "/product-photography"],
  [/event.*video|video.*event|highlight-video/, "/event-videography"],
  [/testimonial|corporate-video|business-video|commercial-video|social-media-video|video-content|brand.*video|types-of-corporate/, "/commercial-videography"],
  [/networking-event|product-launch|sponsor|corporate-event|same-day-event/, "/corporate-event-photography"],
  [/event|party|birthday/, "/event-photography"],
  [/maternity|pregnan/, "/maternity-photography"],
  [/newborn|baby/, "/newborn-photography"],
  [/family/, "/family-photography"],
  [/dating/, "/dating-photography"],
  [/automotive|dealer|fitness|brand-photography|branding-photoshoot|commercial/, "/commercial-photography"],
  [/boudoir|photographer|photography/, "/photographers"],
];

export function legacyPostTarget(slug: string): string {
  const s = slugify(slug);
  // City conference posts ("top-dallas-conference-photographer") go to that city's conference page.
  if (/conference/.test(s) && !/virtual-tour/.test(s)) {
    const city = findCity(s.replace(/conference.*$/, ""));
    if (city) return `/${/videograph/.test(s) ? "conference-videography" : "conference-photography"}/${city}`;
  }
  for (const [re, to] of RULES) if (re.test(s)) return to;
  return "/";
}
