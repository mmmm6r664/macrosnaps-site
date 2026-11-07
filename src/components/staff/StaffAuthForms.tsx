"use client";
import Link from "next/link";
import { useActionState } from "react";
import { staffLogin, forgotPassword, setPassword, type FS } from "@/app/staff/auth-actions";
import { noReset } from "@/components/admin/noReset";
import { inputCls, labelCls, btnPrimary } from "@/components/admin/ui";

const Msg = ({ s }: { s: FS }) => (s ? <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p> : null);

export function StaffLoginForm() {
  const [s, act, pending] = useActionState<FS, FormData>(staffLogin, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4">
      <Msg s={s} />
      <div><label className={labelCls} htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} /></div>
      <button disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Signing in…" : "Sign in"}</button>
      <p className="text-center text-sm"><Link href="/staff/forgot" className="underline">Forgot your password?</Link></p>
    </form>
  );
}

export function ForgotForm() {
  const [s, act, pending] = useActionState<FS, FormData>(forgotPassword, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4">
      <Msg s={s} />
      <div><label className={labelCls} htmlFor="email">Email</label><input id="email" name="email" type="email" required className={inputCls} /></div>
      <button disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Sending…" : "Email me a reset link"}</button>
      <p className="text-center text-sm"><Link href="/staff/login" className="underline">Back to sign in</Link></p>
    </form>
  );
}

export function SetPasswordForm({ t }: { t: string }) {
  const [s, act, pending] = useActionState<FS, FormData>(setPassword, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4">
      <input type="hidden" name="t" value={t} />
      <Msg s={s} />
      <div><label className={labelCls} htmlFor="pw">New password</label><input id="pw" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputCls} /><p className="mt-1 text-xs text-black/50">At least 10 characters, with letters and a number.</p></div>
      <div><label className={labelCls} htmlFor="pw2">Repeat password</label><input id="pw2" name="confirm" type="password" autoComplete="new-password" required className={inputCls} /></div>
      <button disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Saving…" : "Save password & continue"}</button>
    </form>
  );
}
