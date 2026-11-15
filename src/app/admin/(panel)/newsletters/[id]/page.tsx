import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Notice, Card, Table, fmtDate } from "@/components/admin/ui";
import NewsletterEditor from "@/components/admin/NewsletterEditor";
import { emailHtml } from "@/lib/newsletter";
import { deleteNewsletter } from "../actions";

export const metadata = { title: "Newsletter" };

export default async function NewsletterPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const sql = await db();
  const [n] = await sql<{ id: number; subject: string; preheader: string; body: string; status: string; scheduled_at: Date | null; sent_count: number; error: string | null }[]>`
    select id, subject, preheader, body, status, scheduled_at, sent_count, error from newsletters where id = ${Number((await params).id) || 0}`;
  if (!n) notFound();
  const [{ c }] = await sql<{ c: number }[]>`select count(*)::int as c from subscribers where status = 'subscribed'`;
  const locked = n.status === "sent" || n.status === "sending";
  const [st] = locked ? await sql<{ opens: number; uopens: number; clicks: number; uclicks: number }[]>`
    select count(*) filter (where kind = 'open')::int as opens, count(distinct subscriber_id) filter (where kind = 'open')::int as uopens,
      count(*) filter (where kind = 'click')::int as clicks, count(distinct subscriber_id) filter (where kind = 'click')::int as uclicks
    from newsletter_events where newsletter_id = ${n.id}` : [{ opens: 0, uopens: 0, clicks: 0, uclicks: 0 }];
  const links = locked ? await sql<{ url: string; clicks: number; people: number }[]>`
    select url, count(*)::int as clicks, count(distinct subscriber_id)::int as people from newsletter_events where newsletter_id = ${n.id} and kind = 'click' group by url order by clicks desc limit 20` : [];
  const people = locked ? await sql<{ email: string; name: string; opened: Date | null; clicked: Date | null; clicks: number }[]>`
    select s.email, s.name, min(e.created_at) filter (where e.kind = 'open') as opened, min(e.created_at) filter (where e.kind = 'click') as clicked,
      count(*) filter (where e.kind = 'click')::int as clicks
    from newsletter_events e join subscribers s on s.id = e.subscriber_id where e.newsletter_id = ${n.id}
    group by s.email, s.name order by clicked desc nulls last, opened desc limit 300` : [];
  const pct = (a: number) => (n.sent_count ? `${Math.round((a / n.sent_count) * 1000) / 10}%` : "—");
  const Stat = ({ k, v, sub }: { k: string; v: string | number; sub?: string }) => <div className="rounded-lg border border-black/10 bg-white p-4"><p className="text-xs font-semibold uppercase tracking-wider text-black/50">{k}</p><p className="mt-1 text-2xl font-semibold">{v}</p>{sub ? <p className="text-xs text-black/50">{sub}</p> : null}</div>;
  return (
    <>
      <PageHead title={n.subject} sub={locked ? `Sent to ${n.sent_count} subscribers.` : "Edit, preview, test, then send or schedule."}
        actions={!locked && <form action={deleteNewsletter}><input type="hidden" name="id" value={n.id} /><button className="text-sm text-red-700 underline">Delete</button></form>} />
      {locked && (
        <div className="mb-6 space-y-6">
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            <Stat k="Sent" v={n.sent_count} />
            <Stat k="Opened" v={st.uopens} sub={`${st.opens} total opens`} />
            <Stat k="Open rate" v={pct(st.uopens)} />
            <Stat k="Clicked" v={st.uclicks} sub={`${st.clicks} total clicks`} />
            <Stat k="Click rate (CTR)" v={pct(st.uclicks)} sub={st.uopens ? `${Math.round((st.uclicks / st.uopens) * 1000) / 10}% of openers` : undefined} />
          </div>
          <p className="text-xs text-black/50">Opens are counted when the reader&apos;s email app loads images; some apps (like Apple Mail Privacy) load them automatically, so open rates run a little high. Clicks are exact.</p>
          {links.length > 0 && (
            <Card title="Links clicked">
              <Table head={["Link", "Clicks", "People"]}>
                {links.map((l) => <tr key={l.url}><td className="max-w-lg break-all px-4 py-3"><a className="underline" href={l.url} target="_blank" rel="noreferrer">{l.url}</a></td><td className="px-4 py-3">{l.clicks}</td><td className="px-4 py-3">{l.people}</td></tr>)}
              </Table>
            </Card>
          )}
          {people.length > 0 && (
            <Card title="Who opened and clicked">
              <Table head={["Subscriber", "Opened", "Clicked", "Clicks"]}>
                {people.map((p) => <tr key={p.email}><td className="px-4 py-3">{p.name ? <div>{p.name}</div> : null}<div className="break-all text-xs text-black/60">{p.email}</div></td><td className="px-4 py-3">{p.opened ? fmtDate(p.opened, true) : "—"}</td><td className="px-4 py-3">{p.clicked ? fmtDate(p.clicked, true) : "—"}</td><td className="px-4 py-3">{p.clicks || "—"}</td></tr>)}
              </Table>
            </Card>
          )}
        </div>
      )}
      {n.status === "failed" && n.error && <Notice tone="red">Last send failed: {n.error}</Notice>}
      <NewsletterEditor n={{ ...n, scheduled_at: n.scheduled_at ? new Date(n.scheduled_at).toISOString() : null }} previewHtml={emailHtml(n.subject, n.preheader, n.body, "#")} subscribers={c} locked={locked} />
    </>
  );
}
