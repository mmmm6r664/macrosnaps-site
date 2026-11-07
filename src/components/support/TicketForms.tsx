"use client";
import { useActionState } from "react";
import { openSupportTicket, replyAsCustomer, type TState } from "@/app/(site)/support/actions";

const field = "w-full border-b border-black/30 bg-transparent px-1 py-3 outline-none focus:border-gold-dark";

export function NewTicketForm({ categories, me, order }: { categories: string[]; me: { name: string; email: string; phone: string } | null; order: string }) {
  const [s, act, pending] = useActionState<TState, FormData>(openSupportTicket, undefined);
  return (
    <form action={act} className="grid gap-5 sm:grid-cols-2">
      <input name="name" required defaultValue={me?.name} placeholder="Full name *" className={field} autoComplete="name" />
      {me ? <p className="self-end border-b border-black/10 px-1 py-3 text-muted">{me.email}</p> : <input name="email" type="email" required placeholder="Email *" className={field} autoComplete="email" />}
      <input name="phone" type="tel" defaultValue={me?.phone} placeholder="Phone" className={field} autoComplete="tel" />
      <input name="order" defaultValue={order} placeholder="Order number (if you have one)" className={field} />
      <select name="category" defaultValue="" required className={`${field} sm:col-span-2`} aria-label="Topic">
        <option value="" disabled>What is this about? *</option>
        {categories.map((c) => <option key={c}>{c}</option>)}
      </select>
      <input name="subject" required maxLength={150} placeholder="Subject *" className={`${field} sm:col-span-2`} />
      <textarea name="body" required rows={6} placeholder="How can we help? Please include dates, links or anything else that helps us. *" className={`${field} sm:col-span-2`} />
      <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {s?.error && <p role="alert" className="text-sm text-red-700 sm:col-span-2">{s.error}</p>}
      <button disabled={pending} className="btn-gold justify-self-start sm:col-span-2">{pending ? "Sending…" : "Submit request"}</button>
    </form>
  );
}

export function CustomerReplyForm({ id, k }: { id: number; k: string }) {
  const [s, act, pending] = useActionState<TState, FormData>(replyAsCustomer, undefined);
  return (
    <form action={act} className="space-y-3">
      <input type="hidden" name="id" value={id} /><input type="hidden" name="k" value={k} />
      <label htmlFor="reply" className="eyebrow block">Add a reply</label>
      <textarea id="reply" name="body" required rows={5} className="w-full border border-black/20 bg-white p-3 outline-none focus:border-gold-dark" placeholder="Write your message…" />
      {s?.error && <p role="alert" className="text-sm text-red-700">{s.error}</p>}
      <button disabled={pending} className="btn-dark">{pending ? "Sending…" : "Send reply"}</button>
    </form>
  );
}
