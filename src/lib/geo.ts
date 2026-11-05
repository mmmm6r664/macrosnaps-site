import citiesData from "@/data/cities.json";
import regionsData from "@/data/regions.json";
import localData from "@/data/local/index";

export type Country = "us" | "canada";

export type Region = {
  country: Country;
  code: string;
  name: string;
  slug: string;
  region: string;
};

export type City = {
  id: number;
  name: string;
  country: Country;
  state: string;
  stateName: string;
  stateSlug: string;
  slug: string;
  population: number;
  rank: number;
  lat: number;
  lng: number;
  nearby: { slug: string; name: string; state: string; mi: number }[];
  studioMiles: { nyc: number; dc: number };
};

export type LocalInfo = {
  conferenceVenues?: string[];
  eventVenues?: string[];
  photoSpots?: string[];
  neighborhoods?: string[];
  airport?: string;
  blurb?: string;
};

export const regions = regionsData as Region[];
export const cities = citiesData as City[];

const cityBySlug = new Map(cities.map((c) => [c.slug, c]));
const regionBySlug = new Map(regions.map((r) => [r.slug, r]));
const regionByCode = new Map(regions.map((r) => [r.code, r]));

for (const c of cities) {
  if (regionBySlug.has(c.slug)) throw new Error(`Slug collision between city and region: ${c.slug}`);
}

export const getCity = (slug: string) => cityBySlug.get(slug);
export const getRegion = (slug: string) => regionBySlug.get(slug);
export const getRegionByCode = (code: string) => regionByCode.get(code);
export const getLocal = (slug: string): LocalInfo | undefined => (localData as Record<string, LocalInfo>)[slug];

export const citiesIn = (regionCode: string) =>
  cities.filter((c) => c.state === regionCode).sort((a, b) => a.rank - b.rank);

export const usRegions = regions.filter((r) => r.country === "us").sort((a, b) => a.name.localeCompare(b.name));
export const caRegions = regions.filter((r) => r.country === "canada").sort((a, b) => a.name.localeCompare(b.name));

/** "San Francisco, CA" */
export const cityLabel = (c: City) => (c.slug === "washington-dc" ? "Washington, DC" : `${c.name}, ${c.state}`);

export const topCities = (n: number) => [...cities].sort((a, b) => b.population - a.population).slice(0, n);

/** Cities that are pre-rendered at build time; the rest render on first request and are cached. */
export const prerenderCities = () => {
  const set = new Set(topCities(150).map((c) => c.slug));
  for (const c of cities) if (c.rank <= 3) set.add(c.slug);
  return [...set];
};

export const fmtPop = (n: number) =>
  n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1).replace(/\.0$/, "")} million` : n >= 10_000 ? `${Math.round(n / 1000)},000` : n.toLocaleString("en-US");

/** Deterministic pick so each city gets a stable but different variant. */
export function pick<T>(arr: T[], seed: number, salt = 0): T {
  const x = Math.abs(Math.sin(seed * 9301 + salt * 49297) * 233280);
  return arr[Math.floor(x) % arr.length];
}
