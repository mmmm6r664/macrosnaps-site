"use server";
import { revalidatePath } from "next/cache";
import { q, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function saveArticle(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id")) || 0;
  const title = String(f.get("title") ?? "").trim().slice(0, 200);
  const body = String(f.get("body") ?? "").slice(0, 50000);
  const category = String(f.get("category") ?? "General").trim().slice(0, 60) || "General";
  const published = f.get("published") === "on";
  const sort = Number(f.get("sort")) || 0;
  if (!title) return;
  if (id) await q`update kb_articles set title = ${title}, body = ${body}, category = ${category}, published = ${published}, sort = ${sort}, updated_at = now() where id = ${id}`;
  else await q`insert into kb_articles (title, body, category, published, sort) values (${title}, ${body}, ${category}, ${published}, ${sort})`;
  await audit(u.id, "kb_save", title);
  revalidatePath("/admin/knowledge");
}

export async function deleteArticle(f: FormData) {
  const u = await requireUser();
  await q`delete from kb_articles where id = ${Number(f.get("id"))}`;
  await audit(u.id, "kb_delete", String(f.get("id")));
  revalidatePath("/admin/knowledge");
}
