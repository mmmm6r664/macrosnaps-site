import { requireUser } from "@/lib/auth";
import { listContracts } from "@/lib/esign";
import { PageHead, Card } from "@/components/admin/ui";
import { SendContractForm } from "@/components/admin/ContractForms";
import { resend, voidContract } from "./actions";

export const metadata = { title: "Contracts" };
const fmt = (d: Date | string | null) => (d ? new Date(d).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", year: "numeric", hour: "numeric", minute: "2-digit" }) : "—");
const BADGE: Record<string, string> = { sent: "bg-amber-50 text-amber-800", viewed: "bg-sky-50 text-sky-800", signed: "bg-emerald-50 text-emerald-800", voided: "bg-black/5 text-black/50" };

export default async function Contracts({ searchParams }: { searchParams: Promise<{ name?: string; email?: string }> }) {
  const u = await requireUser();
  const sp = await searchParams;
  const rows = await listContracts();
  return (
    <>
      <PageHead title="Contracts" sub="Send the Contractor Photographer & Videographer Agreement for e-signature and keep every signed copy." />
      <Card title="Send a contract" className="mb-5"><SendContractForm me={u.name} name={sp.name?.slice(0, 100)} email={sp.email?.slice(0, 200)} /></Card>
      <Card title={`All contracts (${rows.length})`}>
        {rows.length === 0 ? <p className="text-sm text-black/50">No contracts yet.</p> : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead><tr className="border-b border-black/10 text-left text-xs uppercase tracking-wider text-black/50"><th className="py-2">Doc</th><th>Photographer</th><th>Status</th><th>Sent</th><th>Viewed</th><th>Signed</th><th></th></tr></thead>
              <tbody>
                {rows.map((c) => (
                  <tr key={c.id} className="border-b border-black/5 align-top">
                    <td className="py-3 font-mono text-xs">MS-C{c.id}<br /><span className="text-black/40">v{c.doc_version}</span></td>
                    <td className="py-3">{c.signer_name}<br /><span className="text-black/50">{c.signer_email}</span></td>
                    <td className="py-3"><span className={`rounded px-2 py-1 text-xs font-semibold ${BADGE[c.status] ?? ""}`}>{c.status}</span></td>
                    <td className="py-3">{fmt(c.sent_at)}<br /><span className="text-xs text-black/40">by {c.company_signer}</span></td>
                    <td className="py-3">{fmt(c.viewed_at)}</td>
                    <td className="py-3">{fmt(c.signed_at)}{c.signed_ip && <><br /><span className="text-xs text-black/40">IP {c.signed_ip}</span></>}</td>
                    <td className="py-3 text-right">
                      <div className="flex flex-col items-end gap-1">
                        {c.has_pdf && <a href={`/api/admin/contracts/${c.id}/pdf`} className="rounded bg-[#ccba56] px-3 py-1 text-xs font-semibold text-black">Signed PDF</a>}
                        {(c.status === "sent" || c.status === "viewed") && (
                          <>
                            <form action={resend}><input type="hidden" name="id" value={c.id} /><button className="text-xs underline">Resend new link</button></form>
                            <form action={voidContract}><input type="hidden" name="id" value={c.id} /><button className="text-xs text-red-700 underline">Void</button></form>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </>
  );
}
