import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { db, q } from "@/lib/db";
import { PageHead, Table, Badge, Empty, fmtDate, btnGold, Notice } from "@/components/admin/ui";
import { newDraft } from "./actions";

export const metadata = { title: "Newsletters" };

export default async function Newsletters() {
  await requireUser();
  const rows = await q<{ id: number; subject: string; status: string; scheduled_at: Date | null; sent_at: Date | null; sent_count: number; updated_at: Date }[]>`
    select id, subject, status, scheduled_at, sent_at, sent_count, updated_at from newsletters order by updated_at desc limit 100`;
  return (
    <>
      <PageHead title="Newsletters" sub="Write, schedule and send email newsletters to your subscribers." actions={<form action={newDraft}><button className={btnGold}>New newsletter</button></form>} />
      {!process.env.RESEND_API_KEY && <Notice>Email isn&apos;t connected yet. You can write and schedule newsletters, but they can only be sent once RESEND_API_KEY is added in Vercel.</Notice>}
      {rows.length ? (
        <Table head={["Subject", "Status", "When", "Recipients", "Edited"]}>
          {rows.map((n) => (
            <tr key={n.id}>
              <td className="px-4 py-3"><Link href={`/admin/newsletters/${n.id}`} className="font-semibold hover:underline">{n.subject}</Link></td>
              <td className="px-4 py-3"><Badge status={n.status} /></td>
              <td className="px-4 py-3">{n.status === "sent" ? fmtDate(n.sent_at, true) : n.status === "scheduled" ? fmtDate(n.scheduled_at) : "—"}</td>
              <td className="px-4 py-3">{n.sent_count || "—"}</td>
              <td className="px-4 py-3 text-black/60">{fmtDate(n.updated_at, true)}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No newsletters yet.</Empty>}
    </>
  );
}
