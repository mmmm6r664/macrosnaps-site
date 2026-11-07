import Link from "next/link";
import { requireUser, isManager } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import { redirect } from "next/navigation";
import { logout } from "@/app/admin/auth-actions";
import AdminNav from "@/components/admin/AdminNav";

export default async function Panel({ children }: { children: React.ReactNode }) {
  if (!hasDb) redirect("/admin/login");
  const u = await requireUser(["owner", "admin", "staff"]);
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[230px_1fr]">
      <aside className="border-b border-black/10 bg-[#111] text-white lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/admin" className="font-script text-3xl text-[#ccba56]">MacroSnaps</Link>
          <p className="hidden text-[11px] uppercase tracking-[.25em] text-white/40 lg:block">Admin</p>
        </div>
        <AdminNav manager={isManager(u)} />
        <div className="hidden border-t border-white/10 px-5 py-4 text-xs text-white/60 lg:block">
          <p className="truncate font-semibold text-white">{u.name}</p>
          <p className="truncate">{u.email} · {u.role}</p>
          <div className="mt-3 flex gap-3">
            <Link href="/admin/account" className="underline hover:text-white">My account</Link>
            <form action={logout}><button className="underline hover:text-white">Sign out</button></form>
          </div>
          <Link href="/" target="_blank" className="mt-3 block text-[#ccba56] hover:underline">View website ↗</Link>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
