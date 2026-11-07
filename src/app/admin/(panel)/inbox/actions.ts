"use server";
import { revalidatePath } from "next/cache";
import { db, audit, q } from "@/lib/db";
import { requireUser } from "@/lib/auth";

export async function updateInquiry(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const status = String(f.get("status") ?? "");
  if (!["new", "in_progress", "done", "rejected"].includes(status)) return;
  await q`update inquiries set status = ${status}, notes = ${String(f.get("notes") ?? "").slice(0, 10000)} where id = ${id}`;
  await audit(u.id, "inquiry_update", `#${id} ${status}`);
  revalidatePath(`/admin/inbox/${id}`);
  revalidatePath("/admin/inbox");
}
