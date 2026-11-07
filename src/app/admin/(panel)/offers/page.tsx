import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Table, Badge, Empty, fmtDate, btnGold } from "@/components/admin/ui";

export const metadata = { title: "Shoot offers" };

export default async function Offers() {
  await requireUser();
  const rows = await q<{ id: number; title: string; city: string | null; shoot_date: string; status: string; created_at: Date; sent: number; accepted: number; assigned: string | null }[]>`
    select o.id, o.title, o.city, o.shoot_date, o.status, o.created_at,
      (select count(*)::int from offer_recipients r where r.offer_id = o.id) as sent,
      (select count(*)::int from offer_recipients r where r.offer_id = o.id and r.response = 'accepted') as accepted,
      (select name from users u where u.id = o.assigned_user_id) as assigned
    from offers o order by o.created_at desc limit 200`;
  return (
    <>
      <PageHead title="Shoot offers" sub="Shoots you've offered to photographers and videographers, and who accepted." actions={<Link href="/admin/photographers" className={btnGold}>New offer</Link>} />
      {rows.length ? (
        <Table head={["Shoot", "When / where", "Sent to", "Accepted", "Status", "Created"]}>
          {rows.map((o) => (
            <tr key={o.id}>
              <td className="px-4 py-3"><Link href={`/admin/offers/${o.id}`} className="font-semibold hover:underline">{o.title}</Link></td>
              <td className="px-4 py-3">{o.shoot_date}<div className="text-xs text-black/50">{o.city}</div></td>
              <td className="px-4 py-3">{o.sent}</td>
              <td className="px-4 py-3">{o.accepted ? <b className="text-emerald-700">{o.accepted}</b> : 0}</td>
              <td className="px-4 py-3"><Badge status={o.status === "open" ? "open" : o.status === "filled" ? "done" : "cancelled"}>{o.status === "filled" ? `Filled${o.assigned ? `: ${o.assigned}` : ""}` : o.status}</Badge></td>
              <td className="px-4 py-3 text-black/60">{fmtDate(o.created_at)}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No offers yet. Go to Photographers, filter by area and shoot type, select people and choose “Offer a shoot”.</Empty>}
    </>
  );
}
