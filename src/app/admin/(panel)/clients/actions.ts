"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const s = (f: FormData, k: string, n: number) => String(f.get(k) ?? "").trim().slice(0, n);

export async function updateClient(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  if (!Number.isInteger(id)) return;
  const email = s(f, "email", 200).toLowerCase() || null;
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) redirect(`/admin/clients/${id}?err=email`);
  if (email && (await q`select 1 from clients where email = ${email} and id <> ${id}`).length) redirect(`/admin/clients/${id}?err=dupe`);
  const labels = s(f, "labels", 600).split(",").map((x) => x.trim()).filter(Boolean).slice(0, 20);
  await q`update clients set first_name = ${s(f, "first_name", 60)}, last_name = ${s(f, "last_name", 60)}, email = ${email}, phone = ${s(f, "phone", 40) || null},
    company = ${s(f, "company", 120) || null}, address = ${s(f, "address", 400) || null}, labels = ${labels.length ? labels : null}, notes = ${s(f, "notes", 4000) || null}, updated_at = now()
    where id = ${id}`;
  await audit(u.id, "client_update", String(id));
  revalidatePath(`/admin/clients/${id}`);
  redirect(`/admin/clients/${id}?saved=1`);
}

export async function deleteClient(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  if (!Number.isInteger(id)) return;
  const withOrders = f.get("orders") === "on";
  if (withOrders) await q`delete from orders where client_id = ${id}`;
  const [c] = await q<{ email: string | null }[]>`delete from clients where id = ${id} returning email`;
  await audit(u.id, "client_delete", `${id} ${c?.email ?? ""}${withOrders ? " +orders" : ""}`);
  revalidatePath("/admin/clients");
  redirect("/admin/clients?deleted=1");
}
