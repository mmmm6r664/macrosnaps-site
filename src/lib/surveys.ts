// Client satisfaction survey (replaces the old Google Form): sent after delivery, with a reminder,
// a Google review invitation for happy clients and an optional tip for the crew.
import "server-only";
import { q } from "@/lib/db";
import { sendMail } from "@/lib/mail";
import { signRef, verifyRef } from "@/lib/automations";
import { layout, p, small, button, esc, ORIGIN } from "@/lib/emailTemplate";
import { getSetting } from "@/lib/settings";
import { notifyAdmins } from "@/lib/notify";

export type CrewMember = { user_id?: number | null; name: string; role: "Photographer" | "Videographer" };
export type Survey = {
  id: number; booking_id: number | null; order_id: number | null; name: string; email: string; phone: string | null;
  event: string; event_date: string | null; location: string; services: string; crew: CrewMember[];
  sent_at: Date | null; reminded_at: Date | null; submitted_at: Date | null; answers: Answers | null;
  avg_rating: string | null; recommend: number | null; review_invited_at: Date | null;
  tip_cents: number | null; tip_paid_at: Date | null; created_at: Date;
};
export type CrewRating = { name: string; role: string; professionalism: number; punctuality: number };
export type Answers = {
  name: string; email: string; phone: string; heard: string; event_date: string; location: string; repeat: string; services: string;
  crew: CrewRating[]; booking: number; quality: number; recommend: number; comments: string; tip: string;
};

export const HEARD = ["Google search", "Instagram", "Facebook", "Referral from a friend or colleague", "Repeat client", "Thumbtack / Sulekha / other directory", "Venue or planner", "Other"];
export const surveyToken = (id: number) => signRef(`s${id}`, "survey");
export const verifySurvey = (id: number, k: string) => verifyRef(`s${id}`, "survey", k);
export const surveyUrl = (id: number) => `${ORIGIN}/feedback/${id}?k=${surveyToken(id)}`;
const first = (n: string) => esc((n || "").trim().split(/\s+/)[0] || "there");

export async function getSurvey(id: number) {
  return (await q<Survey[]>`select id, booking_id, order_id, name, email, phone, event, event_date::text, location, services, crew, sent_at, reminded_at,
    submitted_at, answers, avg_rating::text, recommend, review_invited_at, tip_cents, tip_paid_at, created_at from surveys where id = ${id}`)[0] ?? null;
}

/** Creates (or reuses) a survey. Crew defaults to whoever was assigned to the booking. */
export async function createSurvey(o: { bookingId?: number | null; orderId?: number | null; name: string; email: string; phone?: string | null; event?: string; eventDate?: string | null; location?: string; services?: string; crew?: CrewMember[] }) {
  if (o.bookingId) {
    const [ex] = await q<{ id: number }[]>`select id from surveys where booking_id = ${o.bookingId}`;
    if (ex) return ex.id;
  }
  let crew = o.crew ?? [];
  if (!crew.length && o.bookingId) {
    crew = (await q<{ user_id: number; name: string; roles: string[] | null }[]>`select u.id as user_id, u.name, p.roles from crew_assignments c join users u on u.id = c.user_id left join staff_profiles p on p.user_id = u.id where c.booking_id = ${o.bookingId}`)
      .map((r) => ({ user_id: r.user_id, name: r.name, role: (r.roles ?? []).includes("Videographer") && !(r.roles ?? []).includes("Photographer") ? "Videographer" : "Photographer" }));
  }
  const [r] = await q<{ id: number }[]>`insert into surveys (booking_id, order_id, name, email, phone, event, event_date, location, services, crew)
    values (${o.bookingId ?? null}, ${o.orderId ?? null}, ${o.name}, ${o.email.toLowerCase()}, ${o.phone ?? null}, ${o.event ?? ""}, ${o.eventDate || null}, ${o.location ?? ""}, ${o.services ?? ""}, ${JSON.stringify(crew)}::jsonb)
    returning id`;
  return r.id;
}

function surveyEmail(s: Survey, reminder: boolean) {
  const url = surveyUrl(s.id);
  const what = s.event ? `your ${esc(s.event)}` : "your event";
  return {
    subject: reminder ? "A quick reminder: how did we do?" : "How was your experience with MacroSnaps?",
    html: layout({
      title: reminder ? "We'd still love your feedback" : "How did we do?",
      preheader: "Two minutes to rate your photographer and your experience.",
      body:
        p(`Hi ${first(s.name)},`) +
        p(reminder
          ? `Just a gentle reminder: we'd really value a couple of minutes of your feedback on ${what}. It helps us keep our standards high and recognise the crew who looked after you.`
          : `Thank you for choosing MacroSnaps for ${what}. We hope you're enjoying your photos and video. Would you take two minutes to tell us how we did? You can rate your photographer or videographer, the booking process and the final quality.`) +
        button("Share your feedback", url) +
        p("If you were especially happy with your crew, the form also lets you leave them a tip. 100% of tips go to your photographer or videographer.") +
        small("Questions or anything we could have done better? Just reply to this email."),
    }),
  };
}

/** Emails the survey (first send or one reminder). Returns false if it wasn't sent. */
export async function sendSurvey(id: number, reminder = false) {
  const s = await getSurvey(id);
  if (!s || s.submitted_at) return false;
  const m = surveyEmail(s, reminder);
  const r = await sendMail({ to: s.email, subject: m.subject, html: m.html });
  if (!r.ok) return false;
  if (reminder) await q`update surveys set reminded_at = now() where id = ${id}`;
  else await q`update surveys set sent_at = coalesce(sent_at, now()) where id = ${id}`;
  return true;
}

export function reviewThanksEmail(name: string, reviewUrl: string, tipUrl: string | null): { subject: string; html: string } {
  return {
    subject: "Thank you! Would you share your experience on Google?",
    html: layout({
      title: "Thank you for your feedback",
      preheader: "A short Google review helps other families and businesses find us.",
      body:
        p(`Hi ${first(name)},`) +
        p("Thank you for the kind words. It means a lot to our team. If you have a minute, a short Google review helps other clients find a photographer they can trust.") +
        button("Leave a Google review", reviewUrl) +
        (tipUrl ? p(`Want to thank your crew directly? <a href="${esc(tipUrl)}" style="color:#8a7a2b">You can leave a tip here</a>; 100% goes to your photographer or videographer.`) : ""),
    }),
  };
}

export const reviewUrl = async () => ((await getSetting("google_review_url")) || "").trim();

/** Records a paid tip (from the success redirect or the Stripe webhook). Returns true the first time. */
export async function recordTip(surveyId: number, sessionId: string, cents: number) {
  const r = await q<{ id: number; name: string; crew: { name: string }[] }[]>`update surveys set tip_cents = ${cents}, tip_paid_at = now(), tip_session = ${sessionId}
    where id = ${surveyId} and tip_paid_at is null returning id, name, crew`;
  if (r.length) await notifyAdmins(`💵 $${(cents / 100).toFixed(2)} tip from ${r[0].name}`, `For: ${(r[0].crew ?? []).map((c) => c.name).join(", ") || "their crew"}. Pay it out to the crew from Payouts.`, "/admin/feedback");
  return r.length > 0;
}
