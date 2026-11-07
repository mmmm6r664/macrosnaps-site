"use client";
import { noReset } from "./noReset";
import { useActionState } from "react";
import { addMember, changePassword, type S } from "@/app/admin/(panel)/team/actions";
import { inputCls, labelCls, btnPrimary } from "./ui";

const Msg = ({ s }: { s: S }) => (s ? <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p> : null);

export function AddMemberForm({ owner }: { owner: boolean }) {
  const [s, act, pending] = useActionState(addMember, undefined);
  return (
    <form onSubmit={noReset(act)} className="grid gap-3 sm:grid-cols-2">
      <div><label className={labelCls} htmlFor="m-name">Name</label><input id="m-name" name="name" required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="m-email">Email</label><input id="m-email" name="email" type="email" required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="m-role">Role</label>
        <select id="m-role" name="role" className={inputCls}><option value="staff">Staff (photographer / videographer: sees only assigned shoots)</option>{owner && <option value="admin">Admin (sees and manages everything)</option>}</select></div>
      <div><label className={labelCls} htmlFor="m-pw">Temporary password</label><input id="m-pw" name="password" required minLength={10} autoComplete="new-password" className={inputCls} /></div>
      <div className="sm:col-span-2"><Msg s={s} /></div>
      <div><button disabled={pending} className={btnPrimary}>{pending ? "Adding…" : "Add team member"}</button></div>
    </form>
  );
}

export function PasswordForm() {
  const [s, act, pending] = useActionState(changePassword, undefined);
  return (
    <form onSubmit={noReset(act)} className="max-w-sm space-y-3">
      <div><label className={labelCls} htmlFor="cur">Current password</label><input id="cur" name="current" type="password" autoComplete="current-password" required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="nxt">New password</label><input id="nxt" name="next" type="password" autoComplete="new-password" minLength={10} required className={inputCls} /></div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Saving…" : "Change password"}</button>
    </form>
  );
}
