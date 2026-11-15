"use client";
// Google Analytics 4 + StatCounter. Loads on public pages unless the visitor declined cookies; never on admin/staff/client portals.
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-YMGR75GPME";
const SC_PROJECT = 12926296;
const SC_SECURITY = "75fb2d0f";
const PRIVATE = /^\/(admin|staff|account|ms-)/;

/** First-party page view + time-on-page tracking (no cookies; see /api/t). */
function useFirstParty(path: string) {
  useEffect(() => {
    if (PRIVATE.test(path)) return;
    let sid = "";
    try { sid = sessionStorage.getItem("ms-sid") || ""; if (!sid) { sid = Math.random().toString(36).slice(2) + Date.now().toString(36); sessionStorage.setItem("ms-sid", sid); } } catch { sid = Math.random().toString(36).slice(2); }
    const u = new URLSearchParams(location.search);
    let ref = document.referrer;
    try { if (sessionStorage.getItem("ms-ref-used")) ref = location.origin; else sessionStorage.setItem("ms-ref-used", "1"); } catch {}
    const start = Date.now();
    let id = 0, hidden = 0, hiddenAt = 0;
    const body = { k: "view", sid, p: path, r: ref, us: u.get("utm_source") ?? undefined, um: u.get("utm_medium") ?? undefined, uc: u.get("utm_campaign") ?? undefined };
    fetch("/api/t", { method: "POST", body: JSON.stringify(body), keepalive: true }).then((r) => (r.status === 200 ? r.json() : null)).then((j) => { id = j?.id ?? 0; }).catch(() => {});
    const send = () => { if (!id) return; const ms = Date.now() - start - hidden - (hiddenAt ? Date.now() - hiddenAt : 0); navigator.sendBeacon?.("/api/t", JSON.stringify({ k: "ping", id, sid, ms })); };
    const vis = () => { if (document.visibilityState === "hidden") { hiddenAt = Date.now(); send(); } else if (hiddenAt) { hidden += Date.now() - hiddenAt; hiddenAt = 0; } };
    document.addEventListener("visibilitychange", vis);
    const iv = setInterval(send, 15000);
    return () => { send(); clearInterval(iv); document.removeEventListener("visibilitychange", vis); };
  }, [path]);
}

export default function Analytics() {
  const path = usePathname() || "/";
  useFirstParty(path);
  const [declined, setDeclined] = useState(true);
  useEffect(() => {
    const read = () => { try { setDeclined(localStorage.getItem("ms-cookie-consent") === "declined"); } catch { setDeclined(false); } };
    read();
    window.addEventListener("cookie-consent", read);
    return () => window.removeEventListener("cookie-consent", read);
  }, []);
  if (declined || PRIVATE.test(path)) return null;
  return (
    <>
      <Script id="sc-config" strategy="afterInteractive">{`var sc_project=${SC_PROJECT};var sc_invisible=1;var sc_security="${SC_SECURITY}";`}</Script>
      <Script src="https://www.statcounter.com/counter/counter.js" strategy="afterInteractive" />
      {GA_ID && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_ID}');`}</Script>
        </>
      )}
    </>
  );
}
