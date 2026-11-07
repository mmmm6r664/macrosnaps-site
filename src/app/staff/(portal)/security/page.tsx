import { requireStaff, isManager } from "@/lib/auth";
import SecurityPage from "@/components/mfa/SecurityPage";

export const metadata = { title: "Security" };
export default async function StaffSecurity() {
  const u = await requireStaff();
  return <SecurityPage u={u} manager={isManager(u)} />;
}
