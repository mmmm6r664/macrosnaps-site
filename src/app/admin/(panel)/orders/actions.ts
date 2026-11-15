"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { q, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";

const s = (f: FormData, k: string, n: number) => String(f.get(k) ?? "").trim().slice(0, n);
const cents = (f: FormData, k: string) => Math.round((Number(String(f.get(k) ?? "").replace(/[$,]/g, "")) || 0) * 100);
const PAY = ["PAID", "NOT_PAID", "PARTIALLY_PAID", "FULLY_REFUNDED", "PARTIALLY_REFUNDED"];

export async function updateOrder(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  if (!Number.isInteger(id)) return;
  const pay = s(f, "payment_status", 30);
  const total = cents(f, "total"), paid = cents(f, "paid");
  await q`update orders set event = ${s(f, "event", 200) || null}, company = ${s(f, "company", 160) || null}, location = ${s(f, "location", 300) || null},
    event_date = ${s(f, "event_date", 120) || null}, notes = ${s(f, "notes", 4000) || null}, name = ${s(f, "name", 120)}, email = ${s(f, "email", 200).toLowerCase() || null},
    phone = ${s(f, "phone", 40) || null}, payment_status = ${PAY.includes(pay) ? pay : null}, total_cents = ${total}, paid_cents = ${paid},
    balance_cents = ${pay === "PAID" || pay.includes("REFUNDED") ? 0 : Math.max(0, total - paid)} where id = ${id}`;
  await audit(u.id, "order_update", String(id));
  revalidatePath(`/admin/orders/${id}`); revalidatePath("/admin/orders");
  redirect(`/admin/orders/${id}?saved=1`);
}

export async function deleteOrder(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  if (!Number.isInteger(id)) return;
  const [o] = await q<{ number: string | null; client_id: number | null }[]>`delete from orders where id = ${id} returning number, client_id`;
  await audit(u.id, "order_delete", `${id} #${o?.number ?? ""}`);
  revalidatePath("/admin/orders");
  redirect(o?.client_id ? `/admin/clients/${o.client_id}` : "/admin/orders?deleted=1");
}
