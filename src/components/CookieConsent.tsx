"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const KEY = "ms-cookie-consent"; // "accepted" | "declined"

/** Read the visitor's choice (e.g. before loading analytics). */
export function cookieConsent(): string | null {
  try { return localStorage.getItem(KEY); } catch { return null; }
}

export default function CookieConsent() {
  const [show, setShow] = useState(false);
  useEffect(() => { if (!cookieConsent()) setShow(true); }, []);
  const choose = (v: "accepted" | "declined") => {
    try { localStorage.setItem(KEY, v); } catch {}
    window.dispatchEvent(new CustomEvent("cookie-consent", { detail: v }));
    setShow(false);
  };
  if (!show) return null;
  return (
    <div role="dialog" aria-live="polite" aria-label="Cookie consent" className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-3xl rounded-lg border border-gold/40 bg-black/95 p-5 text-sm text-white shadow-2xl md:inset-x-6 md:flex md:items-center md:gap-6">
      <p className="flex-1 leading-relaxed text-white/85">
        We use essential cookies to run this site and, with your permission, analytics cookies to understand how visitors use it. See our <Link href="/privacy#cookies" className="underline">cookie policy</Link>.
      </p>
      <div className="mt-4 flex shrink-0 gap-3 md:mt-0">
        <button type="button" onClick={() => choose("declined")} className="border border-white/40 px-4 py-2 text-xs font-semibold uppercase tracking-wider hover:border-white">Decline</button>
        <button type="button" onClick={() => choose("accepted")} className="bg-gold px-4 py-2 text-xs font-semibold uppercase tracking-wider text-black hover:bg-[#ddcb67]">Accept</button>
      </div>
    </div>
  );
}
