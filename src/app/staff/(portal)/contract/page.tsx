import { requireStaff } from "@/lib/auth";
import { getProfile } from "@/lib/staffData";
import { CONTRACT, CONTRACT_VERSION } from "@/data/contractorAgreement";
import { PageHead, Notice } from "@/components/admin/ui";
import { ContractForm } from "@/components/staff/StaffForms";

export const metadata = { title: "Contract" };

export default async function Contract() {
  const u = await requireStaff();
  const p = await getProfile(u.id);
  const signed = p?.contract_version === CONTRACT_VERSION;
  return (
    <>
      <PageHead title="Independent Contractor Agreement" sub={`Version ${CONTRACT_VERSION}`} />
      {signed && <Notice tone="green">Signed by {p?.contract_signature} on {p?.contract_signed_at ? new Date(p.contract_signed_at).toLocaleString("en-US") : ""}.</Notice>}
      <ol className="mb-6 space-y-4 rounded-lg border border-black/10 bg-white p-6 text-sm leading-relaxed">
        {CONTRACT.map((c, i) => <li key={c.title}><h2 className="font-semibold">{i + 1}. {c.title}</h2><p className="mt-1 text-black/75">{c.body}</p></li>)}
      </ol>
      {!signed && <ContractForm />}
    </>
  );
}
