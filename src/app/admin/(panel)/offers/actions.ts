"use server";
import { revalidatePath } from "next/cache";
import { q, audit } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { notifyUser, emailPerson } from "@/lib/notify";

/** Confirm one person for the shoot: fills the offer, adds them to the booking's crew, tells everyone. */
export async function confirmRecipient(f: FormData) {
  const u = await requireUser();
  const rid = Number(f.get("rid"));
  const [r] = await q<{ offer_id: number; user_id: number | null; name: string; email: string | null; title: string; shoot_date: string; booking_id: number | null }[]>`
    select r.offer_id, r.user_id, r.name, r.email, o.title, o.shoot_date, o.booking_id from offer_recipients r join offers o on o.id = r.offer_id where r.id = ${rid} and o.status = 'open'`;
  if (!r) return;
  await q`update offers set status = 'filled', assigned_user_id = ${r.user_id} where id = ${r.offer_id}`;
  if (r.booking_id && r.user_id) await q`insert into crew_assignments (booking_id, user_id) values (${r.booking_id}, ${r.user_id}) on conflict do nothing`;
  if (r.user_id) await notifyUser(r.user_id, `You're confirmed: ${r.title}`, r.shoot_date, "/staff/shoots");
  if (r.email) await emailPerson(r.email, `You're confirmed: ${r.title}`, `Hi ${r.name.split(" ")[0]},\n\nYou're confirmed for ${r.title} on ${r.shoot_date}. We'll send the full details${r.user_id ? ", and it's in your staff portal under My shoots" : ""}.\n\nThank you!`, u.id);
  const others = await q<{ user_id: number | null; email: string | null; name: string }[]>`select user_id, email, name from offer_recipients where offer_id = ${r.offer_id} and id <> ${rid} and response = 'accepted'`;
  for (const o of others) {
    if (o.user_id) await notifyUser(o.user_id, `Filled: ${r.title}`, "Thanks for responding. This shoot has been filled.", "/staff/offers");
    if (o.email) await emailPerson(o.email, `Filled: ${r.title}`, `Hi ${o.name.split(" ")[0]},\n\nThanks for accepting. This shoot has now been filled. We'll keep you in mind for the next one.`, u.id);
  }
  await audit(u.id, "offer_confirm", `#${r.offer_id} → ${r.name}`);
  revalidatePath(`/admin/offers/${r.offer_id}`);
}

export async function cancelOffer(f: FormData) {
  const u = await requireUser();
  const id = Number(f.get("id"));
  await q`update offers set status = 'cancelled' where id = ${id} and status = 'open'`;
  await audit(u.id, "offer_cancel", `#${id}`);
  revalidatePath(`/admin/offers/${id}`);
}
