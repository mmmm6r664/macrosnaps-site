// Postgres access for the admin portal (Neon on Vercel; any Postgres locally).
// Vercel's Neon integration sets DATABASE_URL (and POSTGRES_URL); either works.
import "server-only";
import postgres from "postgres";

const URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";
export const hasDb = !!URL;

type Sql = ReturnType<typeof postgres>;
const g = globalThis as unknown as { __msSql?: Sql; __msMigrated?: Promise<void> };

function client(): Sql {
  if (!URL) throw new Error("DATABASE_URL is not set");
  if (!g.__msSql) {
    const local = /localhost|127\.0\.0\.1/.test(URL);
    g.__msSql = postgres(URL, { ssl: local ? false : "require", max: 5, idle_timeout: 20, prepare: false, onnotice: () => {} });
  }
  return g.__msSql;
}

const SCHEMA = `
create table if not exists users (
  id serial primary key,
  email text unique not null,
  name text not null default '',
  password_hash text not null,
  role text not null default 'staff',          -- owner | admin | staff
  active boolean not null default true,
  created_at timestamptz not null default now()
);
create table if not exists sessions (
  token_hash text primary key,
  user_id int not null references users(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists bookings (
  id serial primary key,
  ref text unique not null,
  status text not null default 'pending_payment', -- pending_payment | requested | paid | confirmed | completed | cancelled | refunded | partially_refunded
  service text not null,
  service_name text not null,
  package text,
  addon text,
  city text,
  city_slug text,
  venue_address text,
  customer_name text not null,
  email text not null,
  phone text,
  company text,
  notes text,
  schedule jsonb not null default '[]',
  lines jsonb not null default '[]',
  total_cents int not null default 0,
  amount_refunded_cents int not null default 0,
  signature text,
  terms_version text,
  signed_at timestamptz,
  signer_ip text,
  stripe_session_id text,
  stripe_payment_intent text,
  internal_notes text not null default '',
  first_date date,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists bookings_first_date on bookings(first_date);
create index if not exists bookings_status on bookings(status);
create table if not exists crew_assignments (
  booking_id int not null references bookings(id) on delete cascade,
  user_id int not null references users(id) on delete cascade,
  primary key (booking_id, user_id)
);
create table if not exists inquiries (
  id serial primary key,
  kind text not null,                            -- contact | application
  name text not null default '',
  email text not null default '',
  phone text,
  data jsonb not null default '{}',
  status text not null default 'new',            -- new | in_progress | done | rejected
  notes text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists subscribers (
  id serial primary key,
  email text unique not null,
  name text not null default '',
  status text not null default 'subscribed',     -- subscribed | unsubscribed
  token text not null,
  source text,
  created_at timestamptz not null default now()
);
create table if not exists newsletters (
  id serial primary key,
  subject text not null,
  preheader text not null default '',
  body text not null default '',
  status text not null default 'draft',          -- draft | scheduled | sending | sent | failed
  scheduled_at timestamptz,
  sent_at timestamptz,
  sent_count int not null default 0,
  error text,
  created_by int references users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create table if not exists settings (
  key text primary key,
  value jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by int references users(id) on delete set null
);
create table if not exists audit_log (
  id serial primary key,
  user_id int references users(id) on delete set null,
  action text not null,
  detail text not null default '',
  created_at timestamptz not null default now()
);
create table if not exists staff_profiles (
  user_id int primary key references users(id) on delete cascade,
  phone text, city text, lat double precision, lng double precision, radius_miles int not null default 25,
  roles text[] not null default '{}', shoot_types text[] not null default '{}', gear text not null default '', bio text not null default '',
  portfolio text, application_id int,
  payout_method text, payout_handle text,
  tax_legal_name text, tax_business_name text, tax_classification text, tax_address text,
  tin_type text, tin_enc text, tin_last4 text, w9_signed_at timestamptz, w9_signature text,
  contract_version text, contract_signature text, contract_signed_at timestamptz, contract_ip text,
  updated_at timestamptz not null default now()
);
create table if not exists password_tokens (
  token_hash text primary key,
  user_id int not null references users(id) on delete cascade,
  purpose text not null default 'set',
  expires_at timestamptz not null
);
create table if not exists notifications (
  id serial primary key,
  user_id int references users(id) on delete cascade,  -- null = for the admin team
  title text not null, body text not null default '', link text,
  read_at timestamptz, created_at timestamptz not null default now()
);
create index if not exists notifications_user on notifications(user_id, read_at);
create table if not exists offers (
  id serial primary key,
  booking_id int references bookings(id) on delete set null,
  title text not null, city text, shoot_date text, details text not null default '', pay text,
  status text not null default 'open',               -- open | filled | cancelled
  assigned_user_id int references users(id) on delete set null,
  created_by int references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists offer_recipients (
  id serial primary key,
  offer_id int not null references offers(id) on delete cascade,
  user_id int references users(id) on delete cascade,
  inquiry_id int references inquiries(id) on delete cascade,
  name text not null default '', email text, phone text,
  token text unique not null,
  response text not null default 'pending',          -- pending | accepted | declined
  responded_at timestamptz
);
create table if not exists outbound_messages (
  id serial primary key,
  channel text not null, recipient text not null, subject text, body text not null,
  status text not null, error text, created_by int references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists payouts (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  amount_cents int not null, paid_on date not null, method text, booking_id int references bookings(id) on delete set null,
  note text not null default '', created_by int references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists kb_articles (
  id serial primary key,
  title text not null, body text not null default '', category text not null default 'General',
  published boolean not null default true, sort int not null default 0,
  updated_at timestamptz not null default now()
);
create table if not exists support_tickets (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  subject text not null, body text not null, status text not null default 'open',  -- open | answered | closed
  reply text, replied_at timestamptz, created_at timestamptz not null default now()
);
create table if not exists staff_uploads (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  booking_id int references bookings(id) on delete set null,
  file_name text not null, size_bytes bigint, drive_file_id text, drive_folder_id text,
  created_at timestamptz not null default now()
);

alter table users add column if not exists totp_secret text;
alter table users add column if not exists totp_enabled boolean not null default false;
alter table users add column if not exists totp_last_counter bigint not null default 0;
alter table sessions add column if not exists mfa_pending boolean not null default false;
alter table sessions add column if not exists ip text;
alter table sessions add column if not exists user_agent text;
create table if not exists recovery_codes (
  id serial primary key,
  user_id int not null references users(id) on delete cascade,
  code_hash text not null,
  used_at timestamptz
);

-- Client portal: customer accounts (email link, Google or Facebook sign-in), order tracking, galleries, feedback.
create table if not exists clients (
  id serial primary key,
  email text unique not null,
  first_name text not null default '',
  last_name text not null default '',
  phone text,
  google_sub text unique,
  facebook_id text unique,
  created_at timestamptz not null default now(),
  last_login_at timestamptz
);
create table if not exists client_sessions (
  token_hash text primary key,
  client_id int not null references clients(id) on delete cascade,
  expires_at timestamptz not null,
  created_at timestamptz not null default now()
);
create table if not exists client_login_tokens (
  token_hash text primary key,
  email text not null,
  next_path text,
  expires_at timestamptz not null,
  used_at timestamptz
);
alter table bookings add column if not exists stage text not null default 'booked';
alter table bookings add column if not exists stage_updated_at timestamptz;
create table if not exists galleries (
  id serial primary key,
  booking_id int unique not null references bookings(id) on delete cascade,
  title text not null default '',
  message text not null default '',
  download_url text,
  status text not null default 'draft',              -- draft | published
  published_at timestamptz,
  created_at timestamptz not null default now()
);
alter table galleries add column if not exists feedback_asked_at timestamptz;
create table if not exists gallery_photos (
  id serial primary key,
  gallery_id int not null references galleries(id) on delete cascade,
  url text not null,
  pathname text,
  file_name text not null default '',
  size_bytes bigint,
  sort int not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists gallery_photos_gallery on gallery_photos(gallery_id, sort);
-- E-signatures: contracts sent to photographers/applicants, signed via a secure link, stored as PDF with an audit trail.
create table if not exists contracts (
  id serial primary key,
  user_id int references users(id) on delete set null,
  inquiry_id int references inquiries(id) on delete set null,
  signer_name text not null,
  signer_email text not null,
  doc_title text not null,
  doc_version text not null,
  doc_sections jsonb not null,               -- exact text sent (frozen at send time)
  company_signer text not null,
  company_signed_at timestamptz not null default now(),
  token_hash text unique not null,
  status text not null default 'sent',       -- sent | viewed | signed | voided
  sent_at timestamptz not null default now(),
  viewed_at timestamptz, viewed_ip text,
  signed_at timestamptz, signed_name text, signed_ip text, signed_ua text, signature_png text, consent boolean,
  pdf bytea, pdf_sha256 text, doc_sha256 text,
  created_by int references users(id) on delete set null
);
create index if not exists contracts_email on contracts(lower(signer_email));
alter table contracts add column if not exists signer_phone text;
alter table contracts add column if not exists signer_address text;
-- Email automations: abandoned-booking reminders, subscriber welcome series, review requests.
-- Columns are added with a "done" default so existing rows never get emailed, then new rows start at 0.
alter table bookings add column if not exists reminders_sent int not null default 3;
alter table bookings alter column reminders_sent set default 0;
alter table bookings add column if not exists last_reminder_at timestamptz;
alter table bookings add column if not exists reminders_stopped boolean not null default false;
alter table subscribers add column if not exists nurture_step int not null default 3;
alter table subscribers alter column nurture_step set default 0;
alter table crew_assignments add column if not exists drive_link text;
alter table payouts alter column user_id drop not null;
alter table payouts add column if not exists payee_name text;
alter table payouts add column if not exists payee_email text;
alter table payouts add column if not exists emailed_at timestamptz;
alter table crew_assignments add column if not exists drive_link_at timestamptz;
alter table crew_assignments add column if not exists drive_asked_at timestamptz;
alter table crew_assignments add column if not exists drive_reminded_at timestamptz;
alter table crew_assignments add column if not exists drive_overdue_at timestamptz;
create table if not exists tickets (
  id serial primary key,
  source text not null,                              -- client | photographer | guest
  user_id int references users(id) on delete set null,
  client_id int,
  name text not null default '', email text not null, phone text,
  order_ref text, category text not null default 'General question',
  subject text not null,
  status text not null default 'open',              -- open | in_progress | waiting | resolved | closed
  priority text not null default 'normal',
  legacy_id int unique,
  created_at timestamptz not null default now(), updated_at timestamptz not null default now(), resolved_at timestamptz
);
create index if not exists tickets_status on tickets(status, updated_at desc);
do $$ begin if not exists (select 1 from tickets) then perform setval('tickets_id_seq', 1000, true); end if; end $$;
create table if not exists ticket_messages (
  id serial primary key,
  ticket_id int not null references tickets(id) on delete cascade,
  author text not null,                               -- customer | team | note
  author_name text not null default '',
  body text not null,
  created_at timestamptz not null default now()
);
create index if not exists ticket_messages_ticket on ticket_messages(ticket_id, id);
insert into tickets (source, user_id, name, email, subject, status, legacy_id, created_at, updated_at, resolved_at)
  select 'photographer', s.user_id, u.name, u.email, s.subject, case s.status when 'answered' then 'waiting' when 'closed' then 'resolved' else 'open' end, s.id, s.created_at, coalesce(s.replied_at, s.created_at), case when s.status = 'closed' then coalesce(s.replied_at, s.created_at) end
  from support_tickets s join users u on u.id = s.user_id where not exists (select 1 from tickets t where t.legacy_id = s.id);
insert into ticket_messages (ticket_id, author, author_name, body, created_at)
  select t.id, 'customer', t.name, s.body, s.created_at from support_tickets s join tickets t on t.legacy_id = s.id
  where not exists (select 1 from ticket_messages m where m.ticket_id = t.id);
insert into ticket_messages (ticket_id, author, author_name, body, created_at)
  select t.id, 'team', 'MacroSnaps', s.reply, s.replied_at from support_tickets s join tickets t on t.legacy_id = s.id
  where s.reply is not null and (select count(*) from ticket_messages m where m.ticket_id = t.id) = 1;
update contracts set doc_sections = (doc_sections #>> '{}')::jsonb where jsonb_typeof(doc_sections) = 'string';
create table if not exists snappr_jobs (
  job_id text primary key, meta text not null default '', photos jsonb not null default '[]', created_at timestamptz not null default now()
);
alter table snappr_jobs add column if not exists picks jsonb;
create table if not exists email_log (
  id serial primary key,
  to_addr text not null, subject text not null default '', html text, reply_to text, attachments text[] not null default '{}',
  status text not null, error text, provider_id text,
  created_at timestamptz not null default now()
);
create index if not exists email_log_created on email_log(created_at desc);
create table if not exists file_requests (
  id serial primary key,
  name text not null, email text not null, shoot text not null default '', shoot_date text not null default '',
  due_at timestamptz not null,
  drive_link text, drive_link_at timestamptz, reminded_at timestamptz, overdue_at timestamptz,
  created_by int references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create table if not exists assignments (
  id serial primary key,
  user_id int references users(id) on delete set null,
  name text not null, email text not null,
  type text not null default '', dates text not null default '', city text, pay text not null default '',
  sessions jsonb not null default '[]', location text not null default '', scope text[] not null default '{}',
  shoot_date date, ends_at timestamptz, emailed boolean not null default false,
  file_request_id int references file_requests(id) on delete set null, drive_asked_at timestamptz,
  created_by int references users(id) on delete set null,
  created_at timestamptz not null default now()
);
create index if not exists assignments_email on assignments(lower(email));
create table if not exists page_versions (
  url text primary key,
  grp text not null default '',
  hash text not null,
  changed_at timestamptz,
  checked_at timestamptz not null default now()
);
create index if not exists page_versions_grp on page_versions(grp);
alter table subscribers add column if not exists nurture_at timestamptz;
create table if not exists feedback (
  id serial primary key,
  booking_id int unique not null references bookings(id) on delete cascade,
  rating int not null,
  comment text not null default '',
  review_invited_at timestamptz,
  created_at timestamptz not null default now()
);
`;

/** The SQL client, with tables created on first use. */
export async function db(): Promise<Sql> {
  const sql = client();
  if (!g.__msMigrated) g.__msMigrated = sql.begin(async (tx) => { await tx`select pg_advisory_xact_lock(7290431)`; await tx.unsafe(SCHEMA); }).then(() => undefined).catch((e) => { g.__msMigrated = undefined; throw e; });
  await g.__msMigrated;
  return sql;
}

/** Runs a DB write that must never break the public site (e.g. saving a copy of a form). */
export async function safeWrite(fn: (sql: Sql) => Promise<unknown>) {
  if (!hasDb) return;
  try { await fn(await db()); } catch (e) { console.error("[db] write failed", e); }
}

export async function audit(userId: number | null, action: string, detail = "") {
  await safeWrite((sql) => sql`insert into audit_log (user_id, action, detail) values (${userId}, ${action}, ${detail.slice(0, 2000)})`);
}

/** Tagged-template shortcut: `await q<Row[]>\`select …\`` (runs on the migrated client). */
export function q<T = Record<string, unknown>[]>(strings: TemplateStringsArray, ...values: unknown[]): Promise<T> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return db().then((sql) => (sql as any)(strings, ...values) as Promise<T>);
}
