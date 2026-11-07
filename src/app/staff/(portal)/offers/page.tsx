import { requireStaff } from "@/lib/auth";
import { myOffers } from "@/lib/staffData";
import { PageHead, Badge, Empty, fmtDate, btnGold, btnGhost } from "@/components/admin/ui";
import { answerOffer } from "../actions";

export const metadata = { title: "Available shoots" };

export default async function Offers() {
  const u = await requireStaff();
  const offers = await myOffers(u.id);
  return (
    <>
      <PageHead title="Available shoots" sub="Shoots offered to you. Accept the ones you can do; we'll confirm one photographer per shoot." />
      {offers.length ? (
        <div className="space-y-4">
          {offers.map((o) => (
            <div key={o.offer_id} className="rounded-lg border border-black/10 bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div><h2 className="font-serif text-2xl">{o.title}</h2><p className="mt-1">{o.shoot_date}{o.city ? ` · ${o.city}` : ""}</p>{o.pay && <p className="mt-1">Pay: <b>{o.pay}</b></p>}</div>
                <Badge status={o.mine ? "done" : o.status !== "open" ? "cancelled" : o.response === "accepted" ? "in_progress" : o.response === "declined" ? "cancelled" : "new"}>
                  {o.mine ? "You're confirmed" : o.status === "filled" ? "Filled" : o.status === "cancelled" ? "Cancelled" : o.response === "accepted" ? "Accepted: awaiting confirmation" : o.response === "declined" ? "Declined" : "New"}
                </Badge>
              </div>
              {o.details && <p className="mt-3 whitespace-pre-wrap text-sm text-black/70">{o.details}</p>}
              {o.status === "open" && o.response === "pending" && (
                <form action={answerOffer} className="mt-4 flex gap-2"><input type="hidden" name="offer_id" value={o.offer_id} /><button name="answer" value="yes" className={btnGold}>Accept</button><button name="answer" value="no" className={btnGhost}>Decline</button></form>
              )}
              <p className="mt-3 text-xs text-black/40">Offered {fmtDate(o.created_at, true)}</p>
            </div>
          ))}
        </div>
      ) : <Empty>No shoots offered yet. Keep your profile, area and shoot types up to date so we can match you.</Empty>}
    </>
  );
}
