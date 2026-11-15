import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Card, Table, Badge, Empty, fmtDate, money, btnGhost } from "@/components/admin/ui";

type Client = { id: number; email: string | null; first_name: string; last_name: string; phone: string | null; company: string | null; address: string | null; source: string | null; labels: string[] | null; notes: string | null; created_at: Date; last_activity_at: Date | null; last_login_at: Date | null };
type Order = { company: string | null; event: string | null; location: string | null; event_date: string | null; notes: string | null; id: number; number: string | null; created_at: Date; payment_status: string | null; fulfillment_status: string | null; total_cents: number; paid_cents: number; balance_cents: number; items: { name: string; qty: number }[]; channel: string | null };

export default async function ClientPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const sql = await db();
  const [c] = await sql<Client[]>`select * from clients where id = ${id}`;
  if (!c) notFound();
  const e = c.email ?? "";
  const [orders, bookings, inbox] = await Promise.all([
    sql<Order[]>`select id, number, company, event, location, event_date, notes, created_at, payment_status, fulfillment_status, total_cents, paid_cents, balance_cents, items, channel from orders where client_id = ${id} order by created_at desc`,
    e ? sql<{ id: number; ref: string; service_name: string; city: string; status: string; total_cents: number; first_date: string | null; created_at: Date }[]>`select id, ref, service_name, city, status, total_cents, first_date::text, created_at from bookings where lower(email) = ${e} order by created_at desc` : Promise.resolve([]),
    e ? sql<{ id: number; status: string; subject: string | null; created_at: Date }[]>`select id, status, data->>'subject' as subject, created_at from inquiries where lower(email) = ${e} order by id desc` : Promise.resolve([]),
  ]);
  const name = `${c.first_name} ${c.last_name}`.trim() || c.company || c.email || "Client";
  const paid = orders.reduce((s, o) => s + o.paid_cents, 0);
  const owed = orders.reduce((s, o) => s + Math.max(0, o.balance_cents), 0);
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="flex gap-3 py-1.5 text-sm"><dt className="w-28 shrink-0 text-black/55">{k}</dt><dd className="min-w-0 break-words">{v || "—"}</dd></div>;
  return (
    <>
      <PageHead title={name} sub={`${orders.length} past order${orders.length === 1 ? "" : "s"} · ${money(paid)} paid${owed ? ` · ${money(owed)} unpaid` : ""}`} actions={<Link href="/admin/clients" className={btnGhost}>← All clients</Link>} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] [&>*]:min-w-0">
        <Card title="Contact">
          <dl>
            <Row k="Email" v={c.email && <a className="underline" href={`mailto:${c.email}`}>{c.email}</a>} />
            <Row k="Phone" v={c.phone && <a className="underline" href={`tel:${c.phone.replace(/[^\d+]/g, "")}`}>{c.phone}</a>} />
            <Row k="Company" v={c.company} />
            <Row k="Address" v={c.address} />
            <Row k="Labels" v={c.labels?.length ? c.labels.join(", ") : null} />
            <Row k="Source" v={c.source ?? "Client portal"} />
            <Row k="Since" v={fmtDate(c.created_at)} />
            <Row k="Last active" v={fmtDate(c.last_activity_at)} />
            <Row k="Portal login" v={c.last_login_at ? fmtDate(c.last_login_at) : "Never"} />
          </dl>
          {c.notes ? <p className="mt-3 whitespace-pre-wrap text-sm text-black/70">{c.notes}</p> : null}
        </Card>
        <div className="space-y-6">
          <Card title="Past orders">
            {orders.length ? (
              <Table head={["Order", "Date", "Event / details", "Total", "Payment", ""]}>
                {orders.map((o) => (
                  <tr key={o.id}>
                    <td className="px-4 py-3">#{o.number ?? o.id}</td>
                    <td className="whitespace-nowrap px-4 py-3">{fmtDate(o.created_at)}</td>
                    <td className="px-4 py-3">
                      {o.event ? <div className="font-medium">{o.event}</div> : null}
                      <div className={o.event ? "text-xs text-black/60" : ""}>{o.items.map((i) => `${i.name}${i.qty > 1 ? ` × ${i.qty}` : ""}`).join(", ") || "—"}</div>
                      {o.location || o.event_date ? <div className="text-xs text-black/50">{[o.location, o.event_date].filter(Boolean).join(" · ")}</div> : null}
                      {o.notes ? <div className="mt-1 text-xs italic text-black/50">{o.notes}</div> : null}
                    </td>
                    <td className="px-4 py-3">{money(o.total_cents)}</td>
                    <td className="px-4 py-3"><Badge status={(o.payment_status ?? "").toLowerCase()} /></td>
                    <td className="px-4 py-3 text-xs text-black/50">{o.channel === "WIX_INVOICES" ? "Invoice" : ""}</td>
                  </tr>
                ))}
              </Table>
            ) : <Empty>No past orders.</Empty>}
          </Card>
          <Card title="Bookings">
            {bookings.length ? (
              <Table head={["Ref", "Service", "Date", "Total", "Status"]}>
                {bookings.map((b) => (
                  <tr key={b.ref}>
                    <td className="px-4 py-3"><Link className="underline" href={`/admin/bookings/${b.id}`}>{b.ref}</Link></td>
                    <td className="px-4 py-3">{b.service_name}{b.city ? ` · ${b.city}` : ""}</td>
                    <td className="whitespace-nowrap px-4 py-3">{fmtDate(b.first_date)}</td>
                    <td className="px-4 py-3">{money(b.total_cents)}</td>
                    <td className="px-4 py-3"><Badge status={b.status} /></td>
                  </tr>
                ))}
              </Table>
            ) : <Empty>No bookings on the new site.</Empty>}
          </Card>
          <Card title="Messages">
            {inbox.length ? (
              <Table head={["Subject", "Received", "Status"]}>
                {inbox.map((m) => (
                  <tr key={m.id}>
                    <td className="px-4 py-3"><Link className="underline" href={`/admin/inbox/${m.id}`}>{m.subject || "Message"}</Link></td>
                    <td className="whitespace-nowrap px-4 py-3">{fmtDate(m.created_at)}</td>
                    <td className="px-4 py-3"><Badge status={m.status} /></td>
                  </tr>
                ))}
              </Table>
            ) : <Empty>No messages.</Empty>}
          </Card>
        </div>
      </div>
    </>
  );
}
