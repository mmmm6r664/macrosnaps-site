import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Notice } from "@/components/admin/ui";
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
  return (
    <>
      <PageHead title={n.subject} sub={locked ? `Sent to ${n.sent_count} subscribers.` : "Edit, preview, test, then send or schedule."}
        actions={!locked && <form action={deleteNewsletter}><input type="hidden" name="id" value={n.id} /><button className="text-sm text-red-700 underline">Delete</button></form>} />
      {n.status === "failed" && n.error && <Notice tone="red">Last send failed: {n.error}</Notice>}
      <NewsletterEditor n={{ ...n, scheduled_at: n.scheduled_at ? new Date(n.scheduled_at).toISOString() : null }} previewHtml={emailHtml(n.subject, n.preheader, n.body, "#")} subscribers={c} locked={locked} />
    </>
  );
}
