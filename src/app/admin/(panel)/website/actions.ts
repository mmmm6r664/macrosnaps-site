"use server";
import { revalidatePath, revalidateTag } from "next/cache";
import { db, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type S = { error?: string; ok?: string } | undefined;
const t = (f: FormData, k: string, n: number) => String(f.get(k) ?? "").replace(/[<>]/g, "").trim().slice(0, n);

async function save(key: string, value: unknown, userId: number) {
  const sql = await db();
  if (value === null) await sql`delete from settings where key = ${key}`;
  else await sql`insert into settings (key, value, updated_by) values (${key}, ${sql.json(JSON.parse(JSON.stringify(value)))}, ${userId})
    on conflict (key) do update set value = excluded.value, updated_at = now(), updated_by = excluded.updated_by`;
  revalidateTag("settings");
  revalidatePath("/", "layout");
  await audit(userId, "setting_update", key);
}

export async function saveAnnouncement(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const link = t(f, "link", 300);
  if (link && !/^(\/[^\s]*|https:\/\/[^\s]+)$/.test(link)) return { error: "The link must start with / (a page on your site) or https://" };
  await save("announcement", { enabled: f.get("enabled") === "on", text: t(f, "text", 200), link, linkText: t(f, "linkText", 40) }, u.id);
  return { ok: "Saved. The website updates within a minute." };
}

export async function saveHero(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const headline = t(f, "headline", 120);
  if (!headline) return { error: "The headline can't be empty." };
  await save("home_hero", { headline }, u.id);
  return { ok: "Saved. The website updates within a minute." };
}

export async function saveFaqs(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  if (f.get("reset") === "1") { await save("home_faqs", null, u.id); return { ok: "Restored the original FAQs." }; }
  const qs = f.getAll("q").map((v) => String(v).replace(/[<>]/g, "").trim().slice(0, 300));
  const as = f.getAll("a").map((v) => String(v).replace(/[<>]/g, "").trim().slice(0, 3000));
  const faqs = qs.map((q, i) => ({ q, a: as[i] ?? "" })).filter((x) => x.q && x.a).slice(0, 40);
  if (!faqs.length) return { error: "Add at least one question and answer." };
  await save("home_faqs", faqs, u.id);
  return { ok: `Saved ${faqs.length} FAQs. The website updates within a minute.` };
}

export async function saveReviewUrl(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  const url = String(f.get("url") ?? "").trim().slice(0, 500);
  if (url && !/^https:\/\/\S+$/.test(url)) return { error: "Paste the full link starting with https://" };
  await save("google_review_url", url || null, u.id);
  return { ok: url ? "Saved. Clients who give 4 or 5 stars will be invited to review you there." : "Removed. Review invitations are off." };
}
