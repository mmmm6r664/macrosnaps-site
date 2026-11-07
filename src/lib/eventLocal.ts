// Content for event-type × location landing pages, e.g. /indian-wedding-photography/dallas-tx and
// /bar-mitzvah-photography/florida. Event copy comes from src/data/eventTypes*.ts; local copy from
// src/data/cities.json + src/data/local. Site facts here must match the rest of the site:
// 13+ years, 6,000+ events, own crews (US + Ontario & Quebec), State Farm $1M/$2M,
// retouched gallery in about a week, highlight videos in 2–4 weeks, same published price for everyone.
import { EVENT_TYPES, type EventType } from "@/data/eventTypes";
import { City, Region, LocalInfo, cityLabel, citiesIn, fmtPop, getCity, getLocal, pick, topCities } from "./geo";
import { RATES, hourPrice } from "./pricing";
import { listText } from "./content";

export const getEventType = (slug: string) => EVENT_TYPES.find((e) => e.slug === slug);

/** Cities pre-rendered at build time for every event type (the rest render on first request and are cached). */
export const EVENT_PRERENDER_CITY_COUNT = 40;
export const eventPrerenderCities = () => topCities(EVENT_PRERENDER_CITY_COUNT);

type Group = "wedding" | "prewedding" | "party" | "youth" | "corporate" | "community" | "religious";

/** Short noun used inside sentences, and the kind of venues / photo locations that fit the event. */
const META: Record<string, { noun: string; group: Group }> = {
  "bar-mitzvah-photography": { noun: "Bar or Bat Mitzvah", group: "religious" },
  "indian-wedding-photography": { noun: "Indian wedding", group: "wedding" },
  "pakistani-wedding-photography": { noun: "Pakistani wedding", group: "wedding" },
  "muslim-wedding-photography": { noun: "Muslim wedding", group: "wedding" },
  "jewish-wedding-photography": { noun: "Jewish wedding", group: "wedding" },
  "same-sex-wedding-photography": { noun: "same-sex wedding", group: "wedding" },
  "chinese-wedding-photography": { noun: "Chinese or Asian wedding", group: "wedding" },
  "african-wedding-photography": { noun: "Nigerian or African wedding", group: "wedding" },
  "elopement-photography": { noun: "elopement", group: "wedding" },
  "engagement-party-photography": { noun: "engagement party or proposal", group: "prewedding" },
  "bridal-shower-photography": { noun: "bridal shower", group: "prewedding" },
  "rehearsal-dinner-photography": { noun: "rehearsal dinner", group: "prewedding" },
  "quinceanera-photography": { noun: "quinceañera", group: "youth" },
  "sweet-16-photography": { noun: "Sweet 16", group: "youth" },
  "prom-photography": { noun: "prom or school dance", group: "youth" },
  "birthday-party-photography": { noun: "birthday party", group: "party" },
  "anniversary-party-photography": { noun: "anniversary celebration", group: "party" },
  "gender-reveal-baby-shower-photography": { noun: "baby shower or gender reveal", group: "party" },
  "graduation-party-photography": { noun: "graduation", group: "youth" },
  "retirement-party-photography": { noun: "retirement party", group: "corporate" },
  "gala-fundraiser-photography": { noun: "gala or fundraiser", group: "corporate" },
  "holiday-party-photography": { noun: "holiday party", group: "corporate" },
  "award-ceremony-photography": { noun: "award ceremony", group: "corporate" },
  "religious-ceremony-photography": { noun: "baptism, christening or First Communion", group: "religious" },
  "festival-community-event-photography": { noun: "festival or community event", group: "community" },
};
const metaOf = (e: EventType) => META[e.slug] ?? { noun: e.name.replace(/s$/, "").toLowerCase(), group: "party" as Group };
export const eventNoun = (e: EventType) => metaOf(e).noun;

/** Bookable services that match an event (same mapping as the national event page). */
export function eventServices(e: EventType) {
  const isWedding = /wedding/.test(e.slug);
  const photoSvc = isWedding ? "wedding-photography" : /holiday|award|gala/.test(e.slug) ? "corporate-event-photography" : "event-photography";
  const videoSvc = isWedding ? "wedding-videography" : "event-videography";
  return { isWedding, photoSvc, videoSvc };
}

export const svcLabel = (slug: string) => slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
export const an = (word: string) => (/^([AEIOU]|LGBTQ)/i.test(word) ? "an" : "a");
const pluralPro = (pro: string) => `${pro}s`;

export function eventCosts(e: EventType) {
  const ph = Math.max(e.suggestedHours.photo, RATES.minHours);
  const vh = Math.max(e.suggestedHours.video, RATES.minHours);
  return { ph, vh, photo: hourPrice("photo", ph), video: hourPrice("video", vh), from: hourPrice("photo", RATES.minHours) };
}

/** First variant that fits the length limit (variants are ordered most to least descriptive). */
const fit = (max: number, ...variants: string[]) => variants.find((v) => v.length <= max) ?? variants[variants.length - 1].slice(0, max);

function sizePhrase(c: City) {
  if (c.slug === "washington-dc") return "the nation's capital";
  if (c.population >= 1_000_000) return `one of the largest cities in North America`;
  if (c.population >= 400_000) return `one of the biggest cities in ${c.stateName}`;
  if (c.population >= 150_000) return `a major city in ${c.stateName}`;
  if (c.population >= 50_000) return `a growing city in ${c.stateName}`;
  return `a community in ${c.stateName}`;
}

function venuesFor(group: Group, L: LocalInfo): { label: string; items: string[] } | null {
  const ev = L.eventVenues ?? [];
  const conf = L.conferenceVenues ?? [];
  if (group === "corporate") {
    const items = [...ev.slice(0, 3), ...conf.slice(0, 3)];
    return items.length ? { label: "hotel ballrooms, museums and event venues", items } : null;
  }
  if (group === "community") {
    const items = [...ev.slice(0, 3), ...(L.photoSpots ?? []).slice(0, 3)];
    return items.length ? { label: "public spaces and event venues", items } : null;
  }
  const items = [...ev.slice(0, 4), ...(group === "religious" || group === "party" ? conf.slice(0, 1) : [])];
  return items.length ? { label: group === "wedding" ? "wedding and reception venues" : "event and banquet venues", items } : null;
}

export type EventCityContent = ReturnType<typeof eventCityContent>;

export function eventCityContent(e: EventType, c: City) {
  const { noun, group } = metaOf(e);
  const label = cityLabel(c);
  const L: LocalInfo = getLocal(c.slug) ?? {};
  const seed = c.id + e.slug.length * 13;
  const cost = eventCosts(e);
  const nearby = c.nearby.filter((n) => getCity(n.slug)).slice(0, 8);
  const venues = venuesFor(group, L);
  const portraitSpots = group !== "corporate" && L.photoSpots?.length ? L.photoSpots.slice(0, 4) : [];

  const h1 = `${e.pro} in ${label}`;
  const metaTitle = fit(60, `${e.pro} in ${label} | MacroSnaps`, `${e.pro} in ${label}`, `${e.pro} ${c.name}, ${c.state}`, `${e.pro} ${c.name}`);
  const metaDescription = fit(
    160,
    `Book ${an(e.pro)} ${e.pro} in ${label} from $${cost.from}. Own insured crews, every photo retouched, gallery in about a week. Same price for everyone.`,
    `${e.pro} in ${label} from $${cost.from} for 2 hours. Own insured crews, retouched gallery in about a week. Same price for everyone.`,
    `${e.pro} in ${label} from $${cost.from}. Own insured crews, same published price for everyone.`,
    `${e.pro} in ${c.name} from $${cost.from}. Same published price for everyone.`,
  );

  const subtitle = pick(
    [
      `MacroSnaps photographers and videographers cover ${noun} celebrations in ${c.name} and across ${c.stateName}, with published hourly prices you can book and pay for online.`,
      `Our own crews, not a marketplace: ${noun} photography and video in ${c.name}, retouched photos in about a week and the same price for every family.`,
      `${e.name} in ${c.name}, ${c.stateName}, photographed and filmed by an insured MacroSnaps crew that plans around your traditions and timeline.`,
    ],
    seed,
  );

  /* intro: event content blended with city facts */
  const intro: string[] = [e.intro[0]];

  let cityPara =
    `${c.name} is ${sizePhrase(c)}` + (c.population >= 10_000 ? `, home to roughly ${fmtPop(c.population)} people` : "") + ". ";
  if (venues) {
    cityPara += pick(
      [
        `We cover ${noun} events at ${venues.label} across the area, from ${listText(venues.items.slice(0, 3))} to private homes, restaurants and community halls.`,
        `Whether your ${noun} is at ${venues.items[0]}${venues.items[1] ? `, ${venues.items[1]}` : ""} or a family home, your MacroSnaps crew arrives early to check light, angles and any venue rules.`,
      ],
      seed,
      1,
    );
  } else {
    cityPara += pick(
      [
        `Our crews work across ${c.stateName}, so a ${noun} in ${c.name} gets the same packages, editing standards and delivery times as one in a major metro.`,
        `We cover ${noun} events in banquet halls, hotels, places of worship, restaurants and private homes throughout ${c.name}${nearby.length ? ` and nearby ${listText(nearby.slice(0, 2).map((n) => n.name))}` : ""}.`,
      ],
      seed,
      1,
    );
  }
  // The city blurb is business-focused, so only corporate-style events use it.
  if (L.blurb && group === "corporate") cityPara += " " + L.blurb;
  intro.push(cityPara);

  intro.push(e.intro[1]);

  intro.push(
    `For a typical ${noun}, clients in ${c.name} book about ${cost.ph} hours of photography ($${cost.photo.toLocaleString()}) and ${cost.vh} hours of videography ($${cost.video.toLocaleString()}). ` +
      `Photography is $${RATES.photo.first} for the first hour and $${RATES.photo.extra} for each additional hour; videography is $${RATES.video.first} for the first hour and $${RATES.video.extra} for each additional hour, with a ${RATES.minHours}-hour minimum. ` +
      `The first-hour price includes travel, so ${c.name} costs the same as anywhere else we work, and there are no quotes to wait for.`,
  );

  /* local section */
  const lists: { title: string; items: string[] }[] = [];
  if (venues) lists.push({ title: group === "wedding" ? `${c.name} wedding & reception venues we cover` : `${c.name} venues we cover`, items: venues.items });
  // Portrait / photo spots have their own section on the page (components/PhotoSpots).
  if (L.neighborhoods?.length) lists.push({ title: "Neighborhoods & areas", items: L.neighborhoods.slice(0, 6) });
  if (nearby.length) lists.push({ title: "Also serving nearby", items: nearby.slice(0, 6).map((n) => `${n.name} (${n.mi} mi)`) });

  const localParas: string[] = [];
  if (portraitSpots.length && (group === "wedding" || group === "youth" || group === "prewedding"))
    localParas.push(`Want portraits away from the venue? Couples and families in ${c.name} often add an hour at ${listText(portraitSpots.slice(0, 2))}. Just add the time and the second location when you book.`);
  if (L.airport && (group === "wedding" || group === "religious"))
    localParas.push(`Guests flying in for the ${noun} usually arrive through ${L.airport}. If your celebration runs over several days, each event can be booked separately with its own hours.`);
  if (!localParas.length)
    localParas.push(
      `Tell us your venue when you book. If it needs a certificate of insurance, we send it before the event: MacroSnaps is insured through State Farm with $1 million per occurrence and $2 million general aggregate coverage.`,
    );

  /* FAQs: the event's own + 2 localized */
  const faqs = [
    {
      q: `Do you have ${an(e.pro)} ${e.pro} near ${c.name}?`,
      a: `Yes. MacroSnaps has its own photographers and videographers working across ${c.stateName}, and we assign a crew for your ${noun} in ${c.name} as soon as you book${nearby.length ? `. We also cover nearby ${listText(nearby.slice(0, 3).map((n) => n.name))}` : ""}. You deal with one company, with 13+ years and 6,000+ events behind it, from booking to delivery.`,
    },
    {
      q: `How much does ${an(e.pro)} ${e.pro} cost in ${c.name}?`,
      a: `The same as everywhere we work: photography is $${RATES.photo.first} for the first hour and $${RATES.photo.extra} for each additional hour, so ${cost.ph} hours is $${cost.photo.toLocaleString()}. Videography is $${RATES.video.first} for the first hour and $${RATES.video.extra} for each additional hour, so ${cost.vh} hours is $${cost.video.toLocaleString()}. The minimum is ${RATES.minHours} hours and the first-hour price includes travel to ${c.name}.`,
    },
    ...e.faqs,
  ];

  return { h1, metaTitle, metaDescription, subtitle, intro, local: { heading: `${e.name} around ${c.name}`, paragraphs: localParas, lists }, faqs, cost, nearby, noun };
}

export function eventRegionContent(e: EventType, r: Region) {
  const { noun } = metaOf(e);
  const list = citiesIn(r.code);
  const top = list.slice(0, 5).map((c) => c.name);
  const cost = eventCosts(e);
  const what = r.country === "canada" ? "province" : r.code === "DC" ? "district" : "state";
  const h1 = `${pluralPro(e.pro)} in ${r.name}`;
  const metaTitle = fit(60, `${pluralPro(e.pro)} in ${r.name} | MacroSnaps`, `${pluralPro(e.pro)} in ${r.name}`, `${e.pro} ${r.name}`);
  const metaDescription = fit(
    160,
    `${pluralPro(e.pro)} across ${r.name}: ${top.slice(0, 3).join(", ")} and more. Our own insured crews, from $${cost.from}, same price for everyone. Book online.`,
    `${pluralPro(e.pro)} across ${r.name} from $${cost.from}. Our own insured crews, same price for everyone. Book online.`,
    `${e.pro} in ${r.name} from $${cost.from}. Book online.`,
  );
  const intro = [
    `MacroSnaps covers ${noun} celebrations throughout ${r.name}, from ${listText(top.slice(0, 3))} to smaller communities across the ${what}. We are one company with our own photographers and videographers, not a marketplace, so every ${noun} in ${r.name} gets the same standards, prices and delivery times.`,
    e.intro[0],
    `Choose your city below for local venues, typical coverage and answers to common questions, or book directly online. A typical ${noun} is about ${cost.ph} hours of photography ($${cost.photo.toLocaleString()}) and ${cost.vh} hours of videography ($${cost.video.toLocaleString()}).`,
  ];
  const faqs = [
    {
      q: `Do you cover ${noun} events everywhere in ${r.name}?`,
      a: `Yes. Our own crews work across ${r.name}, including ${listText(top.slice(0, 4))}. The price is the same in every city, because travel is included in the first hour.`,
    },
    ...e.faqs,
  ];
  return { h1, metaTitle, metaDescription, intro, faqs, cost, cities: list, noun };
}
