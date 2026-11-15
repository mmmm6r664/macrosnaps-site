"use client";
import { useActionState, useState } from "react";
import { submitSurvey, leaveTip, type FState } from "@/app/(site)/feedback/actions";

type Crew = { name: string; role: string };
type S = { name: string; email: string; phone: string; event_date: string; location: string; services: string; crew: Crew[] };
const field = "w-full border border-black/15 bg-white px-3 py-3 outline-none focus:border-[#8a7a2b]";
const label = "mb-1.5 block text-xs font-semibold uppercase tracking-[.15em] text-black/55";
const TIPS = [20, 50, 100];

function Rating({ name, q }: { name: string; q: string }) {
  return (
    <fieldset className="sm:col-span-2">
      <legend className="mb-2 text-sm font-semibold">{q} <span className="font-normal text-black/50">(5 is best)</span></legend>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={name} value={n} required className="peer sr-only" />
            <span className="flex h-11 w-11 items-center justify-center border border-black/15 text-sm peer-checked:border-black peer-checked:bg-black peer-checked:text-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#8a7a2b]">{n}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function TipAmount() {
  const [v, setV] = useState("50");
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2">
      {TIPS.map((n) => <button key={n} type="button" onClick={() => setV(String(n))} className={`border px-4 py-2 text-sm ${v === String(n) ? "border-black bg-black text-white" : "border-black/15"}`}>${n}</button>)}
      <label className="flex items-center gap-1 text-sm">Other $<input name="tip_amount" type="number" min={5} max={1000} step="1" value={v} onChange={(e) => setV(e.target.value)} className="w-24 border border-black/15 px-2 py-2" aria-label="Tip amount in dollars" /></label>
    </div>
  );
}

export function SurveyForm({ id, k, s, heard }: { id: number; k: string; s: S; heard: string[] }) {
  const [st, act, pending] = useActionState<FState, FormData>(submitSurvey, undefined);
  const [tip, setTip] = useState("No");
  const [crew, setCrew] = useState<Crew[]>(s.crew.length ? s.crew : [{ name: "", role: s.services === "Videography" ? "Videographer" : "Photographer" }]);
  return (
    <form action={act} className="grid gap-6 sm:grid-cols-2">
      <input type="hidden" name="id" value={id} /><input type="hidden" name="k" value={k} />
      <div><label className={label} htmlFor="sv-name">Your full name *</label><input id="sv-name" name="name" required defaultValue={s.name} className={field} autoComplete="name" /></div>
      <div><label className={label} htmlFor="sv-email">Your email *</label><input id="sv-email" name="email" type="email" required defaultValue={s.email} className={field} autoComplete="email" /></div>
      <div><label className={label} htmlFor="sv-phone">Your contact number</label><input id="sv-phone" name="phone" type="tel" defaultValue={s.phone} className={field} autoComplete="tel" /></div>
      <div><label className={label} htmlFor="sv-heard">How did you hear about us? *</label><select id="sv-heard" name="heard" required defaultValue="" className={field}><option value="" disabled>Choose one</option>{heard.map((h) => <option key={h}>{h}</option>)}</select></div>
      <div><label className={label} htmlFor="sv-date">When was your event? *</label><input id="sv-date" name="event_date" type="date" required defaultValue={s.event_date} className={field} /></div>
      <div><label className={label} htmlFor="sv-loc">Where was your event? *</label><input id="sv-loc" name="location" required defaultValue={s.location} className={field} /></div>
      <fieldset><legend className={label}>Are you a repeat customer? *</legend><div className="flex gap-4">{["Yes", "No"].map((o) => <label key={o} className="flex items-center gap-2"><input type="radio" name="repeat" value={o} required />{o}</label>)}</div></fieldset>
      <fieldset><legend className={label}>What services did you choose? *</legend><div className="flex flex-wrap gap-4">{["Photography", "Videography", "Both"].map((o) => <label key={o} className="flex items-center gap-2"><input type="radio" name="services" value={o} required defaultChecked={s.services === o} />{o}</label>)}</div></fieldset>

      {crew.map((c, i) => (
        <div key={i} className="space-y-5 border-t border-black/10 pt-6 sm:col-span-2">
          <h2 className="font-serif text-2xl">{c.role} satisfaction</h2>
          <input type="hidden" name="crew_role" value={c.role} />
          <div><label className={label} htmlFor={`sv-cn-${i}`}>Name of your {c.role.toLowerCase()} *</label><input id={`sv-cn-${i}`} name="crew_name" required defaultValue={c.name} className={field} /></div>
          <Rating name={`prof_${i}`} q={`How would you rate the professionalism of your ${c.role.toLowerCase()}?`} />
          <Rating name={`punct_${i}`} q={`How would you rate the punctuality of your ${c.role.toLowerCase()}?`} />
        </div>
      ))}
      <div className="flex flex-wrap gap-3 sm:col-span-2">
        <button type="button" onClick={() => setCrew([...crew, { name: "", role: "Photographer" }])} className="border border-black/15 px-3 py-2 text-sm">+ Add another photographer</button>
        <button type="button" onClick={() => setCrew([...crew, { name: "", role: "Videographer" }])} className="border border-black/15 px-3 py-2 text-sm">+ Add a videographer</button>
      </div>

      <div className="space-y-5 border-t border-black/10 pt-6 sm:col-span-2">
        <h2 className="font-serif text-2xl">Your experience</h2>
        <Rating name="booking" q="How satisfied were you with the entire booking process?" />
        <Rating name="quality" q="How satisfied are you with the final quality of your photos or video?" />
        <Rating name="recommend" q="How likely are you to recommend us to others?" />
        <div><label className={label} htmlFor="sv-c">Any additional comments, feedback or suggestions?</label><textarea id="sv-c" name="comments" rows={4} className={field} /></div>
      </div>

      <fieldset id="tip" className="border-t border-black/10 pt-6 sm:col-span-2">
        <legend className="font-serif text-2xl">Would you like to tip your photographer or videographer?</legend>
        <p className="mt-1 text-sm text-black/60">Optional. 100% of tips go to your crew. You&apos;ll pay securely by card after submitting.</p>
        <div className="mt-3 flex gap-4">{["Yes", "No"].map((o) => <label key={o} className="flex items-center gap-2"><input type="radio" name="tip" value={o} checked={tip === o} onChange={() => setTip(o)} />{o}</label>)}</div>
        {tip === "Yes" && <TipAmount />}
      </fieldset>

      {st?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{st.error}</p>}
      <button disabled={pending} className="bg-black px-8 py-4 text-sm font-semibold uppercase tracking-[.2em] text-white hover:bg-[#8a7a2b] disabled:opacity-50 sm:col-span-2 sm:justify-self-start">{pending ? "Sending…" : tip === "Yes" ? "Submit & continue to tip" : "Submit feedback"}</button>
    </form>
  );
}

export function TipForm({ id, k }: { id: number; k: string }) {
  const [st, act, pending] = useActionState<FState, FormData>(leaveTip, undefined);
  return (
    <form action={act} className="mt-2">
      <input type="hidden" name="id" value={id} /><input type="hidden" name="k" value={k} />
      <TipAmount />
      {st?.error && <p role="alert" className="mt-2 text-sm text-red-700">{st.error}</p>}
      <button disabled={pending} className="mt-4 bg-black px-6 py-3 text-sm font-semibold uppercase tracking-[.15em] text-white hover:bg-[#8a7a2b] disabled:opacity-50">{pending ? "Opening checkout…" : "Leave a tip"}</button>
    </form>
  );
}
