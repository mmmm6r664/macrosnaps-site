"use client";
import { useActionState } from "react";
import { replyInquiry, type ReplyState } from "@/app/admin/(panel)/inbox/actions";
import { noReset } from "./noReset";
import { inputCls, labelCls, btnGold } from "./ui";

export default function ReplyForm({ id, to, subject, message }: { id: number; to: string; subject: string; message: string }) {
  const [s, act, pending] = useActionState<ReplyState, FormData>(replyInquiry, undefined);
  return (
    <form onSubmit={noReset(act)} className="space-y-3">
      <input type="hidden" name="id" value={id} />
      <p className="text-sm text-black/60">To <b>{to}</b>, from info@e.macrosnaps.com. Their reply comes to info@macrosnaps.com. Your sign-off (“Warmly, The MacroSnaps Team”) is added automatically.</p>
      <div><label className={labelCls} htmlFor="rs">Subject</label><input id="rs" name="subject" defaultValue={subject} required className={inputCls} /></div>
      <div><label className={labelCls} htmlFor="rm">Message</label><textarea id="rm" name="message" rows={14} defaultValue={message} required className={inputCls} /></div>
      <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="book" defaultChecked className="accent-[#a8963b]" />Add a “Book your date online” button</label>
      <button disabled={pending} className={`${btnGold} w-full`}>{pending ? "Sending…" : "Send reply"}</button>
      {s && <p role="status" className={`rounded px-3 py-2 text-sm ${s.error ? "bg-red-50 text-red-800" : "bg-emerald-50 text-emerald-800"}`}>{s.error ?? s.ok}</p>}
    </form>
  );
}
