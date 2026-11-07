"use client";
import { noReset } from "./noReset";
import { useActionState } from "react";
import { login, setupOwner, type FormState } from "@/app/admin/auth-actions";
import { inputCls, labelCls, btnPrimary } from "./ui";

function Err({ s }: { s: FormState }) {
  return s?.error ? <p role="alert" className="rounded bg-red-50 px-3 py-2 text-sm text-red-800">{s.error}</p> : null;
}

export function LoginForm() {
  const [s, act, pending] = useActionState(login, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4">
      <Err s={s} />
      <div><label className={labelCls} htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required className={inputCls} /></div>
      <button disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Signing in…" : "Sign in"}</button>
    </form>
  );
}

export function SetupForm() {
  const [s, act, pending] = useActionState(setupOwner, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4">
      <Err s={s} />
      <div><label className={labelCls} htmlFor="code">Setup code</label><input id="code" name="code" required autoComplete="off" className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="setup-first">First name *</label><input id="setup-first" name="firstName" required maxLength={60} className={inputCls} autoComplete="given-name" /></div>
          <div><label className={labelCls} htmlFor="setup-last">Last name *</label><input id="setup-last" name="lastName" required maxLength={60} className={inputCls} autoComplete="family-name" /></div>
      <div><label className={labelCls} htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="new-password" minLength={10} required className={inputCls} /><p className="mt-1 text-xs text-black/50">At least 10 characters, with letters and a number.</p></div>
      <button disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Creating…" : "Create owner account"}</button>
    </form>
  );
}
