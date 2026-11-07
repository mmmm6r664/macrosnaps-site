import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTicket, messagesFor, verifyTicketKey, ticketNo, STATUS_LABEL } from "@/lib/tickets";
import { CustomerReplyForm } from "@/components/support/TicketForms";

export const metadata: Metadata = { title: "Your support request", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const when = (d: Date) => new Date(d).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" });

export default async function TicketPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string; new?: string; sent?: string }> }) {
  const id = Number((await params).id) || 0;
  const sp = await searchParams;
  const k = String(sp.k ?? "");
  if (!verifyTicketKey(id, k)) notFound();
  const t = await getTicket(id);
  if (!t) notFound();
  const msgs = await messagesFor(id);
  const done = t.status === "resolved" || t.status === "closed";
  return (
    <section className="marble px-4 py-12 md:px-6">
      <div className="mx-auto max-w-3xl">
        {sp.new && <p role="status" className="mb-6 border border-gold bg-white p-4">Thanks! Your request <b>{ticketNo(id)}</b> was received. We&apos;ve emailed you a confirmation with a link back to this page.</p>}
        {sp.sent && <p role="status" className="mb-6 border border-gold bg-white p-4">Your reply was sent. We&apos;ll get back to you by email.</p>}
        <p className="eyebrow">Support request {ticketNo(id)}</p>
        <h1 className="mt-1 font-serif text-3xl md:text-4xl">{t.subject}</h1>
        <p className="mt-2 text-sm text-muted">{t.category}{t.order_ref ? ` · Order ${t.order_ref}` : ""} · Opened {when(t.created_at)} · <span className={`font-semibold ${done ? "text-emerald-700" : "text-black"}`}>{STATUS_LABEL[t.status] ?? t.status}</span></p>
        <ol className="mt-8 space-y-4">
          {msgs.map((m) => (
            <li key={m.id} className={`border p-5 ${m.author === "team" ? "border-gold/60 bg-[#fbf9f1]" : "border-black/10 bg-white"}`}>
              <p className="mb-2 text-xs uppercase tracking-wider text-muted"><b className="text-black">{m.author === "team" ? "MacroSnaps" : m.author_name || "You"}</b> · {when(m.created_at)}</p>
              <p className="whitespace-pre-wrap">{m.body}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          {t.status === "closed"
            ? <p className="text-muted">This request is closed. Need more help? <Link className="underline" href="/support">Open a new request</Link>.</p>
            : <>{done && <p className="mb-3 text-sm text-muted">This request is resolved. Replying will reopen it.</p>}<CustomerReplyForm id={id} k={k} /></>}
        </div>
      </div>
    </section>
  );
}
