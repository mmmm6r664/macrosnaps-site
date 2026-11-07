import { City, LocalInfo, Region, cityLabel, fmtPop, getLocal, pick, citiesIn } from "./geo";
import { HUBS, Service, Faq, getService, SERVICES } from "./services";
import { IMG } from "./images";

export type LocalTarget =
  | { kind: "service"; service: Service }
  | { kind: "hub"; hub: (typeof HUBS)[keyof typeof HUBS] };

export const targetSlug = (t: LocalTarget) => (t.kind === "service" ? t.service.slug : t.hub.slug);
export const targetPro = (t: LocalTarget) => (t.kind === "service" ? t.service.pro : t.hub.pro);
export const targetName = (t: LocalTarget) => (t.kind === "service" ? t.service.name : t.hub.name);
export const targetKind = (t: LocalTarget) => (t.kind === "service" ? t.service.kind : t.hub.kind);

export function resolveTarget(slug: string): LocalTarget | undefined {
  if (slug in HUBS) return { kind: "hub", hub: HUBS[slug as keyof typeof HUBS] };
  const s = getService(slug);
  return s && s.local ? { kind: "service", service: s } : undefined;
}

/** Which services a hub page highlights, and which booking packages it shows. */
export function hubServices(t: LocalTarget): Service[] {
  if (t.kind === "service") return [t.service];
  const kind = t.hub.kind;
  return SERVICES.filter((s) => s.local && s.kind === kind);
}

export function imagesFor(t: LocalTarget): string[] {
  if (t.kind === "service") return t.service.images;
  return t.hub.kind === "photo" ? [...IMG.conference.slice(0, 6), ...IMG.wedding.slice(0, 4), ...IMG.event.slice(0, 2)] : [...IMG.conferenceVideo, ...IMG.wedding.slice(0, 3)];
}

const plural = (pro: string) => (pro.endsWith("Crew") ? pro : `${pro}s`);

/* ───────────────────────────── city pages ───────────────────────────── */

type Topic = "conference" | "corporate" | "event" | "wedding" | "general";
function topicOf(t: LocalTarget): Topic {
  const s = targetSlug(t);
  if (s.startsWith("conference")) return "conference";
  if (s.startsWith("corporate")) return "corporate";
  if (s.startsWith("event")) return "event";
  if (s.startsWith("wedding")) return "wedding";
  return "general";
}

function sizePhrase(c: City) {
  const where = c.stateName;
  if (c.slug === "washington-dc") return "the nation's capital";
  if (c.population >= 1_000_000) return `one of the largest cities in North America`;
  if (c.population >= 400_000) return `one of the biggest cities in ${where}`;
  if (c.population >= 150_000) return `a major city in ${where}`;
  if (c.population >= 50_000) return `a growing city in ${where}`;
  return `a community in ${where}`;
}

function studioLine(c: City): string | undefined {
  const { nyc, dc } = c.studioMiles;
  if (c.slug === "new-york-city-ny" || c.slug === "manhattan-ny") return "Our New York City studio is in Times Square at 115 W 45th Street, so our team is local.";
  if (c.slug === "washington-dc") return "Our Washington, DC office is downtown at 1300 I St NW, so our team is local.";
  if (nyc <= 60) return `${c.name} is about ${nyc} miles from our Times Square studio in New York City.`;
  if (dc <= 60) return `${c.name} is about ${dc} miles from our Washington, DC office.`;
  return undefined;
}

export type CityContent = {
  metaTitle: string;
  metaDescription: string;
  h1: string;
  subtitle: string;
  intro: string[];
  local: { heading: string; paragraphs: string[]; lists: { title: string; items: string[] }[] } | null;
  coverageTitle: string;
  coverage: string[];
  pricingTitle: string;
  pricingIntro: string;
  faqs: Faq[];
  priceFrom: number | null;
};

export function cityContent(t: LocalTarget, c: City): CityContent {
  const pro = targetPro(t);
  const name = targetName(t);
  const label = cityLabel(c);
  const L: LocalInfo = getLocal(c.slug) ?? {};
  const topic = topicOf(t);
  const seed = c.id + targetSlug(t).length * 7;
  const services = hubServices(t);
  const prices = services.flatMap((s) => s.packages.map((p) => p.price));
  const priceFrom = prices.length ? Math.min(...prices) : null;

  const h1 = `${pro} in ${label}`;
  const metaTitle = pick(
    [`${pro} in ${label} | Book Online`, `${label} ${pro} | ${name}`, `${pro} ${c.name}, ${c.state} | ${name} Packages`],
    seed,
  ).slice(0, 65);
  const metaDescription =
    `Hire a professional ${pro.toLowerCase()} in ${label}. MacroSnaps' own crews cover ${topicDesc(topic, t)} in ${c.name}` +
    (priceFrom ? `. Packages from $${priceFrom}, book & pay online.` : `. Request a quote today.`);

  const subtitle = pick(
    [
      `${name} for weddings, engagements, celebrations, conferences and corporate events across ${c.name} and the surrounding area, with published prices you can book and pay for online.`,
      `MacroSnaps' own ${plural(pro).toLowerCase()} cover ${c.name}: insured, 5-star rated, retouched images delivered fast.`,
      `Professional ${name.toLowerCase()} in ${c.name}, ${c.stateName}. One company, our own crews, upfront prices.`,
    ],
    seed,
    1,
  );

  /* intro */
  const intro: string[] = [];
  const opener = {
    conference: [
      `Planning a conference, summit or association meeting in ${c.name}? A MacroSnaps ${pro.toLowerCase()} documents your keynotes, panels, breakouts, sponsors and networking so your marketing team has a full library of images to promote next year's event.`,
      `Conferences in ${c.name} move fast: concurrent sessions, VIP moments and sponsor activations all happen at once. Our ${plural(pro).toLowerCase()} follow your run-of-show so nothing your speakers, sponsors or attendees care about is missed.`,
      `${c.name} hosts everything from industry trade conferences to association annual meetings, and MacroSnaps covers them with an experienced ${pro.toLowerCase()} who knows how to work around stages, AV crews and tight schedules.`,
    ],
    corporate: [
      `MacroSnaps works with companies in ${c.name} on product launches, holiday parties, client events, award nights and team offsites, delivering polished ${t.kind === "service" && t.service.kind === "video" ? "video" : "images"} your brand, HR and sales teams can use for months.`,
      `Corporate teams in ${c.name} book MacroSnaps because we are one company with our own crews and published prices that are the same for every client — not a marketplace of strangers.`,
      `From executive receptions to all-hands meetings, a MacroSnaps ${pro.toLowerCase()} in ${c.name} captures your company's events the way your communications team needs them.`,
    ],
    event: [
      `Whether it is a gala, a milestone birthday, a Bar Mitzvah or a company celebration, a MacroSnaps ${pro.toLowerCase()} in ${c.name} captures the people, the details and the moments in between.`,
      `Events in ${c.name} deserve to be remembered properly. Our ${plural(pro).toLowerCase()} cover private parties, cultural celebrations, fundraisers and corporate receptions of every size.`,
      `MacroSnaps brings professional ${name.toLowerCase()} to ${c.name}, from intimate dinners to ballroom galas, with every price listed upfront.`,
    ],
    wedding: [
      `Getting married in ${c.name}? A MacroSnaps ${pro.toLowerCase()} captures your ceremony, family portraits and reception with a calm, unobtrusive style and fully retouched results.`,
      `From courthouse ceremonies to full ballroom receptions, couples in ${c.name} choose MacroSnaps for honest pricing and ${t.kind === "service" && t.service.kind === "video" ? "cinematic films" : "timeless, retouched photographs"}.`,
      `Your wedding day in ${c.name} only happens once. Our ${plural(pro).toLowerCase()} plan around your timeline, light and locations so you can simply enjoy it.`,
    ],
    general: [
      `Looking for a professional ${pro.toLowerCase()} in ${c.name}? MacroSnaps covers weddings, engagements, family portraits, birthdays and celebrations, conferences and corporate events across ${c.stateName}, with our own photographers and videographers rather than freelancers from a marketplace.`,
      `MacroSnaps is a global photography and videography company, and our crews work in ${c.name} for weddings and engagements, family and maternity sessions, parties and celebrations, and conferences and corporate events.`,
      `From corporate conferences to weddings, MacroSnaps provides ${name.toLowerCase()} in ${c.name}, ${c.stateName}, with packages you can book and pay for online in minutes.`,
    ],
  }[topic];
  intro.push(pick(opener, seed, 2));

  const city2 =
    `${c.name} is ${sizePhrase(c)}` +
    (c.population >= 10_000 ? `, home to roughly ${fmtPop(c.population)} people` : "") +
    `. ` +
    (L.blurb ? L.blurb : pick([
      `Our crews regularly work across ${c.stateName}, so booking in ${c.name} is no different from booking in a major metro: the same packages, the same editing standards and the same delivery times.`,
      `Because MacroSnaps has its own photographers and videographers across ${c.stateName}, we can staff events in ${c.name} on short notice and keep quality consistent from one event to the next.`,
      `Prices are the same in ${c.name} as everywhere else we work, because travel time is already built into the first hour of every package.`,
    ], seed, 3));
  intro.push(city2);

  const studio = studioLine(c);
  intro.push(
    (studio ? studio + " " : "") +
      pick(
        [
          `Every booking includes retouched, color-graded ${targetKind(t) === "video" ? "footage edited into a highlight video" : "photos in a private online gallery"}, and our team is fully insured for venues that require a certificate of insurance.`,
          `We handle all bookings online and display every price, so you know exactly what you will pay before you book, with no quotes or hidden fees.`,
          `MacroSnaps is part of MacroHype LLC, a digital media and marketing company working with businesses since 2011, and is rated 5 stars on Google, Thumbtack, WeddingWire and The Knot.`,
        ],
        seed,
        4,
      ),
  );

  /* local section */
  const lists: { title: string; items: string[] }[] = [];
  const venueList = topic === "wedding" ? L.eventVenues : topic === "general" ? [...(L.conferenceVenues ?? []).slice(0, 3), ...(L.eventVenues ?? []).slice(0, 2)] : topic === "event" ? [...(L.eventVenues ?? []), ...(L.conferenceVenues ?? []).slice(0, 2)] : L.conferenceVenues;
  if (venueList?.length)
    lists.push({ title: topic === "wedding" ? `Popular ${c.name} wedding & reception venues` : topic === "event" ? `Event venues in ${c.name}` : `Conference & event venues in ${c.name}`, items: venueList });
  if (topic === "conference" && L.eventVenues?.length) lists.push({ title: `Gala, reception & after-party venues`, items: L.eventVenues });
  // Photo spots have their own section on the page (components/PhotoSpots).
  if (L.neighborhoods?.length) lists.push({ title: `Neighborhoods & areas we cover`, items: L.neighborhoods });
  if (c.nearby.length) lists.push({ title: `Also serving nearby`, items: c.nearby.slice(0, 6).map((n) => `${n.name} (${n.mi} mi)`) });

  const localParas: string[] = [];
  if (venueList?.length) {
    localParas.push(
      pick(
        [
          `We have covered events at venues across the region. Whether your ${topic === "wedding" ? "wedding" : "event"} is at ${venueList[0]}${venueList[1] ? ` or ${venueList[1]}` : ""}, a hotel ballroom or your own office, our team arrives early to scout light and angles.`,
          `Typical ${topic === "wedding" ? "wedding" : "event"} venues in ${c.name} include ${listText(venueList.slice(0, 3))}. Tell us your venue when you book, and if it needs a certificate of insurance, we will send it.`,
        ],
        seed,
        5,
      ),
    );
  } else {
    localParas.push(
      `We cover hotels, conference centers, offices, private homes, restaurants and outdoor locations throughout ${c.name}` +
        (c.nearby.length ? ` and nearby communities such as ${listText(c.nearby.slice(0, 3).map((n) => n.name))}.` : "."),
    );
  }
  if (L.airport && topic !== "wedding")
    localParas.push(`Flying speakers or attendees in? Most visitors arrive through ${L.airport}. For multi-day conferences we can plan crew coverage across every day of your program.`);

  const local = { heading: `${name} around ${c.name}`, paragraphs: localParas, lists };

  /* coverage */
  const coverage = t.kind === "service" ? t.service.coverage : HUB_COVERAGE[t.hub.kind];

  /* faqs */
  const faqs: Faq[] = [
    {
      q: `How much does a ${pro.toLowerCase()} cost in ${c.name}?`,
      a: priceFrom
        ? `MacroSnaps ${name.toLowerCase()} packages in ${c.name} start at $${priceFrom} for 2 hours of coverage, and every package price is listed on this page. The first-hour price includes travel, so ${c.name} costs the same as any other city we serve. Multi-day and multi-camera corporate events are booked at the same published hourly rates.`
        : `Contact us with your date and requirements and we will send a quote for ${c.name}.`,
    },
    { q: "How are your prices so affordable?", a: "We are affordable, but not cheap. We don't believe hiring a professional photographer or videographer should break the bank, and your wedding day certainly shouldn't cost you $10,000 to $20,000 just for photography. We keep prices down by how we work: our crews cover several events a day, so we run at high volume instead of charging one client for an entire day; our post-production team includes dedicated editors, some based overseas, who retouch and edit efficiently; and we share people, equipment and systems with our parent company, MacroHype. The result is professional cameras and lighting, experienced photographers and videographers, and careful, professional editing at a price that is published on our website and the same for every client." },
    {
      q: `Do you have ${plural(pro).toLowerCase()} in ${c.name}?`,
      a: `Yes. MacroSnaps has its own photographers and videographers working across ${c.stateName}, and we assign a crew for ${c.name} as soon as you book. You deal with one company from booking to delivery.`,
    },
    {
      q: `How far in advance should I book in ${c.name}?`,
      a: `Book as early as you can, especially for ${topic === "wedding" ? "spring and fall Saturdays" : "weekday conferences in peak convention season"}. Every booking reserves your date and time, and we will confirm your crew by email.`,
    },
    {
      q: "When will I receive my photos or video?",
      a: "Photos are retouched, color graded and delivered in an online gallery in about a week. Edited highlight videos are delivered in 2 to 4 weeks depending on the package. Faster turnaround for corporate events can be arranged.",
    },
    {
      q: `Can you provide a certificate of insurance for my ${c.name} venue?`,
      a: "Yes. We are insured through State Farm ($1 million each occurrence, $2 million general aggregate). Email info@macrosnaps.com with your venue's requirements and we will send the certificate.",
    },
  ];
  if (topic === "conference" || topic === "corporate")
    faqs.push({
      q: `Can you cover a multi-day conference in ${c.name}?`,
      a: `Yes. Multi-day programs, several rooms at once and live streaming in ${c.name} are all booked at our published hourly rates. Book online or send us your agenda and we will plan the crew with you.`,
    });

  return {
    metaTitle,
    metaDescription,
    h1,
    subtitle,
    intro,
    local,
    coverageTitle: `What our ${plural(pro).toLowerCase()} cover in ${c.name}`,
    coverage,
    pricingTitle: `${name} packages & prices in ${c.name}`,
    pricingIntro: `Transparent pricing — the same in ${c.name} as everywhere we work. Pick your hours and book online; your date is reserved as soon as you pay.`,
    faqs,
    priceFrom,
  };
}

/* ───────────────────────────── state / province pages ───────────────────────────── */

export function regionContent(t: LocalTarget, r: Region) {
  const pro = targetPro(t);
  const name = targetName(t);
  const list = citiesIn(r.code);
  const top = list.slice(0, 5).map((c) => c.name);
  const services = hubServices(t);
  const prices = services.flatMap((s) => s.packages.map((p) => p.price));
  const priceFrom = prices.length ? Math.min(...prices) : null;
  const what = r.country === "canada" ? (["YT", "NT", "NU"].includes(r.code) ? "territory" : "province") : r.code === "DC" ? "district" : "state";
  return {
    metaTitle: `${plural(pro)} in ${r.name} | ${name} Across ${r.name}`.slice(0, 65),
    metaDescription: `Professional ${name.toLowerCase()} across ${r.name}: ${listText(top)} and ${Math.max(list.length - top.length, 0)} more cities. MacroSnaps' own crews${priceFrom ? `, packages from $${priceFrom}` : ""}.`,
    h1: `${plural(pro)} in ${r.name}`,
    intro: [
      `MacroSnaps provides ${name.toLowerCase()} throughout ${r.name}, from ${listText(top.slice(0, 3))} to smaller communities across the ${what}. We are one company with our own photographers and videographers — not a marketplace — so every event in ${r.name} gets the same standards, pricing and delivery times.`,
      `Our crews cover conferences, corporate events, galas, private celebrations and weddings in ${r.name}. Choose your city below to see local venues, packages and answers to common questions, or book directly online.`,
    ],
    priceFrom,
    cities: list,
  };
}

const HUB_COVERAGE = {
  photo: [
    "Conferences, summits & conventions",
    "Corporate events, launches & galas",
    "Trade shows & expos",
    "Weddings & engagements",
    "Birthdays, Bar & Bat Mitzvahs & cultural events",
    "Headshots & team photos",
    "Commercial, product & real estate photography",
    "Family, maternity & graduation portraits",
  ],
  video: [
    "Conference & keynote recordings",
    "Corporate & brand videos",
    "Event recap & highlight videos",
    "Wedding films",
    "Live streaming",
    "Testimonial & interview videos",
  ],
};

export function listText(items: string[]) {
  if (items.length <= 1) return items.join("");
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;
}

function topicDesc(topic: Topic, t: LocalTarget) {
  return {
    conference: "conferences, keynotes, panels and expos",
    corporate: "corporate events, launches and galas",
    event: "galas, parties and celebrations",
    wedding: "ceremonies, receptions and elopements",
    general: "weddings, engagements, events and conferences",
  }[topic];
}
