"use client";
import { useActionState } from "react";
import { importFromResend, type ImportState } from "@/app/admin/(panel)/messages/actions";
import { btnGhost } from "./ui";

export default function ImportEmails() {
  const [s, act, pending] = useActionState<ImportState, FormData>(importFromResend, undefined);
  return (
    <form action={act} className="mb-4 flex flex-wrap items-center gap-3">
      <button disabled={pending} className={btnGhost}>{pending ? "Importing…" : "Import earlier emails from Resend"}</button>
      {s && <span role="status" className={`text-sm ${s.error ? "text-red-700" : "text-emerald-700"}`}>{s.error ?? s.ok}</span>}
    </form>
  );
}
