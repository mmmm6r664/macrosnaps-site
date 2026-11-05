// Camera bodies for the careers application. year = release year, price = approximate US launch price (USD).
// Eligibility: released 2015 or later AND launch price of $1,000 or more.
export type Camera = { id: string; brand: string; model: string; year: number; price: number };

const C = (brand: string, rows: [string, number, number][]): Camera[] =>
  rows.map(([model, year, price]) => ({ id: `${brand}-${model}`.toLowerCase().replace(/[^a-z0-9]+/g, "-"), brand, model, year, price }));

export const CAMERAS: Camera[] = [
  ...C("Sony", [["a1", 2021, 6499], ["a9 III", 2023, 5999], ["a9 II", 2019, 4499], ["a9", 2017, 4499], ["a7R V", 2022, 3899], ["a7R IV", 2019, 3499], ["a7R III", 2017, 3199], ["a7S III", 2020, 3499], ["a7 IV", 2021, 2499], ["a7 III", 2018, 1999], ["a7C II", 2023, 2199], ["a7C", 2020, 1799], ["ZV-E1", 2023, 2199], ["FX6", 2020, 5999], ["FX3", 2021, 3899], ["FX30", 2022, 1799], ["a6700", 2023, 1399], ["a6600", 2019, 1399], ["a6400", 2019, 899], ["a6100", 2019, 749], ["a7 II", 2014, 1699], ["a6000", 2014, 649]]),
  ...C("Canon", [["EOS R1", 2024, 6299], ["EOS R3", 2021, 5999], ["EOS R5 Mark II", 2024, 4299], ["EOS R5", 2020, 3899], ["EOS R6 Mark II", 2022, 2499], ["EOS R6", 2020, 2499], ["EOS R", 2018, 2299], ["EOS R8", 2023, 1499], ["EOS R7", 2022, 1499], ["EOS RP", 2019, 1299], ["EOS-1D X Mark III", 2020, 6499], ["EOS-1D X Mark II", 2016, 5999], ["EOS 5D Mark IV", 2016, 3499], ["EOS 6D Mark II", 2017, 1999], ["EOS 90D", 2019, 1199], ["EOS 80D", 2016, 1199], ["EOS C70", 2020, 5499], ["EOS C300 Mark III", 2020, 10999], ["EOS R10", 2022, 979], ["EOS R50", 2023, 679], ["EOS Rebel T7", 2018, 449], ["EOS 5D Mark III", 2012, 3499], ["EOS 6D", 2012, 2099]]),
  ...C("Nikon", [["Z9", 2021, 5499], ["Z8", 2023, 3999], ["Z7 II", 2020, 2999], ["Z7", 2018, 3399], ["Z6 III", 2024, 2499], ["Z6 II", 2020, 1999], ["Z6", 2018, 1999], ["Zf", 2023, 1999], ["Z5", 2020, 1399], ["D6", 2020, 6499], ["D5", 2016, 6499], ["D850", 2017, 3299], ["D780", 2020, 2299], ["D500", 2016, 1999], ["D7500", 2017, 1249], ["Z50", 2019, 859], ["D3500", 2018, 499], ["D750", 2014, 2299], ["D610", 2013, 1999]]),
  ...C("Fujifilm", [["GFX 100S", 2021, 5999], ["GFX 50S II", 2021, 3999], ["X-H2S", 2022, 2499], ["X-H2", 2022, 1999], ["X-T5", 2022, 1699], ["X-T4", 2020, 1699], ["X-T3", 2018, 1499], ["X-T2", 2016, 1599], ["X-S20", 2023, 1299], ["X-T30 II", 2021, 899], ["X-T1", 2014, 1299]]),
  ...C("Panasonic", [["Lumix S1H", 2019, 3999], ["Lumix S1R", 2019, 3699], ["Lumix S1", 2019, 2499], ["Lumix S5 IIX", 2023, 2199], ["Lumix S5 II", 2023, 1999], ["Lumix S5", 2020, 1999], ["Lumix GH7", 2024, 2199], ["Lumix GH6", 2022, 2199], ["Lumix GH5", 2017, 1999], ["Lumix G7", 2015, 799], ["Lumix GH4", 2014, 1699]]),
  ...C("Blackmagic", [["Pyxis 6K", 2024, 2995], ["Cinema Camera 6K", 2023, 2595], ["Pocket Cinema Camera 6K Pro", 2021, 2535], ["Pocket Cinema Camera 6K", 2019, 2495], ["Pocket Cinema Camera 4K", 2018, 1295]]),
  ...C("RED", [["V-Raptor", 2021, 24500], ["Komodo 6K", 2020, 5995]]),
  ...C("Leica", [["SL2", 2019, 5995], ["SL2-S", 2020, 4895], ["Q3", 2023, 5995], ["Q2", 2019, 4995]]),
];
export const BRANDS = [...new Set(CAMERAS.map((c) => c.brand))];

export const EXPERIENCE = [
  { id: "starting", label: "Just starting out", ok: false },
  { id: "lt1", label: "Less than 1 year", ok: false },
  { id: "1-2", label: "1–2 years", ok: true },
  { id: "2-5", label: "2–5 years", ok: true },
  { id: "5-10", label: "5–10 years", ok: true },
  { id: "10+", label: "10+ years", ok: true },
];

export const RADIUS = ["Up to 10 miles", "Up to 25 miles", "Up to 50 miles", "Up to 100 miles", "100+ miles / willing to travel"];
export const ROLES = ["Photographer", "Videographer", "Both photo & video"];
export const SHOOT_TYPES = ["Conferences & corporate events", "Weddings", "Engagements & couples", "Parties & private events", "Cultural & religious ceremonies", "Headshots & portraits", "Family, maternity & newborn", "Real estate", "Product & food", "Commercial / brand video", "Live streaming", "Drone (FAA Part 107)"];

export const NOT_ELIGIBLE =
  "Thank you for your interest in MacroSnaps. At this time we can only accept applications from photographers and videographers with at least 1 year of professional experience and a primary camera body released in 2015 or later, valued at $1,000 or more. You're welcome to apply again once you meet these requirements.";

export function checkEligibility(input: { experience: string; camera: string; otherYear?: string; otherValue?: string }) {
  const exp = EXPERIENCE.find((e) => e.id === input.experience);
  if (!exp || !exp.ok) return false;
  if (input.camera === "other") return input.otherYear === "2015+" && input.otherValue === "1000+";
  const cam = CAMERAS.find((c) => c.id === input.camera);
  return !!cam && cam.year >= 2015 && cam.price >= 1000;
}
