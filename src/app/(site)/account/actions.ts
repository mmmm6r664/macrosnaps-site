"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { hasDb, q } from "@/lib/db";
import { createLoginToken, currentClient, endClientSession, logLinkSent, normEmail, requireClient, safeNext, tooManyLinks, validEmail } from "@/lib/clientAuth";
import { orderFor } from "@/lib/clientData";
import { sendMail } from "@/lib/mail";
import { notifyAdmins } from "@/lib/notify";
import { ORIGIN } from "@/lib/emailTemplate";
import { signInLink, reviewRequest, lowRatingAlert } from "@/lib/emails";

import { getSetting } from "@/lib/settings";
import { SITE } from "@/lib/site";

export type LinkState = { ok?: boolean; error?: string };

/** Emails a one-time sign-in link. Always answers the same way whether or not the email has bookings. */
export async function requestLink(_: LinkState, fd: FormData): Promise<LinkState> {
  if (!hasDb) return { error: "Sign-in isn't available right now. Please call us." };
  const email = normEmail(String(fd.get("email") ?? "")).slice(0, 254);
  if (!validEmail(email)) return { error: "Please enter a valid email address." };
  if (String(fd.get("website") ?? "")) return { ok: true }; // honeypot
  if (await tooManyLinks(email)) return { error: "Too many sign-in emails. Please wait an hour and try again." };
  const token = await createLoginToken(email, safeNext(fd.get("next")));
  await logLinkSent(email);
  const url = `${ORIGIN}/account/verify?token=${token}`;
  const m = signInLink(url);
  const r = await sendMail({ to: email, subject: m.subject, html: m.html });

  if (!r.ok) return { error: "We couldn't send the email right now. Please try again in a few minutes or call us." };
  return { ok: true };
}

export async function signOut() {
  await endClientSession();
  redirect("/account/login");
}

export async function updateProfile(fd: FormData) {
  const c = await requireClient();
  const first = String(fd.get("firstName") ?? "").trim().slice(0, 60);
  const last = String(fd.get("lastName") ?? "").trim().slice(0, 60);
  const phone = String(fd.get("phone") ?? "").replace(/[^\d+()\-\s.]/g, "").slice(0, 30);
  await q`update clients set first_name = ${first}, last_name = ${last}, phone = ${phone || null} where id = ${c.id}`;
  revalidatePath("/account");
}

export type FeedbackState = { ok?: boolean; error?: string; reviewUrl?: string };

/** Internal feedback. 4–5 stars: we email a request for a Google review. 1–3 stars: the team is alerted to follow up. */
export async function sendFeedback(_: FeedbackState, fd: FormData): Promise<FeedbackState> {
  const c = await currentClient();
  if (!c) return { error: "Please sign in again." };
  const ref = String(fd.get("ref") ?? "").slice(0, 40);
  const order = await orderFor(c.email, ref);
  if (!order) return { error: "Order not found." };
  const rating = Math.round(Number(fd.get("rating")));
  if (!(rating >= 1 && rating <= 5)) return { error: "Please choose 1 to 5 stars." };
  const comment = String(fd.get("comment") ?? "").trim().slice(0, 3000);
  const done = await q<{ id: number }[]>`insert into feedback (booking_id, rating, comment) values (${order.id}, ${rating}, ${comment}) on conflict (booking_id) do nothing returning id`;
  if (!done.length) return { error: "You've already sent feedback for this order. Thank you!" };

  const review = (await getSetting("google_review_url")) || "";
  const name = c.first_name || "there";
  if (rating >= 4 && review) {
    const m = reviewRequest(name, review);
    await sendMail({ to: c.email, subject: m.subject, html: m.html });

    await q`update feedback set review_invited_at = now() where booking_id = ${order.id}`;
  }
  await notifyAdmins(`${"★".repeat(rating)}${"☆".repeat(5 - rating)} feedback from ${c.first_name} ${c.last_name}`.trim(), `${order.service_name} (${order.ref})${comment ? `: ${comment.slice(0, 300)}` : ""}`, `/admin/bookings/${order.id}`);
  if (rating <= 3) {
    const m = lowRatingAlert(rating, `${c.first_name} ${c.last_name}`.trim(), c.email, order.service_name, order.ref, comment);
    await sendMail({ to: SITE.email, replyTo: c.email, subject: m.subject, html: m.html });
  }
  revalidatePath(`/account/orders/${ref}`);
  return { ok: true, reviewUrl: rating >= 4 && review ? review : undefined };
}
