// Turns a plain-English request into booking-form values, e.g.
// "conference photography in Javits Center in New York City from 9 am to 5 pm, 2 photographers, November 12th".
import "server-only";
import { matchRequest } from "@/lib/match";
import { cities, cityLabel, resolveCity } from "@/lib/geo";
import { BOOKABLE_SERVICES } from "@/lib/services";

export type Parsed = {
  service?: string; date?: string; start?: string; end?: string; extraCrew?: number; venue?: string;
  location?: string; addCompanion?: boolean; days?: number; notes: string[]; outOfArea?: string;
};

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
const NUM: Record<string, number> = { one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, a: 1, an: 1 };
const pad = (n: number) => String(n).padStart(2, "0");

function toTime(h: number, m: number, ap?: string) {
  let hh = h % 12;
  if (ap?.startsWith("p")) hh += 12;
  if (!ap && h === 12) hh = 12;
  if (!ap && h < 7) hh += 12; // "from 2 to 6" means afternoon
  if (!ap && h >= 13) hh = h;
  return `${pad(hh)}:${m < 15 ? "00" : m < 45 ? "30" : "00"}`.replace(/^(\d\d):00$/, (x) => (m >= 45 ? `${pad((hh + 1) % 24)}:00` : x)); // nearest 30 minutes
}

function parseDate(q: string, now: Date): string | undefined {
  const y = now.getFullYear();
  const mk = (yr: number, mo: number, d: number) => {
    const dt = new Date(Date.UTC(yr, mo, d));
    return dt.getUTCMonth() === mo ? `${yr}-${pad(mo + 1)}-${pad(d)}` : undefined;
  };
  const future = (mo: number, d: number, yr?: number) => {
    if (yr) return mk(yr, mo, d);
    const s = mk(y, mo, d);
    return s && s >= now.toISOString().slice(0, 10) ? s : mk(y + 1, mo, d);
  };
  let m = q.match(/\b(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*\.?\s+(\d{1,2})(?:st|nd|rd|th)?(?:,?\s*(20\d\d))?/);
  if (m) return future(MONTHS.indexOf(m[1].slice(0, 3)), Number(m[2]), m[3] ? Number(m[3]) : undefined);
  m = q.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+(?:of\s+)?(jan|feb|mar|apr|may|jun|jul|aug|sep|sept|oct|nov|dec)[a-z]*(?:,?\s*(20\d\d))?/);
  if (m) return future(MONTHS.indexOf(m[2].slice(0, 3)), Number(m[1]), m[3] ? Number(m[3]) : undefined);
  m = q.match(/\b(\d{1,2})\/(\d{1,2})(?:\/(\d{2,4}))?\b/);
  if (m) return future(Number(m[1]) - 1, Number(m[2]), m[3] ? Number(m[3].length === 2 ? `20${m[3]}` : m[3]) : undefined);
  m = q.match(/\b(20\d\d)-(\d{2})-(\d{2})\b/);
  if (m) return mk(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  m = q.match(/\b(next\s+|this\s+)?(sunday|monday|tuesday|wednesday|thursday|friday|saturday)\b/);
  if (m) {
    const target = days.indexOf(m[2]);
    let add = (target - now.getDay() + 7) % 7 || 7;
    if (m[1]?.startsWith("next") && add < 7) add += 7;
    const d = new Date(now.getTime() + add * 864e5);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }
  return undefined;
}

export function parseBooking(raw: string, now = new Date()): Parsed {
  const q = raw.toLowerCase().replace(/\s+/g, " ").trim();
  const out: Parsed = { notes: [] };
  const match = matchRequest(raw);
  if (match.url === "/locations" && match.headline.startsWith("Sorry")) { out.outOfArea = match.note; return out; }

  // Service: the matcher's booking link names the right bookable service.
  const svc = match.bookUrl ? new URL(match.bookUrl, "https://x").searchParams.get("service") : null;
  const video = /\bvideo|videograph|film|reel|recap/.test(q);
  const photo = /\bphoto|photograph|pictures|headshot/.test(q);
  if (svc && BOOKABLE_SERVICES.some((s) => s.slug === svc)) out.service = svc;
  if (photo && video) {
    out.addCompanion = true;
    const asPhoto = out.service?.replace(/-videography$/, "-photography");
    if (asPhoto && BOOKABLE_SERVICES.some((s) => s.slug === asPhoto)) out.service = asPhoto; // photos first, video as the add-on
  }

  // City
  const cityLink = match.bookUrl ? new URL(match.bookUrl, "https://x").searchParams.get("city") : null;
  const city = (cityLink && cities.find((c) => c.slug === cityLink)) || undefined;
  if (city) out.location = cityLabel(city);
  else { const c = /\bnyc\b|new york city|manhattan/.test(q) ? resolveCity("New York") : undefined; if (c) out.location = cityLabel(c); }

  out.date = parseDate(q, now);

  // Times: "9 am to 5 pm", "from 9-5", "9:30am - 1pm", "14:00 to 18:00"
  const t = q.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?\s*(?:-|–|to|until|till)\s*(\d{1,2})(?::(\d{2}))?\s*(am|pm|a\.m\.|p\.m\.)?/);
  if (t && Number(t[1]) <= 24 && Number(t[4]) <= 24) {
    const ap2 = t[6]?.[0], ap1 = t[3]?.[0] ?? (ap2 === "p" && Number(t[1]) < Number(t[4]) && Number(t[1]) !== 12 ? "p" : ap2 === "p" && Number(t[1]) >= 7 ? "a" : undefined);
    out.start = toTime(Number(t[1]), Number(t[2] ?? 0), ap1);
    out.end = toTime(Number(t[4]), Number(t[5] ?? 0), ap2 ?? (Number(t[4]) < Number(t[1]) ? "p" : undefined));
  } else {
    const h = q.match(/\b(\d{1,2}|one|two|three|four|five|six)\s*(?:hours?|hrs?)\b/);
    const s = q.match(/\b(?:at|from|starting)\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/);
    if (s) {
      out.start = toTime(Number(s[1]), Number(s[2] ?? 0), s[3]);
      if (h) { const n = Number(h[1]) || NUM[h[1]] || 2; const [hh, mm] = out.start.split(":").map(Number); out.end = `${pad((hh + n) % 24)}:${pad(mm)}`; }
    } else if (h) out.notes.push(`${h[1]} hours: add the start time`);
  }

  // Crew: "2 photographers" = 1 additional on top of the first
  const crew = q.match(/\b(\d|one|two|three|four)\s+(photographers|videographers|camera operators|shooters)\b/);
  if (crew) out.extraCrew = Math.min(3, Math.max(0, (Number(crew[1]) || NUM[crew[1]] || 1) - 1));

  // Multi-day: "3 day conference"
  const md = q.match(/\b(\d|two|three|four|five)[ -]days?\b/);
  if (md) out.days = Math.min(10, Number(md[1]) || NUM[md[1]] || 1);

  // Venue: "at/in the Javits Center", "at Marriott Marquis"
  const v = raw.match(/\b(?:at|in)\s+(?:the\s+)?([A-Z][\w'&.-]*(?:\s+(?:[A-Z][\w'&.-]*|of|on|at|the|&))*\s+(?:Center|Centre|Hotel|Hall|Ballroom|Convention Center|Club|Church|Mosque|Masjid|Temple|Synagogue|Museum|Park|Garden|Gardens|Estate|Manor|Inn|Resort|Marquis|Plaza|Theater|Theatre|Arena|Stadium|University|College|Campus|Restaurant|Venue|Room|Loft|Studio|Building|Tower))\b/);
  if (v) out.venue = v[1];
  else { const v2 = raw.match(/\b(?:at)\s+(?:the\s+)?([A-Z][\w'&.-]+(?:\s+[A-Z][\w'&.-]+){0,4})/); if (v2 && !resolveCity(v2[1])) out.venue = v2[1]; }

  if (!out.service) out.notes.push("choose the service");
  if (!out.date) out.notes.push("add the date");
  if (!out.start) out.notes.push("add start and end times");
  if (!out.location) out.notes.push("add the city");
  return out;
}
