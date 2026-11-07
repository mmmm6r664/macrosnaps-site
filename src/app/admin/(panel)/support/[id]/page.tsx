import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Card, Badge, fmtDate, btnGhost } from "@/components/admin/ui";
import { getTicket, messagesFor, ticketNo, ticketUrl, STATUS_LABEL } from "@/lib/tickets";
import TicketReply from "@/components/admin/TicketReply";

export const metadata = { title: "Ticket" };
const WHO: Record<string, string> = { client: "Client (signed in)", photographer: "Photographer / videographer", guest: "Website visitor" };

export default async function TicketAdmin({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id) || 0;
  const t = await getTicket(id);
  if (!t) notFound();
  const msgs = await messagesFor(id, true);
  const booking = t.order_ref ? (await q<{ id: number }[]>`select id from bookings where upper(ref) = ${t.order_ref.toUpperCase()}`)[0] : undefined;
  return (
    <>
      <PageHead title={t.subject} sub={`${ticketNo(id)} · ${t.category} · opened ${fmtDate(t.created_at, true)}`} actions={<><Badge status={t.status}>{STATUS_LABEL[t.status] ?? t.status}</Badge><Link href="/admin/support" className={btnGhost}>← All tickets</Link></>} />
      <div className="grid gap-5 xl:grid-cols-[1fr_380px]">
        <div className="space-y-3">
          {msgs.map((m) => (
            <div key={m.id} className={`rounded-lg border p-4 text-sm ${m.author === "team" ? "border-[#ccba56]/60 bg-[#fbf9f1]" : m.author === "note" ? "border-dashed border-amber-400 bg-amber-50" : "border-black/10 bg-white"}`}>
              <p className="mb-2 text-xs text-black/50"><b className="text-black">{m.author === "team" ? "MacroSnaps (reply)" : m.author === "note" ? `Internal note · ${m.author_name}` : m.author_name || t.name}</b> · {fmtDate(m.created_at, true)}</p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </div>
          ))}
          <Card title="Reply & update"><TicketReply id={id} status={t.status} /></Card>
        </div>
        <Card title="Requester">
          <dl className="space-y-2 text-sm">
            <div><dt className="text-black/50">Name</dt><dd>{t.name}</dd></div>
            <div><dt className="text-black/50">Email</dt><dd><a className="underline" href={`mailto:${t.email}`}>{t.email}</a></dd></div>
            {t.phone && <div><dt className="text-black/50">Phone</dt><dd><a className="underline" href={`tel:${t.phone}`}>{t.phone}</a></dd></div>}
            <div><dt className="text-black/50">Who</dt><dd>{WHO[t.source] ?? t.source}</dd></div>
            {t.order_ref && <div><dt className="text-black/50">Order</dt><dd>{booking ? <Link className="underline" href={`/admin/bookings/${booking.id}`}>{t.order_ref}</Link> : t.order_ref}</dd></div>}
            {t.resolved_at && <div><dt className="text-black/50">Resolved</dt><dd>{fmtDate(t.resolved_at, true)}</dd></div>}
            <div><dt className="text-black/50">Their private link</dt><dd><a className="break-all text-xs underline" href={ticketUrl(id)} target="_blank" rel="noopener noreferrer">Open customer view</a></dd></div>
          </dl>
        </Card>
      </div>
    </>
  );
}
