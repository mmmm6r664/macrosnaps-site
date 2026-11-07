"use client";
import { noReset } from "./noReset";
import { useActionState } from "react";
import { importSubscribers, type S } from "@/app/admin/(panel)/subscribers/actions";
import { inputCls, btnPrimary } from "./ui";

export default function ImportSubscribers() {
  const [s, act, pending] = useActionState<S, FormData>(importSubscribers, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <textarea name="emails" rows={5} className={inputCls} placeholder={"Paste emails: one per line, or separated by commas.\njane@example.com\nJohn Smith <john@example.com>"} />
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" name="consent" className="mt-1" />These people agreed to receive emails from MacroSnaps.</label>
      {s && <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
      <button disabled={pending} className={btnPrimary}>{pending ? "Adding…" : "Add subscribers"}</button>
    </form>
  );
}
