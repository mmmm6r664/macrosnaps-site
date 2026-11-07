import { requireStaff } from "@/lib/auth";
import { getProfile } from "@/lib/staffData";
import { q } from "@/lib/db";
import { CONTRACT, CONTRACT_VERSION, CONTRACT_TITLE, CONTRACT_INTRO } from "@/data/contractorAgreement";
import { PageHead, Notice } from "@/components/admin/ui";
import { startSigning } from "./actions";

export const metadata = { title: "Contract" };

export default async function Contract() {
  const u = await requireStaff();
  const p = await getProfile(u.id);
  const signed = p?.contract_version === CONTRACT_VERSION;
  const hasPdf = (await q<{ n: number }[]>`select count(*)::int as n from contracts where status = 'signed' and pdf is not null and (user_id = ${u.id} or lower(signer_email) = ${u.email.toLowerCase()})`)[0].n > 0;
  return (
    <>
      <PageHead title={CONTRACT_TITLE} sub={`Version ${CONTRACT_VERSION}`} />
      {signed ? (
        <Notice tone="green">Signed by {p?.contract_signature} on {p?.contract_signed_at ? new Date(p.contract_signed_at).toLocaleString("en-US") : ""}. {hasPdf && <form method="get" action="/staff/contract/pdf" className="mt-2"><button className="font-semibold underline">Download your signed copy (PDF)</button></form>}</Notice>
      ) : (
        <Notice>Please review and sign the agreement below before accepting shoots. You and MacroSnaps will both receive the signed PDF by email.</Notice>
      )}
      <ol className="mb-6 space-y-4 rounded-lg border border-black/10 bg-white p-6 text-sm leading-relaxed">
        <li className="list-none text-black/80">{CONTRACT_INTRO}</li>
        {CONTRACT.map((c, i) => <li key={c.title} className="list-none"><p className="text-black/75"><b className="text-black">{i + 1}. {c.title}:</b> {c.body}</p></li>)}
      </ol>
      {!signed && <form action={startSigning}><button className="rounded bg-[#ccba56] px-6 py-3 text-sm font-bold uppercase tracking-widest text-black">Review &amp; sign electronically</button></form>}
    </>
  );
}
