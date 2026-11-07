import Header from "@/components/Header";
import Footer from "@/components/Footer";
import SocialRail from "@/components/SocialRail";
import JsonLd from "@/components/JsonLd";
import { orgSchema } from "@/lib/schema";
import { AskBand } from "@/components/AskBox";
import { ScrollReveal } from "@/components/Motion";
import CookieConsent from "@/components/CookieConsent";
import AnnouncementBar from "@/components/AnnouncementBar";

/** Public website chrome: header, footer, request box, cookie banner. */
export default function SiteLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <JsonLd data={orgSchema()} />
      <AnnouncementBar />
      <Header />
      <SocialRail />
      <main>{children}</main>
      <AskBand />
      <Footer />
      <ScrollReveal />
      <CookieConsent />
    </>
  );
}
