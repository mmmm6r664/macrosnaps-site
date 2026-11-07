import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Table, Badge, Empty, Pager, fmtDate, btnGhost, inputCls, btnPrimary } from "@/components/admin/ui";
import { ticketNo, STATUS_LABEL, type Ticket } from "@/lib/tickets";

export const metadata = { title: "Support tickets" };
const SIZE = 50;
const WHO: Record<string, string> = { client: "Client", photographer: "Crew", guest: "Visitor" };

export default async function Support({ searchParams }: { searchParams: Promise<{ view?: string; who?: string; q?: string; page?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const view = ["open", "resolved", "all"].includes(sp.view ?? "") ? sp.view! : "open";
  const who = ["client", "photographer", "guest"].includes(sp.who ?? "") ? sp.who : undefined;
  const term = (sp.q ?? "").trim().slice(0, 100);
  const page = Math.max(1, Number(sp.page) || 1);
  const sql = await db();
  const like = `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const num = Number(term.replace(/^ms-?t/i, "")) || 0;
  const rows = await sql<(Ticket & { msgs: number; last_author: string })[]>`
    select t.*, (select count(*)::int from ticket_messages m where m.ticket_id = t.id and m.author <> 'note') as msgs,
      (select author from ticket_messages m where m.ticket_id = t.id and m.author <> 'note' order by id desc limit 1) as last_author
    from tickets t where true
    ${view === "open" ? sql`and t.status in ('open', 'in_progress', 'waiting')` : view === "resolved" ? sql`and t.status in ('resolved', 'closed')` : sql``}
    ${who ? sql`and t.source = ${who}` : sql``}
    ${term ? sql`and (t.subject ilike ${like} or t.email ilike ${like} or t.name ilike ${like} or t.order_ref ilike ${like} or t.id = ${num})` : sql``}
    order by (t.status = 'open') desc, t.updated_at desc limit ${SIZE + 1} offset ${(page - 1) * SIZE}`;
  const [c] = await sql<{ open: number; waiting: number; today: number }[]>`select count(*) filter (where status in ('open','in_progress'))::int as open, count(*) filter (where status = 'waiting')::int as waiting, count(*) filter (where created_at > now() - interval '24 hours')::int as today from tickets`;
  const link = (v: string, label: string) => <Link href={`/admin/support?view=${v}${who ? `&who=${who}` : ""}`} className={`${btnGhost} ${view === v ? "!border-black" : ""}`}>{label}</Link>;
  return (
    <>
      <PageHead title="Support tickets" sub={`${c.open} need attention · ${c.waiting} waiting on customer · ${c.today} new in the last 24 hours`} actions={<>{link("open", "Active")}{link("resolved", "Resolved")}{link("all", "All")}</>} />
      <form className="mb-4 flex flex-wrap gap-2">
        <input type="hidden" name="view" value={view} />
        <input name="q" defaultValue={term} placeholder="Search ticket #, name, email, subject or order" className={`${inputCls} max-w-sm`} />
        <select name="who" defaultValue={who ?? ""} className={`${inputCls} max-w-[180px]`} aria-label="From"><option value="">Everyone</option><option value="client">Clients</option><option value="photographer">Photographers & videographers</option><option value="guest">Website visitors</option></select>
        <button className={btnPrimary}>Search</button>
      </form>
      {rows.length ? (
        <Table head={["Ticket", "From", "Subject", "Status", "Updated"]}>
          {rows.slice(0, SIZE).map((t) => (
            <tr key={t.id} className="align-top hover:bg-black/[.02]">
              <td className="whitespace-nowrap px-4 py-3 font-mono text-xs">{ticketNo(t.id)}</td>
              <td className="px-4 py-3">{t.name || t.email}<div className="text-xs text-black/50">{WHO[t.source] ?? t.source} · {t.email}</div></td>
              <td className="max-w-md px-4 py-3"><Link href={`/admin/support/${t.id}`} className="font-semibold hover:underline">{t.subject}</Link><div className="text-xs text-black/50">{t.category}{t.order_ref ? ` · ${t.order_ref}` : ""} · {t.msgs} message{t.msgs === 1 ? "" : "s"}{t.last_author === "customer" && t.status !== "resolved" && t.status !== "closed" ? " · awaiting our reply" : ""}</div></td>
              <td className="px-4 py-3"><Badge status={t.status}>{STATUS_LABEL[t.status] ?? t.status}</Badge></td>
              <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(t.updated_at, true)}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>{view === "open" ? "No open tickets. 🎉" : "No tickets match."}</Empty>}
      <Pager base={`/admin/support?${new URLSearchParams({ view, ...(who ? { who } : {}), ...(term ? { q: term } : {}) })}`} page={page} more={rows.length > SIZE} />
    </>
  );
}
