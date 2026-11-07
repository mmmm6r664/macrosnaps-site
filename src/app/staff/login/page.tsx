import { redirect } from "next/navigation";
import { currentUser } from "@/lib/auth";
import { hasDb } from "@/lib/db";
import AuthCard from "@/components/staff/AuthCard";
import { StaffLoginForm } from "@/components/staff/StaffAuthForms";

export const metadata = { title: "Sign in" };
export default async function Login() {
  if (hasDb && (await currentUser())) redirect("/staff");
  return <AuthCard title="Staff sign in" sub="For MacroSnaps photographers and videographers.">{hasDb ? <StaffLoginForm /> : <p className="text-sm">Sign-in is temporarily unavailable.</p>}</AuthCard>;
}
