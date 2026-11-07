import AuthCard from "@/components/staff/AuthCard";
import { SetPasswordForm } from "@/components/staff/StaffAuthForms";
export const metadata = { title: "Set your password" };
export default async function SetPw({ searchParams }: { searchParams: Promise<{ t?: string }> }) {
  const { t = "" } = await searchParams;
  return <AuthCard title="Set your password" sub="Choose a password for your MacroSnaps staff portal.">{t ? <SetPasswordForm t={t.slice(0, 100)} /> : <p className="text-sm">This link is incomplete. Use the button in your email.</p>}</AuthCard>;
}
