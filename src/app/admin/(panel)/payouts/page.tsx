import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { canEncrypt } from "@/lib/crypto";
import { PageHead, Card, Table, Empty, Notice, money, fmtDate, btnGhost } from "@/components/admin/ui";
import { AddPayoutForm, RevealTin } from "@/components/admin/PayoutForms";
import { deletePayout } from "./actions";

export const metadata = { title: "Payouts & 1099s" };
const THRESHOLD = 200000; // $2,000: 1099-NEC reporting threshold for payments made in 2026 and later

export default async function Payouts({ searchParams }: { searchParams: Promise<{ year?: string }> }) {
  const u = await requireUser();
  const year = Number((await searchParams).year) || new Date().getFullYear();
  const staff = await q<{ id: number; name: string; payout_method: string | null; payout_handle: string | null }[]>`
    select u.id, u.name, p.payout_method, p.payout_handle from users u left join staff_profiles p on p.user_id = u.id where u.role = 'staff' order by u.name`;
  const recent = await q<{ id: number; name: string; amount_cents: number; paid_on: string; method: string | null; note: string; booking_id: number | null; emailed: boolean }[]>`
    select p.id, coalesce(u.name, p.payee_name, '') as name, p.amount_cents, p.paid_on::text as paid_on, p.method, p.note, p.booking_id, (p.emailed_at is not null) as emailed from payouts p left join users u on u.id = p.user_id
    where extract(year from p.paid_on) = ${year} order by p.paid_on desc, p.id desc limit 200`;
  const totals = await q<{ user_id: string; name: string; email: string; total: number; tax_legal_name: string | null; tax_business_name: string | null; tax_address: string | null; tin_type: string | null; tin_last4: string | null; w9_signed_at: Date | null }[]>`
    select coalesce(u.id::text, 'e:' || lower(p.payee_email)) as user_id, max(coalesce(u.name, p.payee_name, '')) as name, max(coalesce(u.email, p.payee_email, '')) as email, sum(p.amount_cents)::int as total,
      max(s.tax_legal_name) as tax_legal_name, max(s.tax_business_name) as tax_business_name, max(s.tax_address) as tax_address, max(s.tin_type) as tin_type, max(s.tin_last4) as tin_last4, max(s.w9_signed_at) as w9_signed_at
    from payouts p left join users u on u.id = p.user_id left join staff_profiles s on s.user_id = u.id
    where extract(year from p.paid_on) = ${year} group by 1 order by total desc`;
  const over = totals.filter((t) => t.total >= THRESHOLD);
  return (
    <>
      <PageHead title="Payouts & 1099s" sub="Record what you pay each photographer and videographer. Their totals show in their staff portal."
        actions={<>{[year - 1, year, year + 1].filter((y) => y <= new Date().getFullYear()).map((y) => <Link key={y} href={`/admin/payouts?year=${y}`} className={`${btnGhost} ${y === year ? "!border-black" : ""}`}>{y}</Link>)}</>} />
      {!canEncrypt() && <Notice>TAX_ENCRYPTION_KEY isn&apos;t set, so staff can&apos;t save their SSN/EIN yet. Add it in Vercel to switch on the W-9 form.</Notice>}
      <Card title="Record a payment" className="mb-6"><AddPayoutForm staff={staff.map((s) => ({ id: s.id, name: s.name, payout: [s.payout_method, s.payout_handle].filter(Boolean).join(" ") }))} /></Card>

      <h2 className="mb-2 font-serif text-2xl">1099-NEC report for {year}</h2>
      <p className="mb-4 text-sm text-black/60">Everyone paid {money(THRESHOLD)} or more in {year}. File a 1099-NEC for each by January 31 (check thresholds and deadlines with your accountant). Full SSN/EIN can be revealed by the owner only, and each reveal is logged.</p>
      {over.length ? (
        <Table head={["Name", "Paid in " + year, "W-9 legal name / business", "Address", "Tax ID", "W-9 signed"]}>
          {over.map((t) => (
            <tr key={t.user_id}>
              <td className="px-4 py-3 font-semibold">{t.name}<div className="text-xs font-normal text-black/50">{t.email}</div></td>
              <td className="px-4 py-3 font-semibold">{money(t.total)}</td>
              <td className="px-4 py-3">{t.tax_legal_name ?? <span className="text-red-700">Missing W-9</span>}{t.tax_business_name && <div className="text-xs">{t.tax_business_name}</div>}</td>
              <td className="max-w-[220px] whitespace-pre-wrap px-4 py-3 text-xs">{t.tax_address ?? "—"}</td>
              <td className="px-4 py-3">{t.tin_last4 ? <>{t.tin_type?.toUpperCase()} •••{t.tin_last4} {u.role === "owner" && !t.user_id.startsWith("e:") && <RevealTin userId={Number(t.user_id)} />}</> : "—"}</td>
              <td className="px-4 py-3">{fmtDate(t.w9_signed_at)}</td>
            </tr>
          ))}
        </Table>
      ) : <Empty>Nobody has been paid {money(THRESHOLD)} or more in {year} yet.</Empty>}

      <h2 className="mb-2 mt-8 font-serif text-2xl">Totals by person, {year}</h2>
      {totals.length ? <Table head={["Name", "Total"]}>{totals.map((t) => <tr key={t.user_id}><td className="px-4 py-3">{t.name}</td><td className="px-4 py-3">{money(t.total)}</td></tr>)}</Table> : <Empty>No payments recorded in {year}.</Empty>}

      <h2 className="mb-2 mt-8 font-serif text-2xl">Payments, {year}</h2>
      {recent.length ? (
        <Table head={["Date", "Paid to", "Amount", "Method", "Note", ""]}>
          {recent.map((p) => (
            <tr key={p.id}>
              <td className="px-4 py-3">{fmtDate(p.paid_on)}</td><td className="px-4 py-3">{p.name}</td><td className="px-4 py-3">{money(p.amount_cents)}</td><td className="px-4 py-3">{p.method}</td>
              <td className="px-4 py-3">{p.note}{p.emailed && <span className="text-black/50"> · emailed</span>}{p.booking_id && <> · <Link className="underline" href={`/admin/bookings/${p.booking_id}`}>booking</Link></>}</td>
              <td className="px-4 py-3 text-right"><form action={deletePayout}><input type="hidden" name="id" value={p.id} /><button className="text-xs text-red-700 underline">Delete</button></form></td>
            </tr>
          ))}
        </Table>
      ) : <Empty>No payments recorded in {year}.</Empty>}
    </>
  );
}
