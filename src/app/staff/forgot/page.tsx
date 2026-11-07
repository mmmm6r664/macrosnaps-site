import AuthCard from "@/components/staff/AuthCard";
import { ForgotForm } from "@/components/staff/StaffAuthForms";
export const metadata = { title: "Reset password" };
export default function Forgot() { return <AuthCard title="Reset your password"><ForgotForm /></AuthCard>; }
