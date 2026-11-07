import Logo from "@/components/Logo";
import Link from "next/link";
import { redirect } from "next/navigation";
import { currentUser, isManager } from "@/lib/auth";
import SecurityPage from "@/components/mfa/SecurityPage";

export const metadata = { title: "Security" };

/** Outside the main panel so admins can reach it before 2FA is set up. */
export default async function AdminSecurity() {
  const u = await currentUser();
  if (!u) redirect("/admin/login");
  if (!isManager(u)) redirect("/staff/security");
  return (
    <div className="mx-auto max-w-5xl p-4 md:p-8">
      <Logo size={48} onLight className="mb-4" />
      <SecurityPage u={u} manager />
      {u.totp_enabled && <Link href="/admin" className="mt-6 inline-block text-sm underline">← Back to admin</Link>}
    </div>
  );
}
