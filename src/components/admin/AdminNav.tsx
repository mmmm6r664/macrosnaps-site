"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const MANAGER = [
  ["Dashboard", "/admin"], ["Bookings", "/admin/bookings"], ["Calendar", "/admin/calendar"], ["Payments & refunds", "/admin/payments"],
  ["Invoices", "/admin/invoices"], ["Inbox", "/admin/inbox"], ["Newsletters", "/admin/newsletters"], ["Subscribers", "/admin/subscribers"],
  ["Website", "/admin/website"], ["Team", "/admin/team"], ["My account", "/admin/account"],
];
const STAFF = [["My shoots", "/admin"], ["Calendar", "/admin/calendar"], ["My account", "/admin/account"]];

export default function AdminNav({ manager }: { manager: boolean }) {
  const path = usePathname();
  const items = manager ? MANAGER : STAFF;
  return (
    <nav className="flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:pb-4">
      {items.map(([label, href]) => {
        const active = href === "/admin" ? path === "/admin" : path.startsWith(href);
        return (
          <Link key={href} href={href} className={`whitespace-nowrap rounded px-3 py-2 text-sm ${active ? "bg-white/10 font-semibold text-[#ccba56]" : "text-white/75 hover:bg-white/5 hover:text-white"}`}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
