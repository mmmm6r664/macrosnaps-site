import type { Metadata } from "next";
export const metadata: Metadata = { title: { default: "Admin", template: "%s · MacroSnaps Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";
export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen bg-[#f6f5f1] font-sans text-[15px] text-[#1d1d1d]">{children}</div>;
}
