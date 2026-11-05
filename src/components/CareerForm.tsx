"use client";
import { useState } from "react";
import { BRANDS, CAMERAS, EXPERIENCE, RADIUS, ROLES, WORK_STATUS, AVAILABILITY, SHOOT_TYPES, DISQUALIFIERS, DISABILITY, NOT_ELIGIBLE, checkEligibility } from "@/lib/careers";

export default function CareerForm() {
  const [camera, setCamera] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent" | "rejected" | "error">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = Object.fromEntries(fd.entries());
    data.shootTypes = fd.getAll("shootTypes");
    data.flags = fd.getAll("flags");
    if (!(data.shootTypes as string[]).length) { setError("Please choose at least one type of shoot."); setState("error"); return; }
    if (!checkEligibility({ experience: String(data.experience), camera: String(data.camera), otherYear: String(data.otherYear ?? ""), otherValue: String(data.otherValue ?? ""), flags: data.flags as string[] })) {
      setState("rejected");
      window.scrollTo({ top: (e.currentTarget as HTMLElement).offsetTop - 160, behavior: "smooth" });
      return;
    }
    setState("sending");
    setError("");
    try {
      const res = await fetch("/api/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data) });
      const j = await res.json();
      if (res.status === 422) { setState("rejected"); return; }
      if (!res.ok) throw new Error(j.error || "Something went wrong");
      setState("sent");
    } catch (x) {
      setError(x instanceof Error ? x.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "sent")
    return <div className="border border-gold bg-white p-8 text-center"><h3 className="font-serif text-3xl">Application received</h3><p className="mt-3 text-muted">Thank you for applying to join the MacroSnaps family. Our team will review your portfolio and contact you if there&apos;s a fit in your area.</p></div>;
  if (state === "rejected")
    return <div className="border border-black/15 bg-white p-8 text-center"><h3 className="font-serif text-3xl">You&apos;re not eligible to apply yet</h3><p className="mx-auto mt-3 max-w-xl text-muted">{NOT_ELIGIBLE}</p><button type="button" onClick={() => setState("idle")} className="btn-dark mt-6">Back to the form</button></div>;

  const field = "w-full border border-black/15 bg-white px-3 py-3 outline-none focus:border-gold-dark";
  const label = "mb-1.5 block text-xs font-semibold uppercase tracking-[.15em] text-muted";
  const big = `${field} min-h-[160px]`;

  return (
    <form onSubmit={submit} className="space-y-10">
      <fieldset className="grid gap-5 sm:grid-cols-2">
        <legend className="mb-4 font-serif text-2xl">About you</legend>
        <div><label className={label} htmlFor="name">Full name *</label><input id="name" name="name" required className={field} autoComplete="name" /></div>
        <div><label className={label} htmlFor="email">Email *</label><input id="email" name="email" type="email" required className={field} autoComplete="email" /></div>
        <div><label className={label} htmlFor="phone">Phone *</label><input id="phone" name="phone" type="tel" required className={field} autoComplete="tel" /></div>
        <div><label className={label} htmlFor="city">City & state / province *</label><input id="city" name="city" required className={field} placeholder="e.g. Arlington, VA" autoComplete="address-level2" /></div>
        <div><label className={label} htmlFor="radius">Work radius *</label><select id="radius" name="radius" required defaultValue="" className={field}><option value="" disabled>Select how far you&apos;ll travel</option>{RADIUS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className={label} htmlFor="role">I am a *</label><select id="role" name="role" required defaultValue="" className={field}><option value="" disabled>Select</option>{ROLES.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className={label} htmlFor="experience">Professional experience *</label><select id="experience" name="experience" required defaultValue="" className={field}><option value="" disabled>Select years of experience</option>{EXPERIENCE.map((x) => <option key={x.id} value={x.id}>{x.label}</option>)}</select></div>
        <div><label className={label} htmlFor="status">Are you a full-time, part-time or hobbyist photographer? *</label><select id="status" name="status" required defaultValue="" className={field}><option value="" disabled>Select</option>{WORK_STATUS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className={label} htmlFor="hours">Your working hours *</label><select id="hours" name="hours" required defaultValue="" className={field}><option value="" disabled>When are you available to shoot?</option>{AVAILABILITY.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div className="sm:col-span-2"><label className={label} htmlFor="portfolio">Portfolio / website / Instagram *</label><input id="portfolio" name="portfolio" required className={field} placeholder="https://" /></div>
      </fieldset>

      <fieldset>
        <legend className="mb-4 font-serif text-2xl">Shoots you&apos;re comfortable taking *</legend>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SHOOT_TYPES.map((t) => (
            <label key={t} className="flex cursor-pointer items-center gap-3 border border-black/10 bg-white px-4 py-3 hover:border-gold-dark has-[:checked]:border-gold-dark has-[:checked]:bg-gold/10">
              <input type="checkbox" name="shootTypes" value={t} className="h-4 w-4 accent-[#a8963b]" />{t}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="grid gap-5">
        <legend className="mb-4 font-serif text-2xl">Your gear</legend>
        <div>
          <label className={label} htmlFor="camera">Primary camera body *</label>
          <select id="camera" name="camera" required value={camera} onChange={(e) => setCamera(e.target.value)} className={field}>
            <option value="" disabled>Select your primary camera</option>
            {BRANDS.map((b) => (
              <optgroup key={b} label={b}>{CAMERAS.filter((c) => c.brand === b).map((c) => <option key={c.id} value={c.id}>{c.brand} {c.model}</option>)}</optgroup>
            ))}
            <option value="other">Other (not listed)</option>
          </select>
        </div>
        {camera === "other" && (
          <div className="grid gap-5 sm:grid-cols-3">
            <div><label className={label} htmlFor="otherModel">Camera make & model *</label><input id="otherModel" name="otherModel" required className={field} /></div>
            <div><label className={label} htmlFor="otherYear">Release year *</label><select id="otherYear" name="otherYear" required defaultValue="" className={field}><option value="" disabled>Select</option><option value="2015+">2015 or newer</option><option value="pre2015">Before 2015</option></select></div>
            <div><label className={label} htmlFor="otherValue">Value (new) *</label><select id="otherValue" name="otherValue" required defaultValue="" className={field}><option value="" disabled>Select</option><option value="1000+">$1,000 or more</option><option value="lt1000">Under $1,000</option></select></div>
          </div>
        )}
        <div><label className={label} htmlFor="secondary">Secondary / backup camera bodies</label><textarea id="secondary" name="secondary" className={big} placeholder="List every backup body you bring to a shoot" /></div>
        <div><label className={label} htmlFor="lenses">Lens kit *</label><textarea id="lenses" name="lenses" required className={big} placeholder="e.g. 24-70mm f/2.8, 70-200mm f/2.8, 35mm f/1.4, 85mm f/1.8…" /></div>
        <div><label className={label} htmlFor="lighting">Lighting kit</label><textarea id="lighting" name="lighting" className={big} placeholder="Speedlights, strobes, LED panels, modifiers, stands…" /></div>
        <div><label className={label} htmlFor="notes">Anything else we should know?</label><textarea id="notes" name="notes" rows={3} className={field} placeholder="Availability, languages, drone license, specialties…" /></div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-serif text-2xl">Do any of these apply to you?</legend>
        <p className="mb-4 text-sm text-muted">Check all that apply. Leave blank if none apply.</p>
        <div className="grid gap-3">
          {DISQUALIFIERS.map((d) => (
            <label key={d.id} className="flex cursor-pointer items-center gap-3 border border-black/10 bg-white px-4 py-3 hover:border-gold-dark has-[:checked]:border-gold-dark has-[:checked]:bg-gold/10">
              <input type="checkbox" name="flags" value={d.id} className="h-4 w-4 accent-[#a8963b]" />{d.label}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="mb-1 font-serif text-2xl">Voluntary self-identification of disability</legend>
        <p className="mb-4 text-sm text-muted">This question is optional. MacroSnaps is an equal opportunity company: your answer is kept confidential, is never used to decide your application, and you won&apos;t be discriminated against for answering or for declining to answer. If you need an accommodation to apply or to work with us, let us know.</p>
        <div className="grid gap-3 sm:grid-cols-3">
          {DISABILITY.map((d) => (
            <label key={d} className="flex cursor-pointer items-center gap-3 border border-black/10 bg-white px-4 py-3 text-sm hover:border-gold-dark has-[:checked]:border-gold-dark has-[:checked]:bg-gold/10">
              <input type="radio" name="disability" value={d} className="h-4 w-4 accent-[#a8963b]" />{d}
            </label>
          ))}
        </div>
      </fieldset>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div>
        <button disabled={state === "sending"} className="btn-gold w-full sm:w-auto">{state === "sending" ? "Sending…" : "Submit application"}</button>
        {state === "error" && <p className="mt-3 text-sm text-red-700">{error}</p>}
        <p className="mt-3 text-xs text-muted">Please only apply if you are a professional photographer or videographer.</p>
      </div>
    </form>
  );
}
