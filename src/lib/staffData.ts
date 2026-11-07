import "server-only";
import { q } from "@/lib/db";

export type Profile = {
  user_id: number; phone: string | null; city: string | null; radius_miles: number; roles: string[]; shoot_types: string[]; gear: string; bio: string; portfolio: string | null;
  payout_method: string | null; payout_handle: string | null; tax_legal_name: string | null; tax_business_name: string | null; tax_classification: string | null; tax_address: string | null;
  tin_type: string | null; tin_last4: string | null; w9_signed_at: Date | null; contract_version: string | null; contract_signed_at: Date | null; contract_signature: string | null;
};

export async function getProfile(userId: number): Promise<Profile | null> {
  const [p] = await q<Profile[]>`select user_id, phone, city, radius_miles, roles, shoot_types, gear, bio, portfolio, payout_method, payout_handle, tax_legal_name, tax_business_name,
    tax_classification, tax_address, tin_type, tin_last4, w9_signed_at, contract_version, contract_signed_at, contract_signature from staff_profiles where user_id = ${userId}`;
  return p ?? null;
}

export async function myOffers(userId: number) {
  return q<{ offer_id: number; title: string; city: string | null; shoot_date: string; details: string; pay: string | null; status: string; response: string; created_at: Date; mine: boolean }[]>`
    select o.id as offer_id, o.title, o.city, o.shoot_date, o.details, o.pay, o.status, r.response, o.created_at, (o.assigned_user_id = ${userId}) as mine
    from offer_recipients r join offers o on o.id = r.offer_id where r.user_id = ${userId} order by o.created_at desc limit 100`;
}

export async function myShoots(userId: number) {
  return q<{ id: number; ref: string; service_name: string; addon: string | null; city: string | null; venue_address: string | null; schedule: { date: string; start: string; end: string; venue?: string }[]; customer_name: string; phone: string | null; status: string; first_date: Date | null }[]>`
    select b.id, b.ref, b.service_name, b.addon, b.city, b.venue_address, b.schedule, b.customer_name, b.phone, b.status, b.first_date
    from crew_assignments c join bookings b on b.id = c.booking_id where c.user_id = ${userId} and b.status not in ('cancelled', 'refunded') order by b.first_date desc nulls last limit 200`;
}

export async function myPayouts(userId: number) {
  return q<{ id: number; amount_cents: number; paid_on: Date; method: string | null; note: string }[]>`select id, amount_cents, paid_on, method, note from payouts where user_id = ${userId} order by paid_on desc, id desc`;
}

export async function myNotifications(userId: number, limit = 20) {
  return q<{ id: number; title: string; body: string; link: string | null; read_at: Date | null; created_at: Date }[]>`
    select id, title, body, link, read_at, created_at from notifications where user_id = ${userId} order by id desc limit ${limit}`;
}
