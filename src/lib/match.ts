// Rule-based request matcher: "I need a conference photographer for my event in San Francisco"
// → the right page, price and booking link. No AI involved.
import { cities, regions, cityLabel, City, Region } from "./geo";
import { getService, RATES } from "./services";
import { EVENT_TYPES } from "@/data/eventTypes";
import { VERTICALS } from "@/data/verticals";

const norm = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
const isVideo = (q: string) => /\b(video|videograph\w*|film\w*|recap|highlight reel|live ?stream\w*)\b/.test(q);

type Rule = { re: RegExp; slug: string; kind: "service" | "event" | "industry" | "solution" | "external" | "hub"; video?: string };
const RULES: Rule[] = [
  { re: /\bheadshots?\b/, slug: "https://macroheadshots.com/", kind: "external" },
  { re: /\b(bar|bat|b'nai) mitzvah/, slug: "bar-mitzvah-photography", kind: "event" },
  { re: /\b(indian|hindu|sikh|punjabi|gujarati|desi) wedding|\bsangeet\b|\bhaldi\b|\bbaraat\b/, slug: "indian-wedding-photography", kind: "event" },
  { re: /\bpakistani wedding|\bvalima\b|\bmehndi\b|\bdholki\b|\brukhsati\b/, slug: "pakistani-wedding-photography", kind: "event" },
  { re: /\b(muslim|islamic|arab|lebanese|turkish|egyptian) wedding|\bnikah\b|\bwalima\b|\bzaffa\b/, slug: "muslim-wedding-photography", kind: "event" },
  { re: /\b(jewish|orthodox jewish|hasidic) wedding|\bchuppah\b|\bketubah\b|\bbedeken\b/, slug: "jewish-wedding-photography", kind: "event" },
  { re: /\b(same[- ]sex|gay|lesbian|lgbtq?\+?|queer) (wedding|marriage|couple)/, slug: "same-sex-wedding-photography", kind: "event" },
  { re: /\b(chinese|vietnamese|korean|asian|taiwanese|filipino) wedding|\btea ceremony\b|\bpyebaek\b/, slug: "chinese-wedding-photography", kind: "event" },
  { re: /\b(nigerian|african|yoruba|igbo|ghanaian|ethiopian|eritrean) (wedding|traditional)|\baso ebi\b/, slug: "african-wedding-photography", kind: "event" },
  { re: /\belop(e|ement|ing)\b|\b(courthouse|city hall) (wedding|ceremony|marriage)/, slug: "elopement-photography", kind: "event" },
  { re: /\bbridal shower|\bbachelorette\b|\bhen party\b/, slug: "bridal-shower-photography", kind: "event" },
  { re: /\brehearsal dinner|\bwelcome party\b/, slug: "rehearsal-dinner-photography", kind: "event" },
  { re: /\bprom\b|\bhomecoming dance|\bschool dance|\bsemi[- ]formal\b/, slug: "prom-photography", kind: "event" },
  { re: /\bretirement|\bfarewell (party|dinner)/, slug: "retirement-party-photography", kind: "event" },
  { re: /\bquince|\bquinceanera/, slug: "quinceanera-photography", kind: "event" },
  { re: /\bsweet ?(16|sixteen)\b/, slug: "sweet-16-photography", kind: "event" },
  { re: /\b(gender reveal|baby shower)\b/, slug: "gender-reveal-baby-shower-photography", kind: "event" },
  { re: /\banniversary\b/, slug: "anniversary-party-photography", kind: "event" },
  { re: /\b(gala|fundraiser|benefit dinner)\b/, slug: "gala-fundraiser-photography", kind: "event" },
  { re: /\bholiday party|christmas party|office party\b/, slug: "holiday-party-photography", kind: "event" },
  { re: /\baward(s)? (ceremony|night|show|dinner)\b/, slug: "award-ceremony-photography", kind: "event" },
  { re: /\bengagement party|\bproposal\b/, slug: "engagement-party-photography", kind: "event" },
  { re: /\b(baptism|christening|communion|bris|aqiqah)\b/, slug: "religious-ceremony-photography", kind: "event" },
  { re: /\b(festival|parade|5k|marathon|community event|street fair)\b/, slug: "festival-community-event-photography", kind: "event" },
  { re: /\bgraduation party\b/, slug: "graduation-party-photography", kind: "event" },
  { re: /\b(trade ?show|expo|exhibit(or|ion)|booth)\b/, slug: "trade-show-photography", kind: "service" },
  { re: /\b(conference|summit|convention|keynote|symposium|panel|forum|seminar|congress)\b/, slug: "conference-photography", kind: "service", video: "conference-videography" },
  { re: /\blive ?stream/, slug: "live-stream", kind: "service" },
  { re: /\b(corporate|company|offsite|town ?hall|product launch|team event|business event)\b/, slug: "corporate-event-photography", kind: "service", video: "corporate-videography" },
  { re: /\b(elopement|courthouse|city hall|wedding|bride|reception)\b/, slug: "wedding-photography", kind: "service", video: "wedding-videography" },
  { re: /\bengage(d|ment)\b/, slug: "engagement-photography", kind: "service", video: "engagement-videography" },
  { re: /\b(3d|matterport|virtual tour|360)\b/, slug: "virtualtours", kind: "service" },
  { re: /\b(real estate|listing|realtor|airbnb|property|house|condo)\b/, slug: "real-estate-photography", kind: "service", video: "real-estate-videography" },
  { re: /\b(dentist|dental|orthodont)/, slug: "dental-clinics", kind: "industry" },
  { re: /\b(med ?spa|clinic|chiropract|physical therap|doctor|medical|wellness)\b/, slug: "medical-practices", kind: "industry" },
  { re: /\b(menu|dish(es)?|restaurant|cafe|bakery|bar and grill)\b/, slug: "restaurants", kind: "industry" },
  { re: /\b(food brand|beverage|cpg|packag(ed|ing))\b/, slug: "food-brands", kind: "industry" },
  { re: /\b(law firm|attorney|lawyer)/, slug: "law-firms", kind: "industry" },
  { re: /\b(hotel|resort|hospitality)\b/, slug: "hotels-hospitality", kind: "industry" },
  { re: /\b(gym|fitness|yoga|pilates|spa)\b/, slug: "fitness-gyms", kind: "industry" },
  { re: /\b(salon|barber|beauty|nail|lash)\b/, slug: "salons-beauty", kind: "industry" },
  { re: /\b(contractor|roofing|remodel|renovation|plumb|hvac|landscap)/, slug: "home-services", kind: "industry" },
  { re: /\b(startup|saas|tech company)\b/, slug: "tech-startups", kind: "industry" },
  { re: /\b(bank|credit union|financial|wealth)\b/, slug: "financial-services", kind: "industry" },
  { re: /\b(nonprofit|non-profit|association|charity)\b/, slug: "nonprofits-associations", kind: "industry" },
  { re: /\b(school|university|college|campus)\b/, slug: "education", kind: "industry" },
  { re: /\b(store|retail|e-?commerce|shopify|amazon)\b/, slug: "retail-ecommerce", kind: "industry" },
  { re: /\b(ads?|advert\w*|commercials?|tv spot|television)\b/, slug: "video-ads", kind: "solution" },
  { re: /\b(social media|instagram|tiktok|reels|content day)\b/, slug: "social-media-content", kind: "solution" },
  { re: /\btestimonial/, slug: "testimonial-videos", kind: "solution" },
  { re: /\b(recruit\w*|hiring|culture video)\b/, slug: "recruiting-videos", kind: "solution" },
  { re: /\bwebsite\b/, slug: "website-photos-video", kind: "solution" },
  { re: /\bproducts?\b/, slug: "product-photography", kind: "service" },
  { re: /\bfood\b/, slug: "food-photography", kind: "service" },
  { re: /\bmusic video|\bmusician|\bband\b|\brapper\b/, slug: "music-videography", kind: "service" },
  { re: /\bphoto ?booth\b/, slug: "photo-booth", kind: "service" },
  { re: /\bretouch/, slug: "photo-retouching", kind: "service" },
  { re: /\bedit(ing|or)\b/, slug: "video-editing", kind: "service" },
  { re: /\bmaternity|pregnan/, slug: "maternity-photography", kind: "service" },
  { re: /\bnewborn|\bbaby\b/, slug: "newborn-photography", kind: "service" },
  { re: /\bgraduat/, slug: "graduation-photography", kind: "service" },
  { re: /\bfamily\b/, slug: "family-photography", kind: "service" },
  { re: /\bdating|\btinder|\bhinge|\bbumble/, slug: "dating-photography", kind: "service" },
  { re: /\bbirthday|\bparty\b/, slug: "birthday-party-photography", kind: "event" },
  { re: /\bbrand(ing)?\b/, slug: "brand-photography", kind: "solution" },
  { re: /\bevent\b/, slug: "event-photography", kind: "service", video: "event-videography" },
];

// Longest names first so "West Palm Beach" wins over "Palm Beach".
const PLACES: ({ n: string; city: City } | { n: string; region: Region })[] = [
  ...cities.flatMap((c) => {
    const names = [norm(c.name), ...(c.slug === "new-york-city-ny" ? ["nyc", "new york city", "manhattan"] : []), ...(c.slug === "washington-dc" ? ["washington dc", "dc", "d.c."] : []), ...(c.slug === "san-francisco-ca" ? ["sf", "bay area"] : []), ...(c.slug === "los-angeles-ca" ? ["la", "l.a."] : [])];
    return names.map((n) => ({ n, city: c }));
  }),
  ...regions.map((r) => ({ n: norm(r.name), region: r })),
].sort((a, b) => b.n.length - a.n.length || ("city" in b ? b.city.population : 0) - ("city" in a ? a.city.population : 0));

function findPlace(q: string): { city?: City; region?: Region } {
  for (const p of PLACES) {
    const name = p.n.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (!new RegExp(`(^|[^a-z])${name}([^a-z]|$)`).test(q)) continue;
    // Short or common-word names ("Union", "Mission", "LA") only count after "in/at/near…" or before a state code.
    const strong =
      p.n.length >= 8 ||
      new RegExp(`\\b(in|at|near|around|to|for|from|outside)( the)? ${name}([^a-z]|$)`).test(q) ||
      ("city" in p && new RegExp(`${name},? (${p.city.state.toLowerCase()}|${norm(p.city.stateName)})\\b`).test(q));
    if (!strong) continue;
    if ("city" in p) {
      // "Portland, OR" vs "Portland, ME": prefer a city whose state appears in the text
      const same = cities.filter((c) => norm(c.name) === p.n);
      if (same.length > 1) {
        const hit = same.find((c) => new RegExp(`\\b(${c.state.toLowerCase()}|${norm(c.stateName)})\\b`).test(q));
        if (hit) return { city: hit };
      }
      return { city: p.city };
    }
    return { region: p.region };
  }
  return {};
}

export type MatchResult = {
  headline: string;
  url: string;
  bookUrl?: string;
  priceFrom?: number;
  note?: string;
  links: { label: string; href: string }[];
};

export function matchRequest(raw: string): MatchResult {
  const q = norm(raw);
  const video = isVideo(q);
  const rule = RULES.find((r) => r.re.test(q));
  const { city, region } = findPlace(q);
  const where = city ? cityLabel(city) : region?.name;
  const place = city?.slug ?? region?.slug;
  const links: { label: string; href: string }[] = [];
  const from = video ? RATES.video.first + RATES.video.extra : RATES.photo.first + RATES.photo.extra;

  if (!rule) {
    const hub = video ? "videographers" : "photographers";
    return {
      headline: `${video ? "Videographers" : "Photographers"}${where ? ` in ${where}` : " near you"}`,
      url: place ? `/${hub}/${place}` : `/${hub}`,
      bookUrl: `/book${city ? `?city=${city.slug}` : ""}`,
      priceFrom: from,
      links: [{ label: "All services", href: `/${hub}` }, { label: "Prices & booking", href: "/book" }],
    };
  }

  if (rule.kind === "external") return { headline: "Business headshots", url: rule.slug, note: "Headshot sessions are handled by our sister studio, MacroHeadshots.", links: [] };

  if (rule.kind === "service") {
    const slug = video && rule.video ? rule.video : rule.slug;
    const s = getService(slug)!;
    const price = Math.min(...s.packages.filter((p) => !p.quoteOnly).map((p) => p.price), Infinity);
    const localUrl = s.local && place ? `/${slug}/${place}` : undefined;
    if (!localUrl && place) links.push({ label: `${video ? "Videographers" : "Photographers"} in ${where}`, href: `/${video ? "videographers" : "photographers"}/${place}` });
    links.push({ label: `${s.name} overview`, href: `/${slug}` });
    if (slug === "virtualtours" || slug.startsWith("real-estate")) links.push({ label: "3D tours: VA, MD, DC, NY & NJ", href: "/virtualtours" });
    return {
      headline: `${s.pro}${where ? ` in ${where}` : ""}`,
      url: localUrl ?? `/${slug}`,
      bookUrl: `/book?service=${slug}${city ? `&city=${city.slug}` : ""}`,
      priceFrom: Number.isFinite(price) ? price : undefined,
      links,
    };
  }

  if (rule.kind === "event") {
    const e = EVENT_TYPES.find((x) => x.slug === rule.slug)!;
    if (place) links.push({ label: `Event ${video ? "videographers" : "photographers"} in ${where}`, href: `/${video ? "event-videography" : "event-photography"}/${place}` });
    links.push({ label: "Event photography prices", href: "/event-photography" });
    return {
      headline: `${e.pro}${where ? ` in ${where}` : ""}`,
      url: `/${e.slug}`,
      bookUrl: `/book?service=${video ? "event-videography" : "event-photography"}${city ? `&city=${city.slug}` : ""}`,
      priceFrom: from,
      links,
    };
  }

  const v = VERTICALS.find((x) => x.slug === rule.slug)!;
  const base = v.kind === "industry" ? "/industries" : "/solutions";
  if (place) links.push({ label: `Commercial photographers in ${where}`, href: `/photographers/${place}` });
  links.push({ label: v.kind === "industry" ? "All industries" : "All solutions", href: base });
  return {
    headline: `${v.h1}${where ? ` in ${where}` : ""}`,
    url: `${base}/${v.slug}`,
    bookUrl: `/book?service=${v.services[0] ?? "commercial-photography"}${city ? `&city=${city.slug}` : ""}`,
    priceFrom: from,
    links,
  };
}
