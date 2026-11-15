"use server";
import { redirect } from "next/navigation";
import { q } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { sendMail } from "@/lib/mail";
import { SITE } from "@/lib/site";
import { ORIGIN } from "@/lib/emailTemplate";
import { notifyAdmins } from "@/lib/notify";
import { getSurvey, verifySurvey, surveyToken, reviewThanksEmail, reviewUrl, type Answers, type CrewRating } from "@/lib/surveys";

export type FState = { error?: string } | undefined;
const t = (f: FormData, k: string, n = 300) => String(f.get(k) ?? "").replace(/[<>]/g, "").trim().slice(0, n);
const r5 = (f: FormData, k: string) => { const n = Math.round(Number(f.get(k))); return n >= 1 && n <= 5 ? n : 0; };
const back = (id: number) => `/feedback/${id}?k=${surveyToken(id)}`;

export async function submitSurvey(_: FState, f: FormData): Promise<FState> {
  const id = Number(f.get("id")) || 0;
  if (!verifySurvey(id, t(f, "k", 80))) return { error: "This link isn't valid." };
  const s = await getSurvey(id);
  if (!s) return { error: "Survey not found." };
  if (s.submitted_at) redirect(back(id));

  const crewNames = f.getAll("crew_name").map((v) => String(v).replace(/[<>]/g, "").trim().slice(0, 80));
  const crewRoles = f.getAll("crew_role").map((v) => String(v).slice(0, 20));
  const crew: CrewRating[] = crewNames.map((name, i) => ({ name, role: crewRoles[i] || "Photographer", professionalism: r5(f, `prof_${i}`), punctuality: r5(f, `punct_${i}`) })).filter((c) => c.name || c.professionalism || c.punctuality);
  const a: Answers = {
    name: t(f, "name", 100), email: t(f, "email", 200), phone: t(f, "phone", 40), heard: t(f, "heard", 120), event_date: t(f, "event_date", 20),
    location: t(f, "location", 200), repeat: t(f, "repeat", 5), services: t(f, "services", 20), crew,
    booking: r5(f, "booking"), quality: r5(f, "quality"), recommend: r5(f, "recommend"), comments: t(f, "comments", 4000), tip: t(f, "tip", 5),
  };
  if (!a.name || !a.email) return { error: "Please add your name and email." };
  if (!a.booking || !a.quality || !a.recommend || crew.some((c) => !c.professionalism || !c.punctuality)) return { error: "Please answer every rating question (1 to 5)." };
  const ratings = [a.booking, a.quality, a.recommend, ...crew.flatMap((c) => [c.professionalism, c.punctuality])];
  const avg = ratings.reduce((x, y) => x + y, 0) / ratings.length;
  const done = await q<{ id: number }[]>`update surveys set answers = ${JSON.stringify(a)}::jsonb, avg_rating = ${avg.toFixed(2)}, recommend = ${a.recommend}, submitted_at = now()
    where id = ${id} and submitted_at is null returning id`;
  if (!done.length) redirect(back(id));

  const happy = avg >= 4 && a.recommend >= 4;
  const review = await reviewUrl();
  if (happy && review) {
    const m = reviewThanksEmail(a.name || s.name, review, a.tip === "Yes" ? null : `${ORIGIN}${back(id)}#tip`);
    if ((await sendMail({ to: s.email, subject: m.subject, html: m.html })).ok) await q`update surveys set review_invited_at = now() where id = ${id}`;
  }
  const crewLine = crew.map((c) => `${c.name || c.role}: professionalism ${c.professionalism}/5, punctuality ${c.punctuality}/5`).join("; ");
  await notifyAdmins(`${happy ? "⭐" : "⚠️"} Feedback from ${a.name}: ${avg.toFixed(1)}/5`, `${s.event || "Event"}${s.event_date ? ` (${s.event_date})` : ""}. Booking ${a.booking}/5, quality ${a.quality}/5, recommend ${a.recommend}/5. ${crewLine}${a.comments ? `\n\n"${a.comments.slice(0, 600)}"` : ""}${happy ? "" : "\n\nLow rating: please follow up personally."}`, "/admin/feedback");

  if (a.tip === "Yes") {
    const amount = Math.round(Number(f.get("tip_amount")) * 100);
    if (amount >= 500 && amount <= 100000) return startTipCheckout(id, amount, s.email);
  }
  redirect(`${back(id)}&sent=1`);
}

async function startTipCheckout(id: number, cents: number, email: string): Promise<FState> {
  if (!stripe) return { error: `Tips are temporarily unavailable. Please contact ${SITE.email}.` };
  const k = surveyToken(id);
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: email,
    line_items: [{ quantity: 1, price_data: { currency: "usd", unit_amount: cents, product_data: { name: "Tip for your MacroSnaps crew", description: "100% goes to your photographer or videographer." } } }],
    metadata: { kind: "tip", survey_id: String(id) },
    payment_intent_data: { description: `Crew tip (survey ${id})`, metadata: { kind: "tip", survey_id: String(id) } },
    success_url: `${ORIGIN}/feedback/${id}?k=${k}&tip=done&session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${ORIGIN}/feedback/${id}?k=${k}#tip`,
  });
  await q`update surveys set tip_session = ${session.id} where id = ${id}`;
  redirect(session.url!);
}

export async function leaveTip(_: FState, f: FormData): Promise<FState> {
  const id = Number(f.get("id")) || 0;
  if (!verifySurvey(id, t(f, "k", 80))) return { error: "This link isn't valid." };
  const s = await getSurvey(id);
  if (!s) return { error: "Not found." };
  const cents = Math.round(Number(f.get("tip_amount")) * 100);
  if (!(cents >= 500 && cents <= 100000)) return { error: "Please enter a tip between $5 and $1,000." };
  return startTipCheckout(id, cents, s.email);
}
