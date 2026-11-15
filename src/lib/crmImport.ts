// Bulk import of contacts and orders from earlier systems (Wix and others) into the CRM.
// Contacts go into `clients` (matched by source + external id, then by email); orders go into `orders`
// (unique per source + external id, so re-running an import updates instead of duplicating).
import "server-only";
import { db, q } from "@/lib/db";

export type ContactIn = {
  external_id?: string; first_name?: string; last_name?: string; email?: string; phone?: string; company?: string;
  address?: string; labels?: string[]; created_at?: string; last_activity_at?: string; notes?: string;
};
export type OrderIn = {
  external_id: string; number?: string; created_at?: string; contact_external_id?: string; name?: string; email?: string; phone?: string;
  status?: string; payment_status?: string; fulfillment_status?: string; channel?: string; currency?: string;
  subtotal?: number; tax?: number; discount?: number; total?: number; paid?: number; refunded?: number; balance?: number;
  items?: { name: string; qty?: number; price?: number; options?: string }[]; notes?: string;
  company?: string; event?: string; location?: string; event_date?: string;
};

const s = (v: unknown, n: number) => String(v ?? "").trim().slice(0, n);
const cents = (v: unknown) => Math.round((Number(v) || 0) * 100);
const when = (v: unknown) => (v && !Number.isNaN(Date.parse(String(v))) ? new Date(String(v)) : null);
const normEmail = (v: unknown) => {
  const e = s(v, 200).toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : "";
};

/** Insert or update one contact; returns the client id. */
async function upsertContact(source: string, c: ContactIn): Promise<{ id: number; created: boolean }> {
  const ext = s(c.external_id, 120) || null, email = normEmail(c.email) || null;
  const first = s(c.first_name, 60), last = s(c.last_name, 60), phone = s(c.phone, 40) || null;
  const company = s(c.company, 120) || null, address = s(c.address, 400) || null, notes = s(c.notes, 4000) || null;
  const labels = Array.isArray(c.labels) ? c.labels.map((l) => s(l, 60)).filter(Boolean).slice(0, 20) : null;
  const created = when(c.created_at), active = when(c.last_activity_at);
  let hit = ext ? await q<{ id: number }[]>`select id from clients where source = ${source} and external_id = ${ext} limit 1` : [];
  if (!hit[0] && email) hit = await q<{ id: number }[]>`select id from clients where email = ${email} limit 1`;
  if (!hit[0] && !email && phone) hit = await q<{ id: number }[]>`select id from clients where email is null and phone = ${phone} and lower(first_name) = lower(${first}) limit 1`;
  if (hit[0]) {
    // Fill blanks only; never overwrite what the client or the team already set.
    await q`update clients set
      email = coalesce(email, ${email}), phone = coalesce(phone, ${phone}),
      first_name = case when first_name = '' then ${first} else first_name end,
      last_name = case when last_name = '' then ${last} else last_name end,
      company = coalesce(company, ${company}), address = coalesce(address, ${address}), notes = coalesce(notes, ${notes}),
      labels = coalesce(labels, ${labels}), source = coalesce(source, ${source}), external_id = coalesce(external_id, ${ext}),
      created_at = least(created_at, coalesce(${created}, created_at)),
      last_activity_at = greatest(last_activity_at, ${active}), updated_at = now()
      where id = ${hit[0].id}`;
    return { id: hit[0].id, created: false };
  }
  const [r] = await q<{ id: number }[]>`insert into clients (email, first_name, last_name, phone, company, address, notes, labels, source, external_id, created_at, last_activity_at, updated_at)
    values (${email}, ${first}, ${last}, ${phone}, ${company}, ${address}, ${notes}, ${labels}, ${source}, ${ext}, ${created ?? new Date()}, ${active}, now()) returning id`;
  return { id: r.id, created: true };
}

export async function importContacts(source: string, list: ContactIn[]) {
  const src = s(source, 40) || "Import";
  let created = 0, updated = 0, skipped = 0;
  const errors: string[] = [];
  for (const c of list.slice(0, 500)) {
    if (!normEmail(c.email) && !s(c.phone, 40) && !s(c.external_id, 120)) { skipped++; continue; }
    try { if ((await upsertContact(src, c)).created) created++; else updated++; } catch (e) { errors.push(`${c.email || c.external_id}: ${(e as Error).message}`.slice(0, 200)); }
  }
  return { ok: errors.length === 0, received: list.length, created, updated, skipped, errors: errors.slice(0, 10) };
}

export async function importOrders(source: string, list: OrderIn[]) {
  const src = s(source, 40) || "Import";
  const sql = await db();
  let created = 0, updated = 0, skipped = 0;
  const errors: string[] = [];
  for (const o of list.slice(0, 500)) {
    const ext = s(o.external_id, 120);
    if (!ext) { skipped++; continue; }
    try {
      const email = normEmail(o.email) || null;
      // Link to the contact: by the source's contact id, else by email (creating the contact if it is new).
      let clientId: number | null = null;
      const cext = s(o.contact_external_id, 120);
      if (cext) clientId = (await q<{ id: number }[]>`select id from clients where source = ${src} and external_id = ${cext} limit 1`)[0]?.id ?? null;
      if (!clientId && (email || s(o.phone, 40))) {
        const [first, ...rest] = s(o.name, 120).split(/\s+/);
        clientId = (await upsertContact(src, { external_id: cext || undefined, email: email ?? undefined, phone: o.phone, first_name: first, last_name: rest.join(" "), created_at: o.created_at })).id;
      }
      const items = (Array.isArray(o.items) ? o.items : []).slice(0, 50).map((i) => ({ name: s(i.name, 200), qty: Number(i.qty) || 1, price_cents: cents(i.price), options: s(i.options, 300) || undefined }));
      const [r] = await q<{ inserted: boolean }[]>`insert into orders (source, external_id, number, client_id, name, email, phone, status, payment_status, fulfillment_status, channel, currency,
          subtotal_cents, tax_cents, discount_cents, total_cents, paid_cents, refunded_cents, balance_cents, items, data, created_at, company, event, location, event_date, notes)
        values (${src}, ${ext}, ${s(o.number, 40) || null}, ${clientId}, ${s(o.name, 120)}, ${email}, ${s(o.phone, 40) || null}, ${s(o.status, 30) || null},
          ${s(o.payment_status, 30) || null}, ${s(o.fulfillment_status, 30) || null}, ${s(o.channel, 40) || null}, ${s(o.currency, 3) || "USD"},
          ${cents(o.subtotal)}, ${cents(o.tax)}, ${cents(o.discount)}, ${cents(o.total)}, ${cents(o.paid)}, ${cents(o.refunded)}, ${cents(o.balance)},
          ${sql.json(items)}, ${sql.json({})}, ${when(o.created_at) ?? new Date()},
          ${s(o.company, 160) || null}, ${s(o.event, 200) || null}, ${s(o.location, 300) || null}, ${s(o.event_date, 120) || null}, ${s(o.notes, 4000) || null})
        on conflict (source, external_id) do update set
          number = excluded.number, client_id = coalesce(excluded.client_id, orders.client_id), name = excluded.name, email = excluded.email, phone = excluded.phone,
          status = excluded.status, payment_status = excluded.payment_status, fulfillment_status = excluded.fulfillment_status, channel = excluded.channel,
          subtotal_cents = excluded.subtotal_cents, tax_cents = excluded.tax_cents, discount_cents = excluded.discount_cents, total_cents = excluded.total_cents,
          paid_cents = excluded.paid_cents, refunded_cents = excluded.refunded_cents, balance_cents = excluded.balance_cents, items = excluded.items,
          data = excluded.data, created_at = excluded.created_at, imported_at = now(),
          company = coalesce(excluded.company, orders.company), event = coalesce(excluded.event, orders.event), location = coalesce(excluded.location, orders.location),
          event_date = coalesce(excluded.event_date, orders.event_date), notes = coalesce(excluded.notes, orders.notes)
        returning (xmax = 0) as inserted`;
      if (r.inserted) created++; else updated++;
      if (clientId && o.company) await q`update clients set company = coalesce(company, ${s(o.company, 120)}) where id = ${clientId}`;
      if (clientId) await q`update clients set last_activity_at = greatest(last_activity_at, ${when(o.created_at)}) where id = ${clientId}`;
    } catch (e) { errors.push(`${ext}: ${(e as Error).message}`.slice(0, 200)); }
  }
  return { ok: errors.length === 0, received: list.length, created, updated, skipped, errors: errors.slice(0, 10) };
}
