import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Table, Badge, Empty, Pager, fmtDate, btnGhost } from "@/components/admin/ui";

export const metadata = { title: "Inbox" };
const SIZE = 30;

export default async function Inbox({ searchParams }: { searchParams: Promise<{ kind?: string; status?: string; page?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const kind = ["contact", "application"].includes(sp.kind ?? "") ? sp.kind : undefined;
  const status = ["new", "in_progress", "done", "rejected"].includes(sp.status ?? "") ? sp.status : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const sql = await db();
  const rows = await sql<{ id: number; kind: string; name: string; email: string; status: string; data: Record<string, string>; created_at: Date }[]>`
    select id, kind, name, email, status, data, created_at from inquiries where true
    ${kind ? sql`and kind = ${kind}` : sql``} ${status ? sql`and status = ${status}` : sql``}
    order by created_at desc limit ${SIZE + 1} offset ${(page - 1) * SIZE}`;
  const tab = (label: string, k?: string) => (
    <Link href={`/admin/inbox${k ? `?kind=${k}` : ""}`} className={`${btnGhost} ${kind === k ? "!border-black" : ""}`}>{label}</Link>
  );
  return (
    <>
      <PageHead title="Inbox" sub="Contact-form messages and careers applications." actions={<>{tab("All")}{tab("Messages", "contact")}{tab("Applications", "application")}</>} />
      {rows.length ? (
        <Table head={["From", "Type", "About", "Status", "Received"]}>
          {rows.slice(0, SIZE).map((r) => (
            <tr key={r.id} className="hover:bg-black/[.02]">
              <td className="px-4 py-3"><Link href={`/admin/inbox/${r.id}`} className="font-semibold hover:underline">{r.name || r.email}</Link><div className="text-xs text-black/50">{r.email}</div></td>
              <td className="px-4 py-3">{r.kind === "application" ? "Application" : "Message"}</td>
              <td className="max-w-md truncate px-4 py-3 text-black/70">{r.kind === "application" ? `${r.data.role ?? ""} · ${r.data.city ?? ""}` : r.data.subject || r.data.message}</td>
              <td className="px-4 py-3"><Badge status={r.status} /></td>
              <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(r.created_at, true)}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>Nothing here yet.</Empty>}
      <Pager base={`/admin/inbox?${new URLSearchParams({ ...(kind ? { kind } : {}), ...(status ? { status } : {}) })}`} page={page} more={rows.length > SIZE} />
    </>
  );
}
