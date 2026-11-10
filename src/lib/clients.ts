const b = (id: string) => `https://static.wixstatic.com/media/b8cb3c_${id}~mv2.png`;
export const CLIENTS: { name: string; logo: string }[] = [
  ["IEEE", "745ebbf8dd2c4539beb0fb342ca87b1a"], ["Zinnov", "6310ff92a11a4261a8a4434e49a56881"],
  ["The Digital Health", "6f0b290a150d4a2883ac34e425861b06"], ["FUTR", "ffa4e55b65664bb281cac77b35eb932c"],
  ["Summit 2022 Washington DC", "bf4756a38bcc451d88d1ffb2e8170243"], ["Steelcase", "a390581a1b514ffcb3a68a12f3202c18"],
  ["PwC", "1da6f892483047bd81ae27f39edb8b3d"], ["Pulse", "f4561c954f86405da30e0e6c62f3a232"],
  ["Principles First", "423f559885e5470c9b5885ec171f9f9e"], ["NYN Media", "b86f3dc882284ac2a6e37fdb016bf01b"],
  ["Nurses", "d85119e072404d3ea93620f9f59570ba"], ["Candela Awards", "cd1b4917ca204b17ae6fb1155c8cd96a"],
  ["SE", "5420deb87d4d45abad1ef02d72fb9dbc"], ["Nuair", "57dca35406ff4605a09cfac352fe3fbf"],
  ["NTSC", "8a7b5663b16747b78ba627f79e7caa92"], ["Nonprofit Westchester", "b957b10bd43c479ca4b628e0a59e382d"],
  ["New Jersey Hudson", "fa0b5a62a44040658fc6d4147fd05f91"], ["NEON", "6a826b9903bb40d2b5b97f9cf3bcb410"],
  ["MFA", "2436f6afe66f4a3396a9062750dd416b"], ["Maynooth University", "a2ebed8d70064327abf8b0eac6264e3b"],
  ["Infopro Digital", "8e418dd479094efda11c6685c94a2842"], ["Corinium", "0c2b4ef6409a4c6ba9600dc97280c8fb"],
  ["AP Space", "6b813506f78b4ef1bd9c0e57b8714c4d"], ["Innovation Value", "93969c06889445bfadd12b267e77dcca"],
  ["iGaming", "206b218ace434d5b919ec677c2d751a6"], ["God's Remnant", "42e36c4f69fa4ac58ea4c02878fa699f"],
  ["Department of Justice", "0db5058b204948c5b365dce13249d048"], ["DTC Live", "6922441f10614a9c82081bd8663fed1c"],
  ["Dev Global", "de1ad1046e1a431c9c9f948b38de74fd"], ["Clio", "928808d99b5241a9adafb2c39ce1fb22"],
  ["Deloitte", "8573c3000e3e4730beb1a29d64d9d52b"],
].map(([name, id]) => ({ name, logo: b(id) }));

/** Logos hosted on our own site (public/logos), shown first along with the biggest names. */
const LOCAL: { name: string; logo: string }[] = [
  { name: "DoorDash", logo: "/logos/doordash.png" },
  { name: "FIX Trading Community", logo: "/logos/fix-trading-community.png" },
  { name: "German American Chamber of Commerce (GACC West)", logo: "/logos/gacc-ahk.png" },
  { name: "City of Alexandria", logo: "/logos/city-of-alexandria.png" },
  { name: "Bergen County, NJ", logo: "/logos/bergen-county.png" },
  { name: "City of Hoboken", logo: "/logos/city-of-hoboken.png" },
  { name: "Quality Trust for Individuals with Disabilities", logo: "/logos/quality-trust.png" },
  { name: "Pulse", logo: "/logos/pulse.png" },
];
const LEAD = ["DoorDash", "PwC", "Deloitte", "IEEE", "Department of Justice", "FIX Trading Community", "Steelcase", "German American Chamber of Commerce (GACC West)", "City of Alexandria", "Bergen County, NJ", "Infopro Digital", "City of Hoboken", "Quality Trust for Individuals with Disabilities"];

const f = (id: string) => `https://static.wixstatic.com/media/1f3625_${id}~mv2.png`;
export const REVIEW_BADGES = [
  { name: "5-star reviews", logo: f("2abdfb8b02fb428d945575e13b4adb80") },
  { name: "Facebook 5-star rating", logo: f("33af940aaaf74a63bca5e6aafdb3d39d") },
  { name: "Thumbtack 5 stars", logo: f("61c92145de364912813d1af168107189") },
  { name: "WeddingWire rated", logo: f("f61ace469b8f478bb0d449bf6dd1eb1d") },
  { name: "The Knot 5-star reviews", logo: f("6fcd590bae01406880d72310fc1e29b0") },
];

import coverage from "@/data/coverage.json";

export type CoveredEvent = { name: string; where: string; year: string; image: string; url: string; status: "covered" | "partner" };
export const EVENTS = (coverage.events as CoveredEvent[]).sort((a, b) => (b.year || "0").localeCompare(a.year || "0"));

/** Logo wall: MacroSnaps conference & event clients. */
export const ALL_CLIENTS = (() => {
  const seen = new Set<string>();
  const out: { name: string; logo: string }[] = [];
  // Only event / conference clients — MacroHype's marketing clients are deliberately excluded.
  const EVENT_CLIENTS = new Set<string>([]); // CDAO is shown via Corinium; NTSC and Dev Global are already in CLIENTS
  const extra = (coverage.clients as { name: string; logo: string }[]).filter((c) => EVENT_CLIENTS.has(c.name));
  const all = [...LOCAL, ...CLIENTS, ...extra];
  const lead = LEAD.map((n) => all.find((c) => c.name === n)).filter((c): c is { name: string; logo: string } => !!c);
  for (const c of [...lead, ...all]) {
    const k = c.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(c);
  }
  return out;
})();
