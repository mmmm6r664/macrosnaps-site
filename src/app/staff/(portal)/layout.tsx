import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { hasDb, q } from "@/lib/db";
import { getProfile } from "@/lib/staffData";
import { CONTRACT_VERSION } from "@/data/contractorAgreement";
import StaffNav from "@/components/staff/StaffNav";
import { staffLogout } from "@/app/staff/auth-actions";

export default async function Portal({ children }: { children: React.ReactNode }) {
  if (!hasDb) redirect("/staff/login");
  const u = await requireStaff();
  const p = await getProfile(u.id);
  const [{ offers, unread }] = await q<{ offers: number; unread: number }[]>`
    select (select count(*)::int from offer_recipients r join offers o on o.id = r.offer_id where r.user_id = ${u.id} and r.response = 'pending' and o.status = 'open') as offers,
           (select count(*)::int from notifications where user_id = ${u.id} and read_at is null) as unread`;
  const todo = [
    p?.contract_version !== CONTRACT_VERSION && ["Sign the contractor agreement", "/staff/contract"],
    !p?.w9_signed_at && ["Complete your W-9 (tax info)", "/staff/tax"],
    !p?.payout_method && ["Add your payout method", "/staff/profile"],
    !(p?.shoot_types?.length) && ["Choose the shoots you want", "/staff/profile"],
  ].filter(Boolean) as [string, string][];
  return (
    <div className="lg:grid lg:min-h-screen lg:grid-cols-[230px_1fr]">
      <aside className="border-b border-black/10 bg-[#111] text-white lg:border-b-0">
        <div className="px-5 py-4"><Link href="/staff" className="font-script text-3xl text-[#ccba56]">MacroSnaps</Link><p className="text-[11px] uppercase tracking-[.25em] text-white/40">Staff portal</p></div>
        <StaffNav badges={{ "/staff/offers": offers, "/staff": unread }} />
        <div className="border-t border-white/10 px-5 py-4 text-xs text-white/60">
          <p className="truncate font-semibold text-white">{u.name}</p><p className="truncate">{u.email}</p>
          <form action={staffLogout} className="mt-3"><button className="underline hover:text-white">Sign out</button></form>
        </div>
      </aside>
      <main className="min-w-0 p-4 md:p-8">
        {todo.length > 0 && (
          <div className="mb-6 rounded border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            <p className="font-semibold">To finish setting up:</p>
            <ul className="mt-1 flex flex-wrap gap-x-5 gap-y-1">{todo.map(([l, h]) => <li key={l}><Link href={h} className="underline">{l}</Link></li>)}</ul>
          </div>
        )}
        {children}
      </main>
    </div>
  );
}
