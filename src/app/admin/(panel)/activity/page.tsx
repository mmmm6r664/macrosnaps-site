import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Table, fmtDate } from "@/components/admin/ui";

export const metadata = { title: "Security log" };

export default async function Activity() {
  await requireUser(["owner"]);
  const rows = await q<{ id: number; action: string; detail: string; created_at: Date; name: string | null }[]>`
    select a.id, a.action, a.detail, a.created_at, u.name from audit_log a left join users u on u.id = a.user_id order by a.id desc limit 300`;
  return (
    <>
      <PageHead title="Security log" sub="Sign-ins, failed attempts, refunds, tax-ID reveals and other sensitive actions (last 300). Owner only." />
      <Table head={["When", "Who", "Action", "Detail"]}>
        {rows.map((r) => (
          <tr key={r.id} className={r.action.includes("failed") ? "bg-red-50/50" : ""}>
            <td className="whitespace-nowrap px-4 py-2 text-black/60">{fmtDate(r.created_at, true)}</td>
            <td className="px-4 py-2">{r.name ?? "—"}</td>
            <td className="px-4 py-2 font-mono text-xs">{r.action}</td>
            <td className="max-w-md truncate px-4 py-2 text-xs text-black/60">{r.detail}</td>
          </tr>
        ))}
      </Table>
    </>
  );
}
