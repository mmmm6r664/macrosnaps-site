"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { q } from "@/lib/db";
import { currentClient } from "@/lib/clientAuth";
import { createTicket, customerReply, verifyTicketKey, CATEGORIES, signedPath } from "@/lib/tickets";

export type TState = { error?: string } | undefined;
const t = (f: FormData, k: string, n: number) => String(f.get(k) ?? "").replace(/[<>]/g, "").trim().slice(0, n);

export async function openSupportTicket(_: TState, f: FormData): Promise<TState> {
  if (t(f, "website", 50)) return { error: "Something went wrong." }; // spam trap
  const c = await currentClient().catch(() => null);
  const name = t(f, "name", 100), email = (c?.email ?? t(f, "email", 200)).toLowerCase();
  const subject = t(f, "subject", 150), body = String(f.get("body") ?? "").trim().slice(0, 8000);
  const category = CATEGORIES.includes(t(f, "category", 60)) ? t(f, "category", 60) : "General question";
  const orderRef = t(f, "order", 40).toUpperCase() || null;
  if (!name) return { error: "Please enter your name." };
  if (!/^[^\s@<>]+@[^\s@<>]+\.[a-z]{2,}$/i.test(email)) return { error: "Please enter a valid email address." };
  if (subject.length < 3 || body.length < 10) return { error: "Please add a subject and describe how we can help." };
  const [{ n }] = await q<{ n: number }[]>`select count(*)::int as n from tickets where lower(email) = ${email} and created_at > now() - interval '1 hour'`;
  if (n >= 5) return { error: "You've opened several requests in the last hour. Please reply to one of them instead." };
  const tk = await createTicket({ source: c ? "client" : "guest", clientId: c?.id ?? null, name, email, phone: t(f, "phone", 30) || c?.phone || null, orderRef, category, subject, body });
  redirect(`${signedPath(tk.id)}&new=1`);
}

export async function replyAsCustomer(_: TState, f: FormData): Promise<TState> {
  const id = Number(f.get("id")) || 0, k = String(f.get("k") ?? "");
  if (!verifyTicketKey(id, k)) return { error: "This link isn't valid." };
  const body = String(f.get("body") ?? "").trim().slice(0, 8000);
  if (body.length < 2) return { error: "Write a message first." };
  const r = await customerReply(id, body);
  if ("error" in r) return { error: r.error };
  revalidatePath(`/support/ticket/${id}`);
  redirect(`${signedPath(id)}&sent=1`);
}
