"use server";
import { revalidatePath } from "next/cache";
import { q, audit } from "@/lib/db";
import { requireStaff, clientIp } from "@/lib/auth";
import { resolveCity } from "@/lib/geo";
import { SHOOT_TYPES } from "@/lib/careers";
import { encrypt, canEncrypt } from "@/lib/crypto";
import { CONTRACT_VERSION } from "@/data/contractorAgreement";
import { respondToOffer } from "@/lib/offers";
import { notifyAdmins } from "@/lib/notify";

export type S = { error?: string; ok?: string } | undefined;
const t = (f: FormData, k: string, n = 200) => String(f.get(k) ?? "").replace(/[<>]/g, "").trim().slice(0, n);

async function ensureProfile(userId: number) {
  await q`insert into staff_profiles (user_id) values (${userId}) on conflict do nothing`;
}

export async function saveProfile(_: S, f: FormData): Promise<S> {
  const u = await requireStaff();
  await ensureProfile(u.id);
  const cityText = t(f, "city", 120);
  const c = resolveCity(cityText);
  const roles = f.getAll("roles").map(String).filter((r) => ["Photographer", "Videographer"].includes(r));
  const shoots = f.getAll("shoots").map(String).filter((x) => SHOOT_TYPES.includes(x));
  const method = t(f, "payout_method", 30);
  if (method && !["Venmo", "PayPal", "Cash App", "Zelle"].includes(method)) return { error: "Choose a payout method." };
  const radius = Math.min(500, Math.max(5, Number(f.get("radius")) || 25));
  await q`update staff_profiles set phone = ${t(f, "phone", 40)}, city = ${c ? `${c.name}, ${c.state}` : cityText}, lat = ${c?.lat ?? null}, lng = ${c?.lng ?? null},
    radius_miles = ${radius}, roles = ${roles}, shoot_types = ${shoots}, gear = ${t(f, "gear", 4000)}, bio = ${t(f, "bio", 2000)}, portfolio = ${t(f, "portfolio", 300)},
    payout_method = ${method || null}, payout_handle = ${t(f, "payout_handle", 120) || null}, updated_at = now() where user_id = ${u.id}`;
  await audit(u.id, "staff_profile_save");
  revalidatePath("/staff", "layout");
  return { ok: c || !cityText ? "Saved." : "Saved. We couldn't match your city to our map; use \"City, ST\" (e.g. Arlington, VA) so you get offers near you." };
}

/** Digital W-9: legal details + SSN/EIN, encrypted before it's stored. Only the last 4 digits stay readable. */
export async function saveW9(_: S, f: FormData): Promise<S> {
  const u = await requireStaff();
  if (!canEncrypt()) return { error: "Tax details can't be saved yet. Please try again later." };
  const tinType = t(f, "tin_type", 3);
  const tin = String(f.get("tin") ?? "").replace(/\D/g, "");
  if (!["ssn", "ein"].includes(tinType) || tin.length !== 9) return { error: "Enter a 9-digit SSN or EIN." };
  const legal = t(f, "legal_name", 120), addr = t(f, "address", 400), cls = t(f, "classification", 60), sig = t(f, "signature", 120);
  if (!legal || !addr || !cls) return { error: "Complete your legal name, tax classification and address." };
  if (f.get("certify") !== "on" || sig.length < 3) return { error: "Tick the certification and type your name to sign." };
  await ensureProfile(u.id);
  await q`update staff_profiles set tax_legal_name = ${legal}, tax_business_name = ${t(f, "business_name", 120) || null}, tax_classification = ${cls}, tax_address = ${addr},
    tin_type = ${tinType}, tin_enc = ${encrypt(tin)}, tin_last4 = ${tin.slice(-4)}, w9_signed_at = now(), w9_signature = ${sig}, updated_at = now() where user_id = ${u.id}`;
  await audit(u.id, "w9_submit", `${tinType} ***${tin.slice(-4)}`);
  revalidatePath("/staff", "layout");
  return { ok: "W-9 saved. Your tax ID is encrypted." };
}

export async function signContract(_: S, f: FormData): Promise<S> {
  const u = await requireStaff();
  const sig = t(f, "signature", 120);
  if (f.get("agree") !== "on" || sig.length < 3) return { error: "Tick the box and type your full name to sign." };
  await ensureProfile(u.id);
  await q`update staff_profiles set contract_version = ${CONTRACT_VERSION}, contract_signature = ${sig}, contract_signed_at = now(), contract_ip = ${await clientIp()} where user_id = ${u.id}`;
  await audit(u.id, "contract_sign", CONTRACT_VERSION);
  await notifyAdmins(`${u.name} signed the contractor agreement`, `Version ${CONTRACT_VERSION}, signed as "${sig}".`, "/admin/photographers");
  revalidatePath("/staff", "layout");
  return { ok: "Signed. Thank you!" };
}

export async function answerOffer(f: FormData) {
  const u = await requireStaff();
  await respondToOffer({ userId: u.id, offerId: Number(f.get("offer_id")) }, f.get("answer") === "yes");
  revalidatePath("/staff", "layout");
}

export async function openTicket(_: S, f: FormData): Promise<S> {
  const u = await requireStaff();
  const subject = t(f, "subject", 150), body = t(f, "body", 5000);
  if (!subject || !body) return { error: "Add a subject and describe what you need." };
  const { createTicket, CATEGORIES, ticketNo } = await import("@/lib/tickets");
  const cat = t(f, "category", 60);
  const phone = (await q<{ phone: string | null }[]>`select phone from staff_profiles where user_id = ${u.id}`)[0]?.phone ?? null;
  const tk = await createTicket({ source: "photographer", userId: u.id, name: u.name, email: u.email, phone, orderRef: t(f, "order", 40).toUpperCase() || null, category: CATEGORIES.includes(cat) ? cat : "General question", subject, body });
  revalidatePath("/staff/support");
  return { ok: `Sent as ${ticketNo(tk.id)}. We've emailed you a confirmation and will reply by email.` };
}

export async function markRead() {
  const u = await requireStaff();
  await q`update notifications set read_at = now() where user_id = ${u.id} and read_at is null`;
  revalidatePath("/staff", "layout");
}
