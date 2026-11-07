import Link from "next/link";
import { requireStaff } from "@/lib/auth";
import { PageHead, Badge, Empty, fmtDate } from "@/components/admin/ui";
import { TicketForm } from "@/components/staff/StaffForms";
import { ticketsFor, signedPath, ticketNo, STATUS_LABEL, CATEGORIES } from "@/lib/tickets";

export const metadata = { title: "Support" };

export default async function Support() {
  const u = await requireStaff();
  const rows = await ticketsFor({ userId: u.id });
  return (
    <>
      <PageHead title="Support" sub="Questions about a shoot, payments or anything else? Open a ticket. You'll get email updates at every step." />
      <div className="grid gap-6 xl:grid-cols-[420px_1fr]">
        <TicketForm categories={CATEGORIES} />
        <div className="space-y-3">
          {rows.length ? rows.map((t) => (
            <Link key={t.id} href={signedPath(t.id)} className="block rounded-lg border border-black/10 bg-white p-4 text-sm hover:border-black/30">
              <div className="flex justify-between gap-2"><b>{t.subject}</b><Badge status={t.status}>{STATUS_LABEL[t.status] ?? t.status}</Badge></div>
              <p className="text-xs text-black/50">{ticketNo(t.id)} · {t.category} · updated {fmtDate(t.updated_at, true)}</p>
              <p className="mt-1 text-xs underline">View conversation & reply →</p>
            </Link>
          )) : <Empty>No requests yet.</Empty>}
        </div>
      </div>
    </>
  );
}
