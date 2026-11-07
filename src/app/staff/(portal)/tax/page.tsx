import { requireStaff } from "@/lib/auth";
import { getProfile } from "@/lib/staffData";
import { PageHead } from "@/components/admin/ui";
import { W9Form } from "@/components/staff/StaffForms";

export const metadata = { title: "Tax info (W-9)" };

export default async function Tax() {
  const u = await requireStaff();
  const p = await getProfile(u.id);
  return (
    <>
      <PageHead title="Tax info (W-9)" sub="As an independent contractor, we need a W-9 on file to pay you and to send your 1099-NEC at year end." />
      <W9Form d={{ legal: p?.tax_legal_name ?? u.name, business: p?.tax_business_name ?? "", cls: p?.tax_classification ?? "", address: p?.tax_address ?? "", tinType: p?.tin_type ?? "ssn" }}
        onFile={p?.w9_signed_at ? `${p.tin_type?.toUpperCase()} ending ${p.tin_last4}, signed ${new Date(p.w9_signed_at).toLocaleDateString("en-US")}` : null} />
    </>
  );
}
