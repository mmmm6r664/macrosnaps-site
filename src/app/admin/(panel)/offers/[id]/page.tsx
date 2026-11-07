import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { PageHead, Card, Table, Badge, fmtDate, btnPrimary } from "@/components/admin/ui";
import { confirmRecipient, cancelOffer } from "../actions";

export const metadata = { title: "Shoot offer" };

export default async function OfferPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const id = Number((await params).id) || 0;
  const [o] = await q<{ id: number; title: string; city: string | null; shoot_date: string; details: string; pay: string | null; status: string; booking_id: number | null; created_at: Date }[]>`select * from offers where id = ${id}`;
  if (!o) notFound();
  const rs = await q<{ id: number; name: string; email: string | null; phone: string | null; user_id: number | null; response: string; responded_at: Date | null }[]>`
    select id, name, email, phone, user_id, response, responded_at from offer_recipients where offer_id = ${id} order by response = 'accepted' desc, responded_at nulls last, name`;
  return (
    <>
      <PageHead title={o.title} sub={`${o.shoot_date}${o.city ? ` · ${o.city}` : ""}${o.pay ? ` · Pay: ${o.pay}` : ""}`}
        actions={<><Badge status={o.status === "open" ? "open" : o.status === "filled" ? "done" : "cancelled"}>{o.status}</Badge>{o.status === "open" && <form action={cancelOffer}><input type="hidden" name="id" value={o.id} /><button className="text-sm text-red-700 underline">Cancel offer</button></form>}</>} />
      {o.booking_id && <p className="mb-4 text-sm">For <Link className="underline" href={`/admin/bookings/${o.booking_id}`}>booking #{o.booking_id}</Link></p>}
      {o.details && <Card className="mb-5"><p className="whitespace-pre-wrap text-sm">{o.details}</p></Card>}
      <Table head={["Person", "Contact", "Response", ""]}>
        {rs.map((r) => (
          <tr key={r.id}>
            <td className="px-4 py-3 font-semibold">{r.name}<div className="text-xs font-normal text-black/50">{r.user_id ? "Team" : "Applicant"}</div></td>
            <td className="px-4 py-3">{r.email}{r.phone && <div>{r.phone}</div>}</td>
            <td className="px-4 py-3"><Badge status={r.response === "accepted" ? "done" : r.response === "declined" ? "cancelled" : "new"}>{r.response}</Badge>{r.responded_at && <div className="text-xs text-black/50">{fmtDate(r.responded_at, true)}</div>}</td>
            <td className="px-4 py-3 text-right">{o.status === "open" && r.response === "accepted" && <form action={confirmRecipient}><input type="hidden" name="rid" value={r.id} /><button className={btnPrimary}>Confirm {r.name.split(" ")[0]}</button></form>}</td>
          </tr>
        ))}
      </Table>
      <p className="mt-3 text-xs text-black/50">Confirming adds a team member to the booking&apos;s crew (applicants need to be approved first to get a staff login) and tells everyone else who accepted that it&apos;s filled.</p>
    </>
  );
}
