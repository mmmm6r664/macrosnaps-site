import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Card, Table, Badge, Empty, Pager, fmtDate, inputCls, btnGhost } from "@/components/admin/ui";
import ImportSubscribers from "@/components/admin/ImportSubscribers";
import { setSubscriber } from "./actions";

export const metadata = { title: "Subscribers" };
const SIZE = 50;

export default async function Subscribers({ searchParams }: { searchParams: Promise<{ q?: string; page?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const q = (sp.q ?? "").slice(0, 80);
  const page = Math.max(1, Number(sp.page) || 1);
  const sql = await db();
  const like = q ? `%${q.replace(/[%_]/g, "")}%` : null;
  const rows = await sql<{ id: number; email: string; name: string; status: string; source: string | null; created_at: Date }[]>`
    select id, email, name, status, source, created_at from subscribers ${like ? sql`where email ilike ${like} or name ilike ${like}` : sql``}
    order by created_at desc limit ${SIZE + 1} offset ${(page - 1) * SIZE}`;
  const [{ subs, unsubs }] = await sql<{ subs: number; unsubs: number }[]>`select count(*) filter (where status = 'subscribed')::int as subs, count(*) filter (where status = 'unsubscribed')::int as unsubs from subscribers`;
  const Btn = ({ id, op, label }: { id: number; op: string; label: string }) => <form action={setSubscriber}><input type="hidden" name="id" value={id} /><input type="hidden" name="op" value={op} /><button className={`text-xs underline ${op === "delete" ? "text-red-700" : ""}`}>{label}</button></form>;
  return (
    <>
      <PageHead title="Subscribers" sub={`${subs} subscribed · ${unsubs} unsubscribed. People join through the signup box at the bottom of every page.`} actions={<form action="/api/admin/subscribers" method="get"><button className={btnGhost}>Export CSV</button></form>} />
      <form className="mb-4 flex gap-2"><input name="q" defaultValue={q} placeholder="Search email or name" className={`${inputCls} max-w-xs`} /><button className={btnGhost}>Search</button></form>
      {rows.length ? (
        <Table head={["Email", "Name", "Status", "Source", "Joined", ""]}>
          {rows.slice(0, SIZE).map((r) => (
            <tr key={r.id}>
              <td className="px-4 py-3">{r.email}</td>
              <td className="px-4 py-3">{r.name || "—"}</td>
              <td className="px-4 py-3"><Badge status={r.status} /></td>
              <td className="px-4 py-3 text-black/60">{r.source ?? "—"}</td>
              <td className="px-4 py-3 text-black/60">{fmtDate(r.created_at)}</td>
              <td className="px-4 py-3"><div className="flex justify-end gap-3">{r.status === "subscribed" ? <Btn id={r.id} op="unsubscribe" label="Unsubscribe" /> : <Btn id={r.id} op="resubscribe" label="Resubscribe" />}<Btn id={r.id} op="delete" label="Delete" /></div></td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No subscribers yet.</Empty>}
      <Pager base={`/admin/subscribers${q ? `?q=${encodeURIComponent(q)}` : ""}`} page={page} more={rows.length > SIZE} />
      <Card title="Add or import subscribers" className="mt-6"><ImportSubscribers /></Card>
    </>
  );
}
