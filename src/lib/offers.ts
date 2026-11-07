import "server-only";
import { q } from "@/lib/db";
import { notifyAdmins } from "@/lib/notify";

export type Recipient = { id: number; offer_id: number; user_id: number | null; name: string; response: string; responded_at: Date | null };

/** Records an accept/decline (by token from email/text, or by a logged-in staff member). */
export async function respondToOffer(where: { token?: string; userId?: number; offerId?: number }, accept: boolean) {
  const rows = where.token
    ? await q<(Recipient & { title: string; shoot_date: string; status: string })[]>`select r.*, o.title, o.shoot_date, o.status from offer_recipients r join offers o on o.id = r.offer_id where r.token = ${where.token}`
    : await q<(Recipient & { title: string; shoot_date: string; status: string })[]>`select r.*, o.title, o.shoot_date, o.status from offer_recipients r join offers o on o.id = r.offer_id where r.user_id = ${where.userId!} and r.offer_id = ${where.offerId!}`;
  const r = rows[0];
  if (!r) return { ok: false, error: "This offer link isn't valid." };
  if (r.status !== "open") return { ok: false, error: r.status === "filled" ? "Thanks! This shoot has already been filled." : "This shoot is no longer available." };
  await q`update offer_recipients set response = ${accept ? "accepted" : "declined"}, responded_at = now() where id = ${r.id}`;
  if (accept) await notifyAdmins(`${r.name} accepted: ${r.title}`, `${r.name} is available for "${r.title}" (${r.shoot_date}). Confirm them in the admin portal under Shoot offers.`, `/admin/offers/${r.offer_id}`);
  return { ok: true, title: r.title, date: r.shoot_date };
}
