// Sitemap <lastmod>: the date a page's content last really changed. Each URL's content is hashed every time the
// sitemaps are rebuilt; when the hash differs from the stored one, the change date is recorded. A page whose
// change hasn't been observed yet (or whose content lives only in page code) gets no lastmod rather than a guess.
import "server-only";
import { createHash } from "crypto";
import { db, hasDb, q } from "@/lib/db";

export type Versioned = { url: string; content: unknown };
const hash = (v: unknown) => createHash("sha1").update(JSON.stringify(v ?? null)).digest("hex").slice(0, 20);

export async function lastModified(group: string, items: Versioned[]): Promise<Map<string, Date>> {
  const out = new Map<string, Date>();
  if (!hasDb || !items.length) return out;
  try {
    const sql = await db();
    const rows = items.map((i) => ({ url: i.url, grp: group, hash: hash(i.content) }));
    const known = new Map((await sql<{ url: string; hash: string; changed_at: Date | null }[]>`select url, hash, changed_at from page_versions where grp = ${group}`).map((r) => [r.url, r]));
    const fresh = rows.filter((r) => !known.has(r.url));
    const changed = rows.filter((r) => known.has(r.url) && known.get(r.url)!.hash !== r.hash);
    // First sighting: we don't know when it last changed, so no date yet.
    for (let i = 0; i < fresh.length; i += 1000) await sql`insert into page_versions ${sql(fresh.slice(i, i + 1000), "url", "grp", "hash")} on conflict (url) do nothing`;
    for (const r of changed) await sql`update page_versions set hash = ${r.hash}, changed_at = now() where url = ${r.url}`;
    const now = new Date();
    for (const r of rows) {
      if (changed.includes(r)) out.set(r.url, now);
      else { const k = known.get(r.url); if (k?.changed_at) out.set(r.url, new Date(k.changed_at)); }
    }
  } catch (e) {
    console.error("[lastmod]", e);
  }
  return out;
}

/** Newest known change per sitemap group (for the sitemap index). */
export async function groupLastModified(): Promise<Map<string, Date>> {
  if (!hasDb) return new Map();
  const rows = await q<{ grp: string; at: Date }[]>`select grp, max(changed_at) as at from page_versions where changed_at is not null group by grp`.catch(() => []);
  return new Map(rows.map((r) => [r.grp, new Date(r.at)]));
}
