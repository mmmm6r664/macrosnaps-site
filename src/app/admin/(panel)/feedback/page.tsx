import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Card, Table, Badge, Empty, fmtDate, money } from "@/components/admin/ui";
import type { Answers } from "@/lib/surveys";

type Row = { id: number; name: string; email: string; event: string; event_date: string | null; sent_at: Date | null; reminded_at: Date | null; submitted_at: Date | null; avg_rating: string | null; recommend: number | null; answers: Answers | null; review_invited_at: Date | null; tip_cents: number | null; tip_paid_at: Date | null };

export default async function FeedbackAdmin() {
  await requireUser();
  const rows = await q<Row[]>`select id, name, email, event, event_date::text, sent_at, reminded_at, submitted_at, avg_rating::text, recommend, answers, review_invited_at, tip_cents, tip_paid_at
    from surveys order by coalesce(submitted_at, sent_at, created_at) desc limit 300`.catch(() => [] as Row[]);
  const done = rows.filter((r) => r.submitted_at);
  const avg = done.length ? done.reduce((s, r) => s + Number(r.avg_rating), 0) / done.length : 0;
  const tips = rows.reduce((s, r) => s + (r.tip_paid_at ? r.tip_cents ?? 0 : 0), 0);
  return (
    <div className="space-y-6">
      <PageHead title="Client feedback & tips" sub={`${done.length} of ${rows.length} surveys answered · average ${avg ? avg.toFixed(2) : "—"}/5 · ${money(tips)} in tips`} />
      <Card>
        {rows.length ? (
          <Table head={["Client", "Event", "Status", "Scores", "Crew ratings", "Comments", "Review / tip"]}>
            {rows.map((r) => {
              const a = r.answers;
              return (
                <tr key={r.id} className="align-top">
                  <td className="px-3 py-2"><div className="font-semibold">{r.name}</div><div className="text-xs text-black/55">{r.email}</div></td>
                  <td className="px-3 py-2 text-sm">{r.event || "—"}<div className="text-xs text-black/55">{r.event_date ?? ""}</div></td>
                  <td className="px-3 py-2 text-xs">{r.submitted_at ? <Badge status="done">Answered {fmtDate(r.submitted_at)}</Badge> : r.sent_at ? <Badge status="new">Sent {fmtDate(r.sent_at)}{r.reminded_at ? " · reminded" : ""}</Badge> : "Not sent"}</td>
                  <td className="px-3 py-2 text-xs">{a ? <>Avg <b>{Number(r.avg_rating).toFixed(1)}</b><br />Booking {a.booking} · Quality {a.quality} · Recommend {a.recommend}<br />{a.repeat === "Yes" ? "Repeat client · " : ""}{a.heard}</> : "—"}</td>
                  <td className="px-3 py-2 text-xs">{a?.crew?.length ? a.crew.map((c, i) => <div key={i}>{c.name || c.role}: prof {c.professionalism}, punct {c.punctuality}</div>) : "—"}</td>
                  <td className="max-w-xs px-3 py-2 text-xs whitespace-pre-wrap">{a?.comments || "—"}</td>
                  <td className="px-3 py-2 text-xs">{r.review_invited_at ? <div>Google review invited</div> : null}{r.tip_paid_at ? <div className="font-semibold text-emerald-700">Tip {money(r.tip_cents ?? 0)}</div> : a?.tip === "Yes" ? <div>Chose to tip (not paid)</div> : null}</td>
                </tr>
              );
            })}
          </Table>
        ) : <Empty>No surveys yet. They go out automatically 2 days after a gallery is published.</Empty>}
      </Card>
    </div>
  );
}
