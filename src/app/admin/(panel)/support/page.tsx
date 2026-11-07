import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Badge, Empty, fmtDate, inputCls, btnPrimary, btnGhost } from "@/components/admin/ui";
import { replyTicket } from "./actions";

export const metadata = { title: "Support requests" };

export default async function Support() {
  await requireUser();
  const rows = await q<{ id: number; subject: string; body: string; status: string; reply: string | null; created_at: Date; name: string; email: string }[]>`
    select t.id, t.subject, t.body, t.status, t.reply, t.created_at, u.name, u.email from support_tickets t join users u on u.id = t.user_id
    order by t.status = 'open' desc, t.created_at desc limit 200`;
  return (
    <>
      <PageHead title="Support requests" sub="Questions and requests from your photographers and videographers." />
      {rows.length ? (
        <div className="space-y-4">
          {rows.map((t) => (
            <div key={t.id} className="rounded-lg border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="font-semibold">{t.subject}</h2><Badge status={t.status === "open" ? "new" : t.status === "answered" ? "done" : "cancelled"}>{t.status}</Badge></div>
              <p className="text-xs text-black/50">{t.name} · {t.email} · {fmtDate(t.created_at, true)}</p>
              <p className="mt-3 whitespace-pre-wrap text-sm">{t.body}</p>
              {t.reply && <p className="mt-3 whitespace-pre-wrap rounded bg-black/[.03] p-3 text-sm"><b>Your reply:</b> {t.reply}</p>}
              {t.status !== "closed" && (
                <form action={replyTicket} className="mt-3 space-y-2">
                  <input type="hidden" name="id" value={t.id} />
                  <textarea name="reply" rows={3} className={inputCls} placeholder="Write a reply (emailed to them and shown in their portal)" />
                  <div className="flex gap-2"><button className={btnPrimary}>Send reply</button><button name="close" value="1" className={btnGhost}>Close</button></div>
                </form>
              )}
            </div>
          ))}
        </div>
      ) : <Empty>No support requests yet.</Empty>}
    </>
  );
}
