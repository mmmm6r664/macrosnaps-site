// Booking add-ons (upsells) beyond the photo ↔ video companion. Prices always come from the service catalog:
// each add-on uses the smallest standard (online-bookable) package of its service. An add-on whose service has
// no bookable package (e.g. live streaming today) is simply not offered. Used by /book (server) and /api/checkout.
import { getService } from "./services";
import { TOUR_STATES } from "./pageMedia";
import type { Line } from "./pricing";

const EVENTS = [
  "conference-photography", "conference-videography", "corporate-event-photography", "corporate-videography", "trade-show-photography",
  "event-photography", "event-videography", "wedding-photography", "wedding-videography",
];

type Def = { id: string; service: string; title: string; blurb: string; services: string[]; states?: string[] };
const DEFS: Def[] = [
  { id: "live-stream", service: "live-stream", title: "Live streaming", blurb: "Stream your event to remote guests or attendees.", services: EVENTS },
  { id: "photo-booth", service: "photo-booth", title: "Photo booth", blurb: "An iPad photo booth with an attendant for 3 hours (the minimum). Digital photos only, shared instantly by text or email; no prints.", services: EVENTS },
  { id: "re-photo", service: "real-estate-photography", title: "Real estate photography", blurb: "Professional listing photos of the same property, taken during the same visit.", services: ["virtualtours"] },
  { id: "re-video", service: "real-estate-videography", title: "Real estate video", blurb: "A walkthrough video of the property for your listing and social media.", services: ["virtualtours"] },
  { id: "virtual-tour", service: "virtualtours", title: "3D virtual tour", blurb: "A Matterport 3D tour of the property with the first month of hosting included. Larger properties are priced by size on our 3D tours page.", services: ["real-estate-photography", "real-estate-videography"], states: TOUR_STATES },
];

export type Addon = { id: string; title: string; packageName: string; price: number; blurb: string; services: string[]; states?: string[] };

/** Add-ons that have a published price, with the smallest standard package of their service. */
export function addonCatalog(): Addon[] {
  const out: Addon[] = [];
  for (const d of DEFS) {
    const pkgs = (getService(d.service)?.packages ?? []).filter((p) => !p.quoteOnly && p.price > 0);
    if (!pkgs.length) continue;
    const p = pkgs.reduce((a, b) => (b.price < a.price ? b : a));
    out.push({ id: d.id, title: d.title, packageName: p.name, price: p.price, blurb: d.blurb, services: d.services, states: d.states });
  }
  return out;
}

export const addonAvailable = (a: Addon, serviceSlug: string, state?: string) =>
  a.services.includes(serviceSlug) && (!a.states || (!!state && a.states.includes(state)));

export const addonLabel = (a: Addon) => `${a.title} add-on: ${a.packageName}`;

/** Server-side: validate requested add-on ids and price them from the catalog. */
export function priceAddons(serviceSlug: string, requested: unknown, state?: string): { lines: Line[]; names: string[] } | { error: string } {
  const ids = Array.isArray(requested) ? [...new Set(requested.filter((x): x is string => typeof x === "string").slice(0, 10))] : [];
  const catalog = addonCatalog();
  const lines: Line[] = [];
  const names: string[] = [];
  for (const id of ids) {
    const a = catalog.find((x) => x.id === id);
    if (!a || !a.services.includes(serviceSlug)) return { error: "That add-on isn't available for this service" };
    if (!addonAvailable(a, serviceSlug, state))
      return { error: `${a.title}s are only available in ${a.states!.join(", ")}. Please choose your city from the list, or remove the add-on.` };
    lines.push({ label: addonLabel(a), amount: a.price });
    names.push(addonLabel(a));
  }
  return { lines, names };
}
