import type { Metadata } from "next";
import "@fontsource-variable/raleway";
import "@fontsource-variable/eb-garamond";
import "@fontsource/dancing-script/600.css";
import "@fontsource/dancing-script/700.css";
import "@fontsource/courgette";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialRail from "@/components/SocialRail";
import JsonLd from "@/components/JsonLd";
import { SITE } from "@/lib/site";
import { orgSchema } from "@/lib/schema";
import { AskBand } from "@/components/AskBox";
import { ScrollReveal } from "@/components/Motion";


export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: "MacroSnaps | Event, Conference & Wedding Photo & Video", template: "%s | MacroSnaps" },
  alternates: { canonical: "/" },
  description: SITE.description,
  openGraph: { siteName: "MacroSnaps", type: "website", images: ["https://static.wixstatic.com/media/1f3625_d2741b395b5d446da5d8ca57e5f286b2~mv2.jpg/v1/fit/w_1200,h_630,q_85/hero.jpg"] },
  twitter: { card: "summary_large_image", site: "@macrosnaps" },
  verification: { google: "dffAgEdAJaiidpO52xm7Tgu1wHrNqhSey0fgzU5ggkM", other: { "msvalidate.01": "BE47118A1D1D58472CC63C1E447D472E", "facebook-domain-verification": "7lv76i77jpkmphak9zh8vrwaqw1avl" } },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <JsonLd data={orgSchema()} />
        <Header />
        <SocialRail />
        <main>{children}</main>
        <AskBand />
        <Footer />
        <ScrollReveal />
      </body>
    </html>
  );
}
