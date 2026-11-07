"use client";
import { useActionState } from "react";
import { sendNew, type CState } from "@/app/admin/(panel)/contracts/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnGold } from "./ui";

export function SendContractForm({ me, name = "", email = "" }: { me: string; name?: string; email?: string }) {
  const [s, act, pending] = useActionState<CState, FormData>(sendNew, undefined);
  return (
    <form onSubmit={noReset(act)} className="grid gap-3 md:grid-cols-4 md:items-end">
      <div><label className={labelCls} htmlFor="c-name">Photographer&apos;s full name</label><input id="c-name" name="name" defaultValue={name} required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="c-email">Their email</label><input id="c-email" name="email" type="email" defaultValue={email} required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="c-signer">Signing for MacroSnaps as</label><input id="c-signer" name="signer" defaultValue={me} required className={inputCls} /></div>
      <button disabled={pending} className={btnGold}>{pending ? "Sending…" : "Sign & send for e-signature"}</button>
      {s && <p role="status" className={`rounded px-3 py-2 text-sm md:col-span-4 ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok} {s.url && <code className="break-all">{s.url}</code>}</p>}
      <p className="text-xs text-black/50 md:col-span-4">By sending, you sign the agreement on behalf of MacroHype LLC (d/b/a MacroSnaps). They get a secure link; once they sign, you both receive the signed PDF.</p>
    </form>
  );
}
