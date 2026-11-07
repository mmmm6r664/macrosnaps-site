"use client";
// Google Analytics 4 + StatCounter. Loads on public pages unless the visitor declined cookies; never on admin/staff/client portals.
import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GA_ID = process.env.NEXT_PUBLIC_GA_ID || "G-YMGR75GPME";
const SC_PROJECT = 12926296;
const SC_SECURITY = "75fb2d0f";
const PRIVATE = /^\/(admin|staff|account|ms-)/;

export default function Analytics() {
  const path = usePathname() || "/";
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
