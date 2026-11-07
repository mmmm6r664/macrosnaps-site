"use server";
import { revalidatePath } from "next/cache";
import { randomBytes } from "crypto";
import { db, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export type S = { error?: string; ok?: string } | undefined;

/** Add one or many subscribers: paste emails separated by commas, spaces or new lines (or "Name <email>" lines). */
export async function importSubscribers(_: S, f: FormData): Promise<S> {
  const u = await requireUser();
  if (f.get("consent") !== "on") return { error: "Confirm these people agreed to receive your emails." };
  const text = String(f.get("emails") ?? "").slice(0, 500_000);
  const found = [...new Set((text.match(/[^\s,;<>"']+@[^\s,;<>"']+\.[A-Za-z]{2,}/g) ?? []).map((e) => e.toLowerCase()))].slice(0, 20000);
  if (!found.length) return { error: "No email addresses found." };
  const sql = await db();
  let added = 0;
  for (const email of found) {
    const r = await sql`insert into subscribers (email, token, source) values (${email}, ${randomBytes(18).toString("base64url")}, 'import') on conflict (email) do nothing returning id`;
    added += r.length;
  }
  await audit(u.id, "subscribers_import", `${added}/${found.length}`);
  revalidatePath("/admin/subscribers");
  return { ok: `Added ${added} new subscriber${added === 1 ? "" : "s"} (${found.length - added} already on the list).` };
}

export async function setSubscriber(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const op = String(f.get("op"));
  const sql = await db();
  if (op === "delete") await sql`delete from subscribers where id = ${id}`;
  else if (op === "unsubscribe") await sql`update subscribers set status = 'unsubscribed' where id = ${id}`;
  else if (op === "resubscribe") await sql`update subscribers set status = 'subscribed' where id = ${id}`;
  else return;
  await audit(u.id, `subscriber_${op}`, String(id));
  revalidatePath("/admin/subscribers");
}
