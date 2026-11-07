"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const ITEMS: [string, string][] = [
  ["Home", "/staff"], ["Available shoots", "/staff/offers"], ["My shoots", "/staff/shoots"], ["Upload photos", "/staff/uploads"], ["Payments", "/staff/payments"],
  ["Profile & payout", "/staff/profile"], ["Tax info (W-9)", "/staff/tax"], ["Contract", "/staff/contract"], ["Knowledge base", "/staff/knowledge"], ["Support", "/staff/support"],
];

export default function StaffNav({ badges }: { badges: Record<string, number> }) {
  const path = usePathname();
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-4">
      {ITEMS.map(([label, href]) => {
        const active = href === "/staff" ? path === "/staff" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`flex items-center justify-between gap-2 whitespace-nowrap rounded px-3 py-2 text-sm ${active ? "bg-white/10 font-semibold text-[#ccba56]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
            {label}{badges[href] ? <span className="rounded-full bg-[#ccba56] px-1.5 text-xs font-bold text-black">{badges[href]}</span> : null}
          </Link>
        );
      })}
    </nav>
  );
}
