"use client";
import { useState } from "react";

export default function ContactForm({ defaultSubject = "", compact = false }: { defaultSubject?: string; compact?: boolean }) {
  const [state, setState] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const data = Object.fromEntries(new FormData(e.currentTarget).entries());
    try {
      const res = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...data, page: window.location.pathname }) });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Something went wrong");
      setState("sent");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
      setState("error");
    }
  }

  if (state === "sent")
    return <p className="border border-gold bg-white p-6 text-center font-serif text-xl">Thanks for submitting! We will get back to you shortly.</p>;

  const field = "w-full border-b border-black/30 bg-transparent px-1 py-3 outline-none focus:border-gold-dark";
  return (
    <form onSubmit={onSubmit} className="grid gap-5 sm:grid-cols-2">
      <input name="firstName" required placeholder="First Name *" className={field} autoComplete="given-name" />
      <input name="lastName" placeholder="Last Name" className={field} autoComplete="family-name" />
      <input name="email" type="email" required placeholder="Email *" className={field} autoComplete="email" />
      <input name="phone" type="tel" placeholder="Phone" className={field} autoComplete="tel" />
      {!compact && <input name="company" placeholder="Company / Organization" className={field} autoComplete="organization" />}
      {!compact && <input name="date" placeholder="Event date(s)" className={field} />}
      <input name="subject" defaultValue={defaultSubject} placeholder="Subject" className={`${field} sm:col-span-2`} />
      <textarea name="message" required rows={4} placeholder="Tell us about your event: venue, schedule, number of days/rooms, deliverables *" className={`${field} sm:col-span-2`} />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <div className="sm:col-span-2">
        <button disabled={state === "sending"} className="btn-dark w-full sm:w-auto">{state === "sending" ? "Sending…" : "Send"}</button>
        {state === "error" && <p className="mt-3 text-sm text-red-700">{error}. You can also email info@macrosnaps.com or call 877-622-4973.</p>}
      </div>
    </form>
  );
}
