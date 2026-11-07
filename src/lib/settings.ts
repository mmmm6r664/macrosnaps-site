// Website content that can be edited from the admin portal. Falls back to the built-in defaults
// whenever the database isn't connected or a value hasn't been changed.
import "server-only";
import { unstable_cache } from "next/cache";
import { db, hasDb, q } from "@/lib/db";

export type Announcement = { enabled: boolean; text: string; link: string; linkText: string };
export type HomeHero = { headline: string };
export type Faq = { q: string; a: string };

export const DEFAULTS = {
  announcement: { enabled: false, text: "", link: "", linkText: "" } as Announcement,
  home_hero: { headline: "America's Premier Event and Wedding Photography and Videography Company" } as HomeHero,
  home_faqs: null as Faq[] | null, // null = use the FAQs written in the code
};
export type SettingKey = keyof typeof DEFAULTS;

const load = unstable_cache(
  async (): Promise<Record<string, unknown>> => {
    if (!hasDb) return {};
    try {
      const rows = await q<{ key: string; value: unknown }[]>`select key, value from settings`;
      return Object.fromEntries(rows.map((r) => [r.key, r.value]));
    } catch (e) {
      console.error("[settings] load failed", e);
      return {};
    }
  },
  ["site-settings"],
  { tags: ["settings"], revalidate: 3600 },
);

export async function getSetting<K extends SettingKey>(key: K): Promise<(typeof DEFAULTS)[K]> {
  const all = await load();
  return (all[key] ?? DEFAULTS[key]) as (typeof DEFAULTS)[K];
}
