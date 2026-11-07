import { requireStaff } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Badge, Empty, fmtDate } from "@/components/admin/ui";
import { TicketForm } from "@/components/staff/StaffForms";

export const metadata = { title: "Support" };

export default async function Support() {
  const u = await requireStaff();
  const rows = await q<{ id: number; subject: string; body: string; status: string; reply: string | null; created_at: Date }[]>`select id, subject, body, status, reply, created_at from support_tickets where user_id = ${u.id} order by id desc`;
  return (
    <>
      <PageHead title="Support" sub="Questions about a shoot, payments or anything else? Ask here." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <TicketForm />
        <div className="space-y-3">
          {rows.length ? rows.map((t) => (
            <div key={t.id} className="rounded-lg border border-black/10 bg-white p-4 text-sm">
              <div className="flex justify-between gap-2"><b>{t.subject}</b><Badge status={t.status === "open" ? "new" : t.status === "answered" ? "done" : "cancelled"}>{t.status}</Badge></div>
              <p className="text-xs text-black/40">{fmtDate(t.created_at, true)}</p>
              <p className="mt-2 whitespace-pre-wrap">{t.body}</p>
              {t.reply && <p className="mt-2 whitespace-pre-wrap rounded bg-black/[.03] p-3"><b>MacroSnaps:</b> {t.reply}</p>}
            </div>
          )) : <Empty>No requests yet.</Empty>}
        </div>
      </div>
    </>
  );
}
