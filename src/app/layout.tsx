import type { Metadata } from "next";
import "@fontsource-variable/raleway";
import "@fontsource-variable/eb-garamond";
import "@fontsource/dancing-script/600.css";
import "@fontsource/dancing-script/700.css";
import "./globals.css";
import { SITE } from "@/lib/site";
import Analytics from "@/components/Analytics";


export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "MacroSnaps | Event, Conference & Wedding Photo & Video", template: "%s | MacroSnaps" },
  alternates: { canonical: "/" },
  description: SITE.description,
  openGraph: { siteName: "MacroSnaps", type: "website", images: ["https://static.wixstatic.com/media/1f3625_d2741b395b5d446da5d8ca57e5f286b2~mv2.jpg/v1/fit/w_1200,h_630,q_85/hero.jpg"] },
  twitter: { card: "summary_large_image", site: "@macrosnaps" },
  // The MacroSnaps logo as the browser-tab icon (sized for icons).
  icons: {
    icon: [{ url: `${SITE.logo}/v1/fit/w_64,h_64,q_90,enc_auto/favicon.png`, sizes: "64x64", type: "image/png" }, { url: `${SITE.logo}/v1/fit/w_192,h_192,q_90,enc_auto/icon.png`, sizes: "192x192", type: "image/png" }],
    apple: [{ url: `${SITE.logo}/v1/fit/w_180,h_180,q_90,enc_auto/apple-icon.png`, sizes: "180x180" }],
  },
  verification: { google: "dffAgEdAJaiidpO52xm7Tgu1wHrNqhSey0fgzU5ggkM", other: { "msvalidate.01": "BE47118A1D1D58472CC63C1E447D472E", "facebook-domain-verification": "7lv76i77jpkmphak9zh8vrwaqw1avl" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}<Analytics /></body>
    </html>
  );
}
