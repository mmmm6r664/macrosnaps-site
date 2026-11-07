"use client";
import { useActionState } from "react";
import { sendTest, type TestState } from "@/app/admin/(panel)/emails/actions";

export function SendTestButton({ k, label }: { k: string; label: string }) {
  const [s, act, pending] = useActionState<TestState, FormData>(sendTest, undefined);
  return (
    <form action={act} className="flex flex-col items-end gap-1">
      <input type="hidden" name="key" value={k} />
      <button disabled={pending} className="rounded border border-black/20 px-3 py-1.5 text-xs font-semibold hover:border-[#a8963b] disabled:opacity-50">{pending ? "Sending…" : label}</button>
      {s && <span className={`text-xs ${s.error ? "text-red-700" : "text-emerald-700"}`}>{s.error ?? s.ok}</span>}
    </form>
  );
}
