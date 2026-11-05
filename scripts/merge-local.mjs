// Merges researched local details (batch*.json) into one file that is bundled with the site.
import fs from "node:fs";
const dir = "src/data/local";
const merged = {};
for (const f of fs.readdirSync(dir).filter((f) => /^batch\d+\.json$/.test(f)).sort()) {
  Object.assign(merged, JSON.parse(fs.readFileSync(`${dir}/${f}`, "utf8")));
}
// aliases for slugs that were renamed after research, then drop anything not in cities.json
const ALIAS = { "lexington-fayette-ky": "lexington-ky" };
for (const [from, to] of Object.entries(ALIAS)) if (merged[from] && !merged[to]) merged[to] = merged[from];
const valid = new Set(JSON.parse(fs.readFileSync("src/data/cities.json", "utf8")).map((c) => c.slug));
for (const k of Object.keys(merged)) if (!valid.has(k)) delete merged[k];
fs.writeFileSync(`${dir}/merged.json`, JSON.stringify(merged));
console.log(`local details: ${Object.keys(merged).length} cities`);
