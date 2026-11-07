import Link from "next/link";
import { getSetting } from "@/lib/settings";

/** Optional site-wide banner, switched on and edited in the admin portal (Website → Announcement). */
export default async function AnnouncementBar() {
  const a = await getSetting("announcement");
  if (!a.enabled || !a.text.trim()) return null;
  const internal = a.link.startsWith("/");
  return (
    <div className="bg-gold px-4 py-2 text-center text-sm font-semibold text-black">
      {a.text}
      {a.link && (internal
        ? <Link href={a.link} className="ml-2 underline underline-offset-2">{a.linkText || "Learn more"}</Link>
        : <a href={a.link} className="ml-2 underline underline-offset-2" target="_blank" rel="noopener">{a.linkText || "Learn more"}</a>)}
    </div>
  );
}
