// Finds a client's phone number from anything we already have on file for that email.
import "server-only";
import { hasDb, db } from "@/lib/db";

export async function phoneForEmail(email: string | null | undefined): Promise<string | null> {
  const e = String(email ?? "").trim().toLowerCase();
  if (!hasDb || !e) return null;
  const sql = await db();
  const [r] = await sql<{ phone: string }[]>`
    select phone from (
      select phone, created_at from bookings where lower(email) = ${e} and coalesce(phone, '') <> ''
      union all select phone, created_at from inquiries where lower(email) = ${e} and coalesce(phone, '') <> ''
      union all select phone, created_at from clients where lower(email) = ${e} and coalesce(phone, '') <> ''
    ) x order by created_at desc limit 1`.catch(() => [] as { phone: string }[]);
  return r?.phone ?? null;
}
