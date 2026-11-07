"use client";
import { useState } from "react";

export default function NewsletterSignup() {
  const [state, setState] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [msg, setMsg] = useState("");
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const f = Object.fromEntries(new FormData(e.currentTarget).entries());
    const r = await fetch("/api/subscribe", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, source: "footer" }) }).catch(() => null);
    const j = r ? await r.json().catch(() => ({})) : {};
    if (r?.ok) setState("done"); else { setState("error"); setMsg(j.error || "Something went wrong"); }
  }
  if (state === "done") return <p className="text-sm text-gold">Thanks, you&apos;re subscribed.</p>;
  return (
    <form onSubmit={submit} className="flex max-w-md flex-col gap-2 sm:flex-row">
      <label htmlFor="nl-email" className="sr-only">Email address</label>
      <input id="nl-email" name="email" type="email" required maxLength={200} placeholder="Your email" className="min-w-0 flex-1 border border-white/25 bg-transparent px-3 py-2 text-sm text-white placeholder:text-white/50 outline-none focus:border-gold" />
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <button disabled={state === "sending"} className="btn-gold !px-5 !py-2">{state === "sending" ? "…" : "Subscribe"}</button>
      {state === "error" && <p role="alert" className="text-xs text-red-300 sm:self-center">{msg}</p>}
    </form>
  );
}
