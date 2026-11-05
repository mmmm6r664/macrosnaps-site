import { SITE } from "@/lib/site";
import { IconFacebook, IconInstagram, IconPinterest, IconX, IconYoutube } from "./Icons";

export const SOCIALS = [
  { href: SITE.social.instagram, label: "Instagram", Icon: IconInstagram },
  { href: SITE.social.facebook, label: "Facebook", Icon: IconFacebook },
  { href: SITE.social.youtube, label: "YouTube", Icon: IconYoutube },
  { href: SITE.social.twitter, label: "X (Twitter)", Icon: IconX },
  { href: SITE.social.pinterest, label: "Pinterest", Icon: IconPinterest },
];

export default function SocialRail() {
  return (
    <div className="fixed left-4 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-3 xl:flex">
      {SOCIALS.map(({ href, label, Icon }) => (
        <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
          className="grid h-9 w-9 place-items-center rounded-full bg-black text-white shadow transition hover:bg-gold hover:text-black">
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}
