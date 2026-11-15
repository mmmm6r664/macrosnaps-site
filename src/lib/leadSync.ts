// Keeps the Clients list complete: every lead (website contact form, Sulekha, The Knot, WeddingWire, Thumbtack…)
// and every website booking becomes a client contact, so it can be found, followed up and included in newsletters.
// Our own addresses and photographers/videographers are never added.
import "server-only";
import { q } from "@/lib/db";

export async function syncLeadsToClients(onlyEmail?: string) {
  const e = onlyEmail?.trim().toLowerCase() || null;
  const r = await q<{ email: string }[]>`
    with src as (
      select lower(trim(i.email)) as email, i.name, i.phone, coalesce(nullif(i.data->>'source', ''), 'Website inquiry') as source, i.created_at as at
        from inquiries i where i.kind = 'contact'
      union all
      select lower(trim(b.email)), b.customer_name, b.phone, 'Website booking', b.created_at from bookings b
    ), pick as (
      select distinct on (email) email, name, phone, source, at,
        max(at) over (partition by email) as last_at, min(at) over (partition by email) as first_at
      from src
      where email ~ '^[^@\\s]+@[^@\\s]+\\.[a-z]{2,}$' and email not like '%xxxx%'
        and email !~ '@(macrohype|macrosnaps|e\\.macrosnaps)\\.com$' and email not in ('rehmansiddiq@gmail.com', 'macrohype@gmail.com')
        and (${e}::text is null or email = ${e})
      order by email, at asc
    )
    insert into clients (email, first_name, last_name, phone, source, created_at, last_activity_at)
    select p.email, split_part(trim(p.name), ' ', 1), trim(substr(trim(p.name), length(split_part(trim(p.name), ' ', 1)) + 1)), nullif(p.phone, ''), p.source, p.first_at, p.last_at
    from pick p
    where not exists (select 1 from users u where lower(u.email) = p.email or p.email = any(u.alt_emails))
      and not exists (select 1 from inquiries a where a.kind = 'application' and lower(a.email) = p.email)
      and not exists (select 1 from blocklist b where b.kind = 'email' and b.value = p.email)
    on conflict (email) do update set
      last_activity_at = greatest(clients.last_activity_at, excluded.last_activity_at),
      phone = coalesce(clients.phone, excluded.phone),
      first_name = case when clients.first_name = '' then excluded.first_name else clients.first_name end,
      last_name = case when clients.last_name = '' then excluded.last_name else clients.last_name end
    returning email`;
  return r.length;
}
