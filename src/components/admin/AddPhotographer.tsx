"use client";
import { useActionState } from "react";
import { addPhotographer, type S } from "@/app/admin/(panel)/photographers/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnGold } from "./ui";

/** Onboard someone hired outside the careers form. */
export default function AddPhotographer() {
  const [s, act, pending] = useActionState<S, FormData>(addPhotographer, undefined);
  return (
    <details className="mb-4 rounded-lg border border-black/10 bg-white p-4" open={!!s}>
      <summary className="cursor-pointer text-sm font-semibold">+ Add a photographer or videographer you&apos;ve hired</summary>
      <form onSubmit={noReset(act)} className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <div><label className={labelCls} htmlFor="ap-n">Full name</label><input id="ap-n" name="name" required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="ap-e">Email</label><input id="ap-e" name="email" type="email" required className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="ap-p">Phone</label><input id="ap-p" name="phone" type="tel" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="ap-c">City (optional)</label><input id="ap-c" name="city" placeholder="e.g. Austin, TX" className={inputCls} /></div>
        <div><label className={labelCls} htmlFor="ap-r">Role</label><select id="ap-r" name="role" className={inputCls}><option>Photographer</option><option>Videographer</option><option value="Both">Photographer & videographer</option></select></div>
        <label className="flex items-center gap-2 text-sm sm:col-span-2 xl:col-span-3"><input type="checkbox" name="contract" defaultChecked className="accent-[#a8963b]" />Include the contractor agreement for e-signature</label>
        <button disabled={pending} className={`${btnGold} sm:col-span-2`}>{pending ? "Adding…" : "Add & send welcome email"}</button>
        {s && <p role="status" className={`rounded px-3 py-2 text-sm sm:col-span-2 xl:col-span-5 ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
      </form>
    </details>
  );
}
