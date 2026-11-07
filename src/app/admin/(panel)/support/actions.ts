"use server";
import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { teamUpdate, STATUS_LABEL } from "@/lib/tickets";

export type UState = { ok?: string; error?: string } | undefined;

export async function updateTicket(_: UState, f: FormData): Promise<UState> {
  const u = await requireUser();
  const id = Number(f.get("id"));
  const reply = String(f.get("reply") ?? "").trim().slice(0, 8000);
  const note = String(f.get("note") ?? "").trim().slice(0, 8000);
  const status = String(f.get("status") ?? "");
  const r = await teamUpdate(id, { by: { id: u.id, name: u.name }, reply, note, status });
  if ("error" in r) return { error: r.error };
  revalidatePath(`/admin/support/${id}`);
  revalidatePath("/admin/support");
  const parts = [reply && "Reply sent", note && "Note saved", `status: ${STATUS_LABEL[r.status] ?? r.status}`].filter(Boolean).join(" · ");
  return { ok: `${parts}${r.emailed ? " · customer emailed" : ""}.` };
}
