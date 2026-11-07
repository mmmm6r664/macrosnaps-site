// Single source of truth for prices — used by the booking form (client) and checkout (server).
export const RATES = {
  photo: { first: 250, extra: 100 },
  video: { first: 300, extra: 200 },
  minHours: 2,
  maxHours: 14,
  maxCrew: 3, // additional photographers/videographers per day
};
export type Kind = "photo" | "video";
export const hourPrice = (kind: Kind, h: number) => RATES[kind].first + RATES[kind].extra * (h - 1);
/** Each additional photographer/videographer: the additional-hour rate for every hour of coverage. */
export const crewPrice = (kind: Kind, h: number) => RATES[kind].extra * h;

export type SessionInput = { date: string; start: string; end: string; venue?: string; extraCrew?: number };

const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const durationHours = (s: { start: string; end: string }) =>
  s.start && s.end ? ((((toMin(s.end) - toMin(s.start)) % 1440) + 1440) % 1440) / 60 : 0;
export const billedHours = (s: { start: string; end: string }) =>
  Math.min(Math.max(Math.ceil(durationHours(s) - 1e-9), RATES.minHours), RATES.maxHours);

export type Line = { label: string; amount: number };

/** Hourly booking: main service + extra crew + optional companion service (photo↔video), per day. */
export function quoteHourly(kind: Kind, sessions: SessionInput[], addCompanion: boolean) {
  const other: Kind = kind === "photo" ? "video" : "photo";
  const lines: Line[] = [];
  sessions.forEach((s, i) => {
    const h = billedHours(s);
    const tag = sessions.length > 1 ? `Day ${i + 1} (${s.date})` : s.date;
    lines.push({ label: `${tag}: ${kind === "photo" ? "Photography" : "Videography"}, ${h} hrs`, amount: hourPrice(kind, h) });
    const crew = Math.min(Math.max(Math.floor(s.extraCrew ?? 0), 0), RATES.maxCrew);
    if (crew) lines.push({ label: `${tag}: ${crew} additional ${kind === "photo" ? "photographer" : "videographer"}${crew > 1 ? "s" : ""}, ${h} hrs`, amount: crew * crewPrice(kind, h) });
    if (addCompanion) lines.push({ label: `${tag}: ${other === "photo" ? "Photography" : "Videography"} add-on, ${h} hrs`, amount: hourPrice(other, h) });
  });
  return { lines, total: lines.reduce((a, l) => a + l.amount, 0) };
}

/** Bookings need at least 48 hours' notice. Times are compared in US Eastern time. */
export const MIN_NOTICE_HOURS = 48;
const nyLocal = (d: Date) => {
  const p = Object.fromEntries(new Intl.DateTimeFormat("en-CA", { timeZone: "America/New_York", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).formatToParts(d).map((x) => [x.type, x.value]));
  return `${p.year}-${p.month}-${p.day}T${p.hour}:${p.minute}`;
};
/** Earliest allowed start, as "YYYY-MM-DDTHH:MM" (Eastern). */
export const earliestStart = (now = new Date()) => nyLocal(new Date(now.getTime() + MIN_NOTICE_HOURS * 3600e3));
export const isTooSoon = (date: string, start: string, now = new Date()) => `${date}T${start}` < earliestStart(now);
