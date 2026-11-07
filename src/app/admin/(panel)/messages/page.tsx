import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import ImportEmails from "@/components/admin/ImportEmails";
import { PageHead, Table, Badge, Empty, Pager, fmtDate, btnGhost, inputCls, btnPrimary } from "@/components/admin/ui";

export const metadata = { title: "Sent emails & texts" };
const SIZE = 50;

export default async function Messages({ searchParams }: { searchParams: Promise<{ tab?: string; q?: string; status?: string; page?: string }> }) {
  await requireUser();
  const sp = await searchParams;
  const tab = sp.tab === "texts" ? "texts" : "emails";
  const term = (sp.q ?? "").trim().slice(0, 100);
  const status = ["sent", "failed", "not sent"].includes(sp.status ?? "") ? sp.status : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const like = `%${term.replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
  const sql = await db();
  const qs = (extra: Record<string, string>) => `/admin/messages?${new URLSearchParams({ ...(tab === "texts" ? { tab } : {}), ...(term ? { q: term } : {}), ...(status ? { status } : {}), ...extra })}`;
  const tabLink = (label: string, t: string) => (
    <Link href={`/admin/messages${t === "texts" ? "?tab=texts" : ""}`} className={`${btnGhost} ${tab === t ? "!border-black" : ""}`}>{label}</Link>
  );

  const [{ today, week, failed }] = await sql<{ today: number; week: number; failed: number }[]>`
    select count(*) filter (where created_at > date_trunc('day', now() at time zone 'America/New_York') at time zone 'America/New_York')::int as today,
      count(*) filter (where created_at > now() - interval '7 days')::int as week,
      count(*) filter (where status <> 'sent' and created_at > now() - interval '7 days')::int as failed from email_log`;

  return (
    <>
      <PageHead title="Sent emails & texts" sub="Every email the website and portal send (to clients, photographers, subscribers and you), plus texts. Click an email to see exactly what was sent." actions={<>{tabLink("Emails", "emails")}{tabLink("Texts", "texts")}</>} />
      <form className="mb-4 flex flex-wrap gap-2">
        {tab === "texts" && <input type="hidden" name="tab" value="texts" />}
        <input name="q" defaultValue={term} placeholder={tab === "texts" ? "Search phone number or message" : "Search email address or subject"} className={`${inputCls} max-w-sm`} />
        {tab === "emails" && (
          <select name="status" defaultValue={status ?? ""} className={`${inputCls} max-w-[160px]`} aria-label="Status">
            <option value="">All statuses</option><option value="sent">Sent</option><option value="failed">Failed</option><option value="not sent">Not sent</option>
          </select>
        )}
        <button className={btnPrimary}>Search</button>
      </form>
      {tab === "emails" ? await (async () => {
        const rows = await sql<{ id: number; to_addr: string; subject: string; status: string; error: string | null; attachments: string[]; created_at: Date }[]>`
          select id, to_addr, subject, status, error, attachments, created_at from email_log where true
          ${term ? sql`and (to_addr ilike ${like} or subject ilike ${like})` : sql``} ${status ? sql`and status = ${status}` : sql``}
          order by id desc limit ${SIZE + 1} offset ${(page - 1) * SIZE}`;
        return (
          <>
            <ImportEmails />
            <p className="mb-3 text-sm text-black/60">{today} sent today · {week} in the last 7 days{failed ? <> · <Link className="font-semibold text-red-700 underline" href="/admin/messages?status=failed">{failed} not delivered</Link></> : null}</p>
            {rows.length ? (
              <Table head={["When", "To", "Subject", "Status"]}>
                {rows.slice(0, SIZE).map((m) => (
                  <tr key={m.id} className="align-top hover:bg-black/[.02]">
                    <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(m.created_at, true)}</td>
                    <td className="max-w-[220px] break-words px-4 py-3">{m.to_addr}</td>
                    <td className="max-w-md px-4 py-3"><Link href={`/admin/messages/${m.id}`} className="font-semibold hover:underline">{m.subject || "(no subject)"}</Link>{m.attachments?.length ? <div className="text-xs text-black/50">📎 {m.attachments.join(", ")}</div> : null}</td>
                    <td className="px-4 py-3"><Badge status={m.status === "sent" ? "done" : "failed"}>{m.status}</Badge>{m.error && <div className="mt-1 max-w-[200px] text-xs text-red-700">{m.error}</div>}</td>
                  </tr>
                ))}
              </Table>
            ) : <Empty>{term || status ? "No emails match." : "No emails logged yet. Every email sent from now on appears here."}</Empty>}
            <Pager base={qs({})} page={page} more={rows.length > SIZE} />
          </>
        );
      })() : await (async () => {
        const rows = await sql<{ id: number; recipient: string; body: string; status: string; error: string | null; created_at: Date }[]>`
          select id, recipient, body, status, error, created_at from outbound_messages where channel = 'sms'
          ${term ? sql`and (recipient ilike ${like} or body ilike ${like})` : sql``}
          order by id desc limit ${SIZE + 1} offset ${(page - 1) * SIZE}`;
        return (
          <>
            {rows.length ? (
              <Table head={["When", "To", "Message", "Status"]}>
                {rows.slice(0, SIZE).map((m) => (
                  <tr key={m.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-black/60">{fmtDate(m.created_at, true)}</td>
                    <td className="px-4 py-3">{m.recipient}</td>
                    <td className="max-w-md whitespace-pre-wrap px-4 py-3 text-black/80">{m.body}</td>
                    <td className="px-4 py-3"><Badge status={m.status === "sent" ? "done" : "failed"}>{m.status}</Badge>{m.error && <div className="text-xs text-red-700">{m.error}</div>}</td>
                  </tr>
                ))}
              </Table>
            ) : <Empty>No texts sent yet.</Empty>}
            <Pager base={qs({})} page={page} more={rows.length > SIZE} />
          </>
        );
      })()}
    </>
  );
}
