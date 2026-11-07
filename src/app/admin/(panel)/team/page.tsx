import { requireUser } from "@/lib/auth";
import { db, q } from "@/lib/db";
import { PageHead, Card, Table, Badge, fmtDate } from "@/components/admin/ui";
import { AddMemberForm, LoginLinkButton } from "@/components/admin/TeamForms";
import { setActive } from "./actions";

export const metadata = { title: "Team" };

export default async function Team() {
  const u = await requireUser();
  const users = await q<{ id: number; name: string; email: string; role: string; active: boolean; created_at: Date }[]>`select id, name, email, role, active, created_at from users order by role = 'owner' desc, role = 'admin' desc, name`;
  return (
    <>
      <PageHead title="Team" sub="Who can sign in to this portal. Staff only see the shoots you assign them." />
      <Table head={["Name", "Email", "Role", "Status", "Added", ""]}>
        {users.map((m) => {
          const canToggle = m.id !== u.id && m.role !== "owner" && (m.role !== "admin" || u.role === "owner");
          return (
            <tr key={m.id}>
              <td className="px-4 py-3 font-semibold">{m.name}</td>
              <td className="px-4 py-3">{m.email}</td>
              <td className="px-4 py-3 capitalize">{m.role}</td>
              <td className="px-4 py-3"><Badge status={m.active ? "done" : "cancelled"}>{m.active ? "Active" : "Disabled"}</Badge></td>
              <td className="px-4 py-3 text-black/60">{fmtDate(m.created_at)}</td>
              <td className="px-4 py-3 text-right">
                {canToggle && m.active && <div className="mb-1"><LoginLinkButton id={m.id} /></div>}
                {canToggle && <form action={setActive}><input type="hidden" name="id" value={m.id} /><input type="hidden" name="active" value={m.active ? "0" : "1"} /><button className="text-sm underline">{m.active ? "Disable" : "Enable"}</button></form>}
              </td>
            </tr>
          );
        })}
      </Table>
      <Card title="Add a team member" className="mt-6"><AddMemberForm owner={u.role === "owner"} /></Card>
    </>
  );
}
