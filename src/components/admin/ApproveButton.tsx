"use client";
import { useActionState } from "react";
import { approveApplicant, type S } from "@/app/admin/(panel)/photographers/actions";
import { noReset } from "./noReset";
import { btnGold } from "./ui";

export default function ApproveButton({ id }: { id: number }) {
  const [s, act, pending] = useActionState<S, FormData>(approveApplicant, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-2">
      <input type="hidden" name="id" value={id} />
      {!s?.ok && <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="contract" defaultChecked className="accent-[#a8963b]" />Also send the contractor agreement for e-signature</label>}
      {!s?.ok && <button disabled={pending} className={`${btnGold} w-full`}>{pending ? "Approving…" : "Approve & send login invite"}</button>}
      {s && <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
    </form>
  );
}
