import { requireUser } from "@/lib/auth";
import { PageHead, Card, btnGhost } from "@/components/admin/ui";
import { PasswordForm } from "@/components/admin/TeamForms";
import { logout } from "@/app/admin/auth-actions";

export const metadata = { title: "My account" };

export default async function Account() {
  const u = await requireUser(["owner", "admin", "staff"]);
  return (
    <>
      <PageHead title="My account" sub={`${u.name} · ${u.email} · ${u.role}`} actions={<form action={logout}><button className={btnGhost}>Sign out</button></form>} />
      <Card title="Change password"><PasswordForm /></Card>
    </>
  );
}
