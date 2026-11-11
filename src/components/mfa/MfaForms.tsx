"use client";
import { useActionState, useState, useTransition } from "react";
import { verifyMfa, startSetup, confirmSetup, regenerateCodes, disableMfa, signOutOthers, type M } from "@/app/mfa/actions";
import { noReset } from "@/components/admin/noReset";
import { inputCls, labelCls, btnPrimary, btnGhost } from "@/components/admin/ui";

const Msg = ({ s }: { s: M }) => (s?.error || s?.ok ? <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p> : null);

function Codes({ codes }: { codes: string[] }) {
  return (
    <div className="rounded border border-amber-300 bg-amber-50 p-4">
      <p className="mb-2 text-sm font-semibold text-amber-900">Save these recovery codes now. Each works once if you lose your phone. They won&apos;t be shown again.</p>
      <ul className="grid grid-cols-2 gap-1 font-mono text-sm">{codes.map((c) => <li key={c}>{c}</li>)}</ul>
      <button type="button" onClick={() => navigator.clipboard?.writeText(codes.join("\n"))} className="mt-3 text-xs underline">Copy codes</button>
    </div>
  );
}

export function VerifyForm() {
  const [s, act, pending] = useActionState<M, FormData>(verifyMfa, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-4">
      <Msg s={s} />
      <div><label className={labelCls} htmlFor="code">6-digit code from your authenticator app</label>
        <input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" autoFocus required maxLength={11} className={`${inputCls} text-center font-mono text-2xl tracking-[.3em]`} /></div>
      <button disabled={pending} className={`${btnPrimary} w-full`}>{pending ? "Checking…" : "Verify"}</button>
      <p className="text-center text-xs text-black/50">Lost your phone? Enter one of your recovery codes instead.</p>
    </form>
  );
}

export function SetupPanel({ enabled, manager }: { enabled: boolean; manager: boolean }) {
  const [setup, setSetup] = useState<M>();
  const [busy, start] = useTransition();
  const [s, act, pending] = useActionState<M, FormData>(confirmSetup, undefined);
  const [other, setOther] = useState<M>();
  if (s?.codes) return <div className="space-y-3"><Msg s={s} /><Codes codes={s.codes} /><a href={manager ? "/admin" : "/staff"} className={btnPrimary}>Continue</a></div>;
  if (enabled) return (
    <div className="space-y-3">
      <p className="text-sm"><b className="text-emerald-700">On.</b> You&apos;ll enter a code from your authenticator app each time you sign in.</p>
      <div className="flex flex-wrap gap-2">
        <button type="button" disabled={busy} onClick={() => start(async () => setOther(await regenerateCodes()))} className={btnGhost}>New recovery codes</button>
        <button type="button" disabled={busy} onClick={() => start(async () => setSetup(await startSetup()))} className={btnGhost}>Move to a new phone</button>
        {!manager && <button type="button" disabled={busy} onClick={() => { if (confirm("Turn off two-factor authentication?")) start(async () => setOther(await disableMfa())); }} className="text-sm text-red-700 underline">Turn off</button>}
      </div>
      <Msg s={other} />{other?.codes && <Codes codes={other.codes} />}
      {setup?.qr && <Scan setup={setup} act={act} pending={pending} s={s} />}
    </div>
  );
  return setup?.qr ? <Scan setup={setup} act={act} pending={pending} s={s} /> : (
    <div className="space-y-3">
      <p className="text-sm">Use an authenticator app such as Google Authenticator, Microsoft Authenticator, 1Password or Authy.</p>
      <button type="button" disabled={busy} onClick={() => start(async () => setSetup(await startSetup()))} className={btnPrimary}>{busy ? "…" : "Set up two-factor authentication"}</button>
      <Msg s={setup} />
    </div>
  );
}

function Scan({ setup, act, pending, s }: { setup: M; act: (f: FormData) => void; pending: boolean; s: M }) {
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <p className="text-sm">1. In your authenticator app, add an account and scan this code:</p>
      {/* eslint-disable-next-line @next/next/no-img-element -- generated QR data URL */}
      <img src={setup!.qr} alt="QR code for your authenticator app" width={220} height={220} className="rounded border border-black/10" />
      <p className="text-xs text-black/60">Can&apos;t scan? Enter this key: <span className="break-all font-mono">{setup!.secret}</span></p>
      <div><label className={labelCls} htmlFor="setup-code">2. Enter the 6-digit code it shows</label><input id="setup-code" name="code" inputMode="numeric" autoComplete="one-time-code" required maxLength={7} className={`${inputCls} max-w-[200px] text-center font-mono text-xl tracking-[.3em]`} /></div>
      <Msg s={s} />
      <button disabled={pending} className={btnPrimary}>{pending ? "Checking…" : "Turn on"}</button>
    </form>
  );
}

export function SignOutOthers() {
  const [s, setS] = useState<M>();
  const [busy, start] = useTransition();
  return <div className="space-y-2"><button type="button" disabled={busy} onClick={() => start(async () => setS(await signOutOthers()))} className={btnGhost}>Sign out of all other devices</button><Msg s={s} /></div>;
}
