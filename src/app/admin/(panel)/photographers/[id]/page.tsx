import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { PageHead, Card, Table, Badge, Empty, fmtDate, money } from "@/components/admin/ui";

type Profile = {
  id: number; name: string; email: string; alt_emails: string[]; active: boolean; created_at: Date;
  phone: string | null; city: string | null; radius_miles: number | null; roles: string[] | null; shoot_types: string[] | null;
  gear: string | null; bio: string | null; portfolio: string | null; tshirt_size: string | null; has_car: boolean | null;
  address: string | null; travel: string | null; headshot_url: string | null; payout_method: string | null; payout_handle: string | null;
  contract_version: string | null; contract_signed_at: Date | null; w9_signed_at: Date | null;
};

export default async function PhotographerPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();
  const sql = await db();
  const [p] = await sql<Profile[]>`select u.id, u.name, u.email, u.alt_emails, u.active, u.created_at, s.phone, s.city, s.radius_miles, s.roles, s.shoot_types, s.gear, s.bio, s.portfolio,
      s.tshirt_size, s.has_car, s.address, s.travel, s.headshot_url, s.payout_method, s.payout_handle, s.contract_version, s.contract_signed_at, s.w9_signed_at
    from users u left join staff_profiles s on s.user_id = u.id where u.id = ${id} and u.role = 'staff'`;
  if (!p) notFound();
  const emails = [p.email.toLowerCase(), ...(p.alt_emails ?? [])];
  const [contracts, payouts] = await Promise.all([
    sql<{ id: number; doc_title: string; status: string; signed_at: Date | null; sent_at: Date; has_pdf: boolean }[]>`select id, doc_title, status, signed_at, sent_at, (pdf is not null) as has_pdf from contracts where user_id = ${id} or lower(signer_email) = any(${emails}) order by coalesce(signed_at, sent_at) desc`,
    sql<{ id: number; amount_cents: number; paid_on: string; method: string | null; note: string }[]>`select id, amount_cents, paid_on::text, method, note from payouts where user_id = ${id} order by paid_on desc, id desc`,
  ]);
  const total = payouts.reduce((s, x) => s + x.amount_cents, 0);
  const Row = ({ k, v }: { k: string; v: React.ReactNode }) => <div className="flex gap-3 py-1.5 text-sm"><dt className="w-32 shrink-0 text-black/55">{k}</dt><dd className="min-w-0 whitespace-pre-wrap break-words">{v || "—"}</dd></div>;
  return (
    <div className="space-y-6">
      <PageHead title={p.name} sub={`${(p.roles ?? []).join(", ") || "Team member"}${p.city ? ` · ${p.city}` : ""}`} actions={<Link href="/admin/photographers" className="text-sm underline">← Team</Link>} />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="Profile">
          <dl>
            <Row k="Email" v={<a className="underline" href={`mailto:${p.email}`}>{p.email}</a>} />
            {p.alt_emails?.length > 0 && <Row k="Other emails" v={p.alt_emails.join(", ")} />}
            <Row k="Phone" v={p.phone && <a className="underline" href={`tel:${p.phone}`}>{p.phone}</a>} />
            <Row k="City" v={p.city} />
            <Row k="Address" v={p.address} />
            <Row k="Travels" v={p.travel || (p.radius_miles ? `${p.radius_miles} mi` : null)} />
            <Row k="Own car + license" v={p.has_car == null ? null : p.has_car ? "Yes" : "No"} />
            <Row k="T-shirt size" v={p.tshirt_size} />
            <Row k="Shoot types" v={(p.shoot_types ?? []).join(", ")} />
            <Row k="Portfolio" v={p.portfolio && (/^https?:/.test(p.portfolio) ? <a className="underline" href={p.portfolio} target="_blank" rel="noopener noreferrer">{p.portfolio}</a> : p.portfolio)} />
            <Row k="Headshot" v={p.headshot_url && <a className="underline" href={p.headshot_url} target="_blank" rel="noopener noreferrer">View</a>} />
            <Row k="Payout" v={[p.payout_method, p.payout_handle].filter(Boolean).join(" · ")} />
            <Row k="Agreement" v={p.contract_signed_at ? `Signed ${fmtDate(p.contract_signed_at)}` : <Badge status="new">Not signed</Badge>} />
            <Row k="W-9" v={p.w9_signed_at ? `Signed ${fmtDate(p.w9_signed_at)}` : null} />
          </dl>
        </Card>
        <Card title="Kit / equipment"><p className="whitespace-pre-wrap text-sm">{p.gear || "—"}</p>{p.bio && <><h3 className="mt-4 text-xs font-semibold uppercase tracking-wider text-black/55">Bio</h3><p className="mt-1 whitespace-pre-wrap text-sm">{p.bio}</p></>}</Card>
      </div>
      <Card title={`Contracts (${contracts.length})`}>
        {contracts.length ? (
          <Table head={["Agreement", "Status", "Signed", "PDF"]}>
            {contracts.map((c) => (
              <tr key={c.id}>
                <td className="px-3 py-2">{c.doc_title}</td>
                <td className="px-3 py-2"><Badge status={c.status === "signed" ? "done" : "new"}>{c.status}</Badge></td>
                <td className="px-3 py-2">{fmtDate(c.signed_at)}</td>
                <td className="px-3 py-2">{c.has_pdf ? <form method="get" action={`/api/admin/contracts/${c.id}/pdf`}><button className="underline">Download</button></form> : "—"}</td>
              </tr>
            ))}
          </Table>
        ) : <Empty>No contracts on file.</Empty>}
      </Card>
      <Card title={`Payouts (${payouts.length}) · ${money(total)}`}>
        {payouts.length ? (
          <Table head={["Date", "Amount", "Method", "Note"]}>
            {payouts.map((x) => (
              <tr key={x.id}><td className="px-3 py-2">{x.paid_on}</td><td className="px-3 py-2">{money(x.amount_cents)}</td><td className="px-3 py-2">{x.method ?? "—"}</td><td className="px-3 py-2">{x.note || "—"}</td></tr>
            ))}
          </Table>
        ) : <Empty>No payouts recorded.</Empty>}
      </Card>
    </div>
  );
}
