import { redirect } from "next/navigation";
import { pendingMfaUser } from "@/lib/auth";
import AuthCard from "@/components/staff/AuthCard";
import { VerifyForm } from "@/components/mfa/MfaForms";

export const metadata = { title: "Verify it's you" };
export default async function Verify() {
  const u = await pendingMfaUser();
  if (!u) redirect("/staff/login");
  return <AuthCard title="Two-factor authentication" sub={`Signing in as ${u.email}`}><VerifyForm /></AuthCard>;
}
