import { requireUser } from "@/lib/auth";
import { getSetting } from "@/lib/settings";
import { HOME_FAQS } from "@/data/homeFaqs";
import { PageHead, Card } from "@/components/admin/ui";
import { AnnouncementForm, HeroForm, FaqsForm, ReviewUrlForm } from "@/components/admin/WebsiteForms";

export const metadata = { title: "Website" };

export default async function Website() {
  await requireUser();
  const [announcement, hero, faqs, reviewUrl] = await Promise.all([getSetting("announcement"), getSetting("home_hero"), getSetting("home_faqs"), getSetting("google_review_url")]);
  return (
    <>
      <PageHead title="Website" sub="Edit what visitors see. Changes go live within about a minute." />
      <div className="grid gap-5 xl:grid-cols-2">
        <Card title="Announcement banner"><AnnouncementForm v={announcement} /></Card>
        <Card title="Homepage headline"><HeroForm v={hero} /></Card>
        <Card title="Google reviews"><ReviewUrlForm v={reviewUrl} /></Card>
      </div>
      <Card title="Homepage FAQs" className="mt-5"><FaqsForm v={faqs ?? HOME_FAQS} custom={!!faqs} /></Card>
      <p className="mt-6 text-sm text-black/50">Prices, page layouts, photos and the text of service, city and event pages are written into the site&apos;s code. Ask Claude to change those.</p>
    </>
  );
}
