// MacroSnaps CRM connector: a remote MCP server (Streamable HTTP, JSON responses) so Claude can run the admin panel
// from any chat, without a browser. The secret lives in the URL path and is set as MCP_KEY in Vercel; nothing works
// without it. Every action runs as an admin user (MCP_ACT_AS, else the first owner) and is written to the activity log.
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { actingAs, type User } from "@/lib/auth";
import { q, audit, db } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { bookingFromInvoice } from "@/lib/invoiceBooking";
import { replyInquiry, updateInquiry } from "@/app/admin/(panel)/inbox/actions";
import { createInvoice, invoiceEmailAction, invoiceAction } from "@/app/admin/(panel)/invoices/actions";
import { addPhotographer, requestFiles, sendAssignment } from "@/app/admin/(panel)/photographers/actions";
import { sendNew, voidContract } from "@/app/admin/(panel)/contracts/actions";
import { importContacts, importOrders, type ContactIn, type OrderIn } from "@/lib/crmImport";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

type Json = Record<string, unknown>;
type Tool = { name: string; description: string; inputSchema: Json; readOnly?: boolean; run: (a: Json) => Promise<unknown> };

const str = (v: unknown, n = 2000) => String(v ?? "").slice(0, n);
const form = (o: Record<string, unknown>) => {
  const f = new FormData();
  for (const [k, v] of Object.entries(o)) {
    if (v === undefined || v === null || v === false) continue;
    if (Array.isArray(v)) for (const x of v) f.append(k, String(x));
    else f.append(k, v === true ? "on" : String(v));
  }
  return f;
};
/** Server actions that end in redirect() throw NEXT_REDIRECT; turn that into a normal result. */
async function act<T>(fn: () => Promise<T>): Promise<T | { redirect: string }> {
  try { return await fn(); } catch (e) {
    const d = (e as { digest?: string })?.digest;
    if (typeof d === "string" && d.startsWith("NEXT_REDIRECT")) return { redirect: d.split(";")[2] ?? "" };
    throw e;
  }
}
const obj = (props: Json, required: string[] = []) => ({ type: "object", properties: props, required, additionalProperties: false });
const S = (description: string) => ({ type: "string", description });
const N = (description: string) => ({ type: "number", description });
const B = (description: string) => ({ type: "boolean", description });

const TOOLS: Tool[] = [
  {
    name: "dashboard", readOnly: true,
    description: "Overview: new inbox messages, bookings in the last 7 days, unpaid booking requests, upcoming shoots (30 days) and open invoices.",
    inputSchema: obj({}),
    run: async () => {
      const [inbox, recent, upcoming] = await Promise.all([
        q`select id, name, email, data->>'subject' as subject, created_at from inquiries where kind = 'contact' and status = 'new' order by id desc limit 20`,
        q`select ref, customer_name, email, service_name, city, status, total_cents, first_date, created_at from bookings where created_at > now() - interval '7 days' order by id desc`,
        q`select ref, customer_name, service_name, city, status, first_date, schedule from bookings where first_date between current_date and current_date + 30 and status not in ('cancelled','refunded') order by first_date`,
      ]);
      const open = stripe ? (await stripe.invoices.list({ status: "open", limit: 20 })).data.map((i) => ({ id: i.id, number: i.number, to: i.customer_email, amount_due: i.amount_due / 100, due: i.due_date ? new Date(i.due_date * 1000).toISOString().slice(0, 10) : null })) : [];
      return { new_inbox_messages: inbox, bookings_last_7_days: recent, upcoming_shoots: upcoming, open_invoices: open };
    },
  },
  {
    name: "list_inbox", readOnly: true,
    description: "Website contact messages and careers applications, newest first.",
    inputSchema: obj({ status: S("new | in_progress | done | rejected (optional)"), kind: S("contact | application (optional)"), search: S("Name, email or text to find (optional)"), limit: N("Max rows, default 30") }),
    run: async (a) => {
      const st = str(a.status, 20) || null, kind = str(a.kind, 20) || null, s = a.search ? `%${str(a.search, 100)}%` : null;
      return q`select id, kind, name, email, phone, status, data->>'subject' as subject, created_at from inquiries
        where (${st}::text is null or status = ${st}) and (${kind}::text is null or kind = ${kind})
          and (${s}::text is null or name ilike ${s} or email ilike ${s} or data::text ilike ${s})
        order by id desc limit ${Math.min(100, Number(a.limit) || 30)}`;
    },
  },
  {
    name: "get_message", readOnly: true,
    description: "Full inbox message (contact or application) with internal notes and reply history.",
    inputSchema: obj({ id: N("Inbox message id") }, ["id"]),
    run: async (a) => (await q`select * from inquiries where id = ${Number(a.id)}`)[0] ?? { error: "Not found" },
  },
  {
    name: "reply_to_message",
    description: "Email a branded MacroSnaps reply to an inbox message (from info@e.macrosnaps.com; their reply comes to info@macrosnaps.com; the sign-off is added automatically). Marks it in progress and logs the reply.",
    inputSchema: obj({ id: N("Inbox message id"), subject: S("Email subject"), message: S("Plain-text body, without sign-off"), book_button: B("Add a 'Book your date online' button") }, ["id", "subject", "message"]),
    run: (a) => act(() => replyInquiry(undefined, form({ id: a.id, subject: a.subject, message: a.message, book: a.book_button === true }))),
  },
  {
    name: "update_message_status",
    description: "Set an inbox message's status (new, in_progress, done, rejected) and replace its internal notes.",
    inputSchema: obj({ id: N("Inbox message id"), status: S("new | in_progress | done | rejected"), notes: S("Internal notes (replaces existing; read them first with get_message)") }, ["id", "status"]),
    run: async (a) => {
      const notes = a.notes !== undefined ? str(a.notes, 10000) : ((await q<{ notes: string }[]>`select notes from inquiries where id = ${Number(a.id)}`)[0]?.notes ?? "");
      await act(() => updateInquiry(form({ id: a.id, status: a.status, notes })));
      return { ok: true };
    },
  },
  {
    name: "list_bookings", readOnly: true,
    description: "Website bookings, newest first.",
    inputSchema: obj({ status: S("requested | pending_payment | paid | confirmed | completed | cancelled | refunded (optional)"), search: S("Name, email, ref or city (optional)"), limit: N("Max rows, default 30") }),
    run: async (a) => {
      const st = str(a.status, 30) || null, s = a.search ? `%${str(a.search, 100)}%` : null;
      return q`select id, ref, status, stage, service_name, customer_name, email, phone, company, city, venue_address, first_date, schedule, total_cents, created_at from bookings
        where (${st}::text is null or status = ${st}) and (${s}::text is null or customer_name ilike ${s} or email ilike ${s} or ref ilike ${s} or city ilike ${s})
        order by id desc limit ${Math.min(100, Number(a.limit) || 30)}`;
    },
  },
  {
    name: "get_booking", readOnly: true,
    description: "Full booking: schedule, price lines, notes, signed terms and crew assigned.",
    inputSchema: obj({ ref: S("Booking ref, e.g. MS-VZR461B99, or numeric id") }, ["ref"]),
    run: async (a) => {
      const r = str(a.ref, 40);
      const [b] = await q`select * from bookings where ref = ${r} or id::text = ${r}`;
      if (!b) return { error: "Not found" };
      const crew = await q`select u.name, u.email from crew_assignments c join users u on u.id = c.user_id where c.booking_id = ${(b as { id: number }).id}`.catch(() => []);
      return { ...b, crew };
    },
  },
  {
    name: "list_invoices", readOnly: true,
    description: "Stripe invoices, newest first.",
    inputSchema: obj({ status: S("draft | open | paid | void | uncollectible (optional)"), email: S("Customer email (optional)"), limit: N("Max rows, default 20") }),
    run: async (a) => {
      if (!stripe) return { error: "Stripe isn't connected." };
      let customer: string | undefined;
      if (a.email) { customer = (await stripe.customers.list({ email: str(a.email, 200), limit: 1 })).data[0]?.id; if (!customer) return []; }
      const st = str(a.status, 20) as "draft" | "open" | "paid" | "void" | "uncollectible" | "";
      const r = await stripe.invoices.list({ limit: Math.min(100, Number(a.limit) || 20), ...(st ? { status: st } : {}), ...(customer ? { customer } : {}) });
      return r.data.map((i) => ({ id: i.id, number: i.number, status: i.status, to: i.customer_email, name: i.customer_name, total: i.total / 100, amount_due: i.amount_due / 100, due: i.due_date ? new Date(i.due_date * 1000).toISOString().slice(0, 10) : null, memo: i.description, created: new Date(i.created * 1000).toISOString() }));
    },
  },
  {
    name: "create_invoice",
    description: "Create a MacroSnaps invoice in Stripe. send=false saves a draft (use preview_invoice_email, then send_invoice); send=true finalizes it and emails it from MacroSnaps right away. Bill to a company with company + address; the contact name is shown as Attn.",
    inputSchema: obj({
      first_name: S("Contact first name"), last_name: S("Contact last name"), email: S("Customer email"), phone: S("Optional"),
      company: S("Bill-to company (optional)"), line1: S("Address line 1 (optional)"), line2: S("Optional"), city: S("Optional"), state: S("Optional"), zip: S("Optional"),
      lines: { type: "array", description: "Invoice lines", items: obj({ description: S("Line description"), quantity: N("Quantity, default 1"), price: N("Unit price in USD") }, ["description", "price"]) },
      memo: S("Note shown on the invoice (optional)"), due_in_days: N("0 = due today; default 7"), send: B("true = finalize and email now; false = draft"),
    }, ["first_name", "last_name", "email", "lines", "send"]),
    run: async (a) => {
      const lines = (Array.isArray(a.lines) ? a.lines : []) as Json[];
      const r = await act(() => createInvoice(undefined, form({
        firstName: a.first_name, lastName: a.last_name, email: a.email, phone: a.phone, company: a.company, line1: a.line1, line2: a.line2, city: a.city, state: a.state, zip: a.zip,
        desc: lines.map((l) => str(l.description, 250)), qty: lines.map((l) => Number(l.quantity) || 1), price: lines.map((l) => Number(l.price) || 0),
        memo: a.memo, days: a.due_in_days ?? 7, send: a.send === true ? "1" : "0",
      })));
      const id = (r as { redirect?: string })?.redirect?.match(/in_[A-Za-z0-9]+/)?.[0];
      return id ? { ok: true, invoice_id: id, sent: a.send === true, admin_url: `https://www.macrosnaps.com/admin/invoices/${id}` } : r;
    },
  },
  {
    name: "preview_invoice_email", readOnly: true,
    description: "Show the exact email (subject and text) the client would receive for an invoice, without sending.",
    inputSchema: obj({ id: S("Stripe invoice id (in_…)") }, ["id"]),
    run: async (a) => {
      const r = await invoiceEmailAction(undefined, form({ id: a.id, mode: "preview" }));
      if (r && "html" in r && r.html) return { to: r.to, subject: r.subject, text: r.html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[#\w]+;/g, " ").replace(/\s+/g, " ").trim() };
      return r;
    },
  },
  {
    name: "send_invoice",
    description: "Email an invoice from MacroSnaps (finalizes a draft first; a finalized invoice can't be edited).",
    inputSchema: obj({ id: S("Stripe invoice id (in_…)") }, ["id"]),
    run: (a) => invoiceEmailAction(undefined, form({ id: a.id, mode: "send" })),
  },
  {
    name: "void_invoice",
    description: "Void an open invoice (it can no longer be paid). Use when replacing an invoice.",
    inputSchema: obj({ id: S("Stripe invoice id (in_…)") }, ["id"]),
    run: async (a) => { await act(() => invoiceAction(form({ id: a.id, op: "void" }))); return { ok: true }; },
  },
  {
    name: "list_photographers", readOnly: true,
    description: "Team members (photographers/videographers) with phone, city, roles, contract and payout status.",
    inputSchema: obj({ search: S("Name, email or city (optional)") }),
    run: async (a) => {
      const s = a.search ? `%${str(a.search, 100)}%` : null;
      return q`select u.id, u.name, u.email, u.active, p.phone, p.city, p.roles, p.contract_signed_at is not null as contract_signed, p.payout_method, p.w9_signed_at is not null as w9_done
        from users u left join staff_profiles p on p.user_id = u.id where u.role = 'staff' and (${s}::text is null or u.name ilike ${s} or u.email ilike ${s} or p.city ilike ${s}) order by u.name`;
    },
  },
  {
    name: "add_photographer",
    description: "Add a hired photographer/videographer to the team and email their welcome with an account setup link. If they already signed a contract it's linked; send_contract=true also sends the agreement.",
    inputSchema: obj({ full_name: S("First and last name"), email: S("Email"), phone: S("Optional"), city: S("Optional"), role: S("Photographer | Videographer | Both"), send_contract: B("Also send the contractor agreement for e-signature") }, ["full_name", "email"]),
    run: (a) => addPhotographer(undefined, form({ name: a.full_name, email: a.email, phone: a.phone, city: a.city, role: str(a.role, 20) || "Photographer", contract: a.send_contract === true })),
  },
  {
    name: "send_shoot_assignment",
    description: "Confirm a shoot to a photographer: mode=preview returns the email, mode=send emails it, mode=save only adds it to their portal. Saved assignments appear under My shoots and trigger the Drive-link request an hour after the shoot ends.",
    inputSchema: obj({
      mode: S("preview | send | save"), name: S("Photographer name"), email: S("Photographer email"),
      type: S("e.g. Conference Photography: Event name"), dates: S("e.g. Thursday, November 12, 2026"), shoot_date: S("Last shoot day, YYYY-MM-DD"), city: S("e.g. Davis, CA"),
      pay: S("e.g. $475 + $50 travel ($525 total)"), sessions: S("One per line: 'Thursday, November 12 | 9:00 AM – 6:00 PM (9 hours)'"), location: S("Venue and address"), scope: S("Scope of work, one item per line (optional; a default is used)"),
    }, ["mode", "name", "email", "type", "dates", "shoot_date", "pay", "sessions", "location"]),
    run: async (a) => {
      const member = (await q<{ id: number }[]>`select id from users where lower(email) = ${str(a.email, 200).toLowerCase()} and role = 'staff'`)[0]?.id;
      const r = await sendAssignment(undefined, form({ member: member ?? "", name: a.name, email: a.email, type: a.type, dates: a.dates, shootDate: a.shoot_date, city: a.city, pay: a.pay, sessions: a.sessions, location: a.location, scope: a.scope, mode: a.mode }));
      if (r && "preview" in r && r.preview) return { to: r.preview.to, subject: r.preview.subject, text: r.preview.html.replace(/<style[\s\S]*?<\/style>/g, "").replace(/<[^>]+>/g, " ").replace(/&[#\w]+;/g, " ").replace(/\s+/g, " ").trim() };
      return r;
    },
  },
  {
    name: "request_files",
    description: "Ask a photographer to upload a shoot's photos: emails them a Google Drive link request due in 24 hours, with a reminder and an alert to the team if late.",
    inputSchema: obj({ name: S("Photographer name"), email: S("Photographer email"), shoot: S("Shoot name"), date: S("Shoot date, YYYY-MM-DD") }, ["name", "email", "shoot", "date"]),
    run: (a) => requestFiles(undefined, form({ name: a.name, email: a.email, shoot: a.shoot, date: a.date })),
  },
  {
    name: "list_file_requests", readOnly: true,
    description: "Photo upload requests sent to photographers and whether the Drive link arrived.",
    inputSchema: obj({ limit: N("Max rows, default 30") }),
    run: async (a) => q`select id, name, email, shoot, shoot_date, due_at, drive_link, drive_link_at, reminded_at, overdue_at, created_at from file_requests order by id desc limit ${Math.min(100, Number(a.limit) || 30)}`,
  },
  {
    name: "list_assignments", readOnly: true,
    description: "Shoots assigned to photographers by email (not website bookings), with the Drive-link status.",
    inputSchema: obj({ limit: N("Max rows, default 30") }),
    run: async (a) => q`select a.id, a.name, a.email, a.type, a.dates, a.city, a.pay, a.shoot_date, a.emailed, a.drive_asked_at, fr.drive_link from assignments a left join file_requests fr on fr.id = a.file_request_id order by a.id desc limit ${Math.min(100, Number(a.limit) || 30)}`,
  },
  {
    name: "send_contract",
    description: "Send the Contractor Photographer & Videographer Agreement for e-signature (signed on MacroSnaps' side automatically). When they sign they're added to the team.",
    inputSchema: obj({ full_name: S("Their full legal name"), email: S("Their email") }, ["full_name", "email"]),
    run: (a) => sendNew(undefined, form({ name: a.full_name, email: a.email, signer: "MacroSnaps" })),
  },
  {
    name: "void_contract",
    description: "Void a contract that hasn't been signed (its signing link stops working).",
    inputSchema: obj({ id: N("Contract number, e.g. 4 for MS-C4") }, ["id"]),
    run: async (a) => { await act(() => voidContract(form({ id: a.id }))); return { ok: true }; },
  },
  {
    name: "list_contracts", readOnly: true,
    description: "Contractor agreements and their status (sent, viewed, signed, voided).",
    inputSchema: obj({}),
    run: async () => q`select id, signer_name, signer_email, status, sent_at, viewed_at, signed_at from contracts order by id desc limit 100`,
  },
  {
    name: "list_sent_emails", readOnly: true,
    description: "Emails the website and portal sent (to clients, photographers and the team), newest first.",
    inputSchema: obj({ search: S("Recipient or subject text (optional)"), limit: N("Max rows, default 30") }),
    run: async (a) => {
      const s = a.search ? `%${str(a.search, 100)}%` : null;
      const rows = await q<{ id: number; to_addr: string; subject: string; status: string; error: string | null; created_at: string; html: string | null }[]>`select id, to_addr, subject, status, error, created_at, html from email_log where (${s}::text is null or to_addr ilike ${s} or subject ilike ${s}) order by id desc limit ${Math.min(100, Number(a.limit) || 30)}`;
      // With a search narrowed to a few emails, include each one's text so it can be read.
      const withText = !!s && rows.length <= 5;
      return rows.map(({ html, ...r }) => withText ? { ...r, text: String(html ?? "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|tr|h\d|li)>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim().slice(0, 8000) } : r);
    },
  },
  {
    name: "get_sent_email", readOnly: true,
    description: "Read one sent email (from list_sent_emails) as plain text.",
    inputSchema: obj({ id: N("email_log id") }),
    run: async (a) => {
      const [r] = await q`select id, to_addr, subject, html, created_at from email_log where id = ${Number(a.id)}`;
      if (!r) return { error: "not found" };
      const text = String(r.html ?? "").replace(/<style[\s\S]*?<\/style>/gi, "").replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|tr|h\d|li)>/gi, "\n").replace(/<[^>]+>/g, " ").replace(/&nbsp;/g, " ").replace(/&amp;/g, "&").replace(/[ \t]+/g, " ").replace(/\n\s*\n+/g, "\n").trim();
      return { id: r.id, to: r.to_addr, subject: r.subject, sent: r.created_at, text: text.slice(0, 12000) };
    },
  },
  {
    name: "add_lead",
    description: "Add a lead from another source (Sulekha, Thumbtack, a phone call…) to the CRM inbox as a contact message, so it can be tracked, replied to and invoiced. Skips duplicates: same external_id, or same email + source within 3 days. Sends nothing to the lead.",
    inputSchema: obj({
      name: S("Lead's name"), email: S("Email (optional if phone given)"), phone: S("Phone (optional)"), source: S("e.g. Sulekha"),
      service: S("What they're looking for, e.g. Wedding Videographers"), location: S("City / ZIP"), date: S("Event date if known"),
      message: S("Any details (optional)"), received_at: S("When the lead came in, ISO time (optional)"), external_id: S("The source's lead or message id, for de-duplication (optional)"),
    }, ["name", "source"]),
    run: async (a) => {
      const email = str(a.email, 200).trim().toLowerCase(), phone = str(a.phone, 40).trim(), source = str(a.source, 40).trim() || "Other";
      if (!email && !phone) return { error: "Give an email or a phone number." };
      const ext = str(a.external_id, 120).trim() || null;
      const at = a.received_at && !Number.isNaN(Date.parse(str(a.received_at, 40))) ? new Date(str(a.received_at, 40)) : new Date();
      const dupe = await q<{ id: number }[]>`select id from inquiries where kind = 'contact' and data->>'source' = ${source}
        and ((${ext}::text is not null and data->>'external_id' = ${ext}) or (${email} <> '' and lower(email) = ${email} and abs(extract(epoch from created_at - ${at})) < 259200)) limit 1`;
      if (dupe[0]) {
        // Same lead seen again: refresh contact details that are now known (e.g. a relay PIN or an unmasked email).
        if (ext) await q`update inquiries set phone = coalesce(nullif(${phone}, ''), phone), email = case when ${email} <> '' and email like '%xxxx%' then ${email} else email end where id = ${dupe[0].id}`;
        return { ok: true, duplicate: true, id: dupe[0].id };
      }
      const service = str(a.service, 120).trim(), location = str(a.location, 120).trim();
      const subject = `${source}: ${[service || "Photography request", location && `in ${location}`].filter(Boolean).join(" ")}`;
      const message = [`Lead from ${source}.`, service && `Looking for: ${service}`, location && `Location: ${location}`, a.date && `Date: ${str(a.date, 80)}`, a.message && str(a.message, 4000)].filter(Boolean).join("\n");
      const [r] = await q<{ id: number }[]>`insert into inquiries (kind, name, email, phone, data, status, created_at)
        values ('contact', ${str(a.name, 100).trim() || "Unknown"}, ${email}, ${phone || null},
          ${(await db()).json({ source, subject, message, date: str(a.date, 80), location, service, external_id: ext, page: source })}, 'new', ${at}) returning id`;
      if (email) await (await import("@/lib/leadSync")).syncLeadsToClients(email).catch(() => 0);
      return { ok: true, id: r.id, subject };
    },
  },
  {
    name: "import_contacts",
    description: "Bulk add or update CRM contacts from another system (e.g. Wix). Matches by source + external_id, then email; fills blanks only, never overwrites. Up to 500 per call. Sends nothing.",
    inputSchema: obj({
      source: S("e.g. Wix"),
      contacts: { type: "array", items: { type: "object", properties: {
        external_id: S("Id in the source system"), first_name: S(""), last_name: S(""), email: S(""), phone: S(""), company: S(""), address: S("One-line address"),
        labels: { type: "array", items: { type: "string" } }, created_at: S("ISO time"), last_activity_at: S("ISO time"), notes: S(""),
      } } },
    }, ["source", "contacts"]),
    run: async (a) => importContacts(str(a.source, 40), Array.isArray(a.contacts) ? (a.contacts as ContactIn[]) : []),
  },
  {
    name: "import_orders",
    description: "Bulk add or update past orders from another system (e.g. Wix Stores / Wix Invoices). Unique per source + external_id, so re-importing updates. Links each order to its contact (contact_external_id, else email; creates the contact if new). Money in dollars. Up to 500 per call. Sends nothing.",
    inputSchema: obj({
      source: S("e.g. Wix"),
      orders: { type: "array", items: { type: "object", properties: {
        external_id: S("Order id in the source"), number: S("Order number"), created_at: S("ISO time"), contact_external_id: S(""), name: S("Buyer name"), email: S(""), phone: S(""),
        status: S(""), payment_status: S(""), fulfillment_status: S(""), channel: S("e.g. WIX_INVOICES, WEB"), currency: S(""),
        subtotal: N(""), tax: N(""), discount: N(""), total: N(""), paid: N(""), refunded: N(""), balance: N(""),
        items: { type: "array", items: { type: "object", properties: { name: S(""), qty: N(""), price: N("Unit price, dollars"), options: S("") } } }, notes: S(""),
        company: S("Client company"), event: S("Event or conference name"), location: S("Venue / address"), event_date: S("Event date and times as text"),
      }, required: ["external_id"] } },
    }, ["source", "orders"]),
    run: async (a) => importOrders(str(a.source, 40), Array.isArray(a.orders) ? (a.orders as OrderIn[]) : []),
  },
  {
    name: "import_contractors",
    description: "Quietly add contractors who already signed an agreement elsewhere (Adobe Sign, email) to the team, with city and roles. Sends NO email; they can use 'Forgot password' or get a welcome later. Skips anyone already on the team.",
    inputSchema: obj({
      contractors: { type: "array", items: { type: "object", properties: {
        name: S("Full name"), email: S(""), phone: S(""), city: S("City, ST"), roles: { type: "array", items: { type: "string" } }, signed_on: S("Date the agreement was signed (YYYY-MM-DD)"), source: S("e.g. Adobe Sign"),
      }, required: ["name", "email"] } },
    }, ["contractors"]),
    run: async (a) => {
      const { hashPassword } = await import("@/lib/auth");
      const { resolveCity } = await import("@/lib/geo");
      const { randomBytes } = await import("crypto");
      const list = (Array.isArray(a.contractors) ? a.contractors : []).slice(0, 300) as Json[];
      const out = { added: [] as string[], skipped: [] as string[] };
      for (const c of list) {
        const email = str(c.email, 200).trim().toLowerCase();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { out.skipped.push(`${str(c.name, 80)} (no email)`); continue; }
        if ((await q`select 1 from users where lower(email) = ${email}`).length) { out.skipped.push(`${email} (already on team)`); continue; }
        const cityText = str(c.city, 80).trim();
        const city = cityText ? resolveCity(cityText) : undefined;
        const roles = (Array.isArray(c.roles) ? c.roles : ["Photographer"]).map((r) => str(r, 20)).filter((r) => ["Photographer", "Videographer"].includes(r));
        const signed = c.signed_on && !Number.isNaN(Date.parse(str(c.signed_on, 20))) ? new Date(str(c.signed_on, 20)) : null;
        const [u] = await q<{ id: number }[]>`insert into users (email, name, password_hash, role) values (${email}, ${str(c.name, 100).trim()}, ${await hashPassword(randomBytes(24).toString("hex"))}, 'staff') returning id`;
        await q`insert into staff_profiles (user_id, phone, city, lat, lng, roles, contract_version, contract_signature, contract_signed_at)
          values (${u.id}, ${str(c.phone, 40) || null}, ${city ? (city.name.includes(",") ? city.name : `${city.name}, ${city.state}`) : cityText || null}, ${city?.lat ?? null}, ${city?.lng ?? null}, ${roles.length ? roles : ["Photographer"]},
            ${signed ? `external:${str(c.source, 40) || "signed elsewhere"}` : null}, ${signed ? str(c.name, 100) : null}, ${signed})`;
        out.added.push(email);
      }
      return out;
    },
  },
  {
    name: "import_signed_contract",
    description: "Store an already-signed contractor agreement PDF (e.g. from Adobe Sign) on the contractor's profile. Adds the contractor quietly if they're not on the team. Skips duplicates by external_id. Sends NO email.",
    inputSchema: obj({
      name: S("Contractor name"), email: S(""), phone: S(""), title: S("Agreement title"), role: S("Photographer or Videographer"),
      signed_at: S("ISO date/time signed"), external_id: S("e.g. gmail message id"), pdf_base64: S("The signed PDF, base64"),
    }, ["name", "email", "signed_at", "external_id", "pdf_base64"]),
    run: async (a) => {
      const { hashPassword } = await import("@/lib/auth");
      const { randomBytes, createHash } = await import("crypto");
      const email = str(a.email, 200).trim().toLowerCase();
      const name = str(a.name, 100).trim();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !name) return { error: "Need name and email" };
      const pdf = Buffer.from(str(a.pdf_base64, 12_000_000), "base64");
      if (pdf.length < 100 || pdf.subarray(0, 4).toString() !== "%PDF") return { error: "Not a PDF" };
      const signedAt = new Date(str(a.signed_at, 40));
      if (Number.isNaN(signedAt.getTime())) return { error: "Bad signed_at" };
      const tokenHash = createHash("sha256").update(`external:${str(a.external_id, 200)}`).digest("hex");
      if ((await q`select 1 from contracts where token_hash = ${tokenHash}`).length) return { ok: true, skipped: "already imported" };
      const role = /video/i.test(str(a.role, 40) + str(a.title, 200)) ? "Videographer" : "Photographer";
      let [u] = await q<{ id: number; name: string }[]>`select id, name from users where lower(email) = ${email} or ${email} = any(alt_emails) order by id limit 1`;
      let created = false;
      if (!u) {
        [u] = await q<{ id: number; name: string }[]>`insert into users (email, name, password_hash, role) values (${email}, ${name}, ${await hashPassword(randomBytes(24).toString("hex"))}, 'staff') returning id, name`;
        await q`insert into staff_profiles (user_id, phone, roles) values (${u.id}, ${str(a.phone, 40) || null}, ${[role]}) on conflict do nothing`;
        created = true;
      }
      await q`update staff_profiles set contract_signed_at = coalesce(contract_signed_at, ${signedAt}), contract_version = coalesce(contract_version, 'external:Adobe Sign'), contract_signature = coalesce(contract_signature, ${name}) where user_id = ${u.id}`;
      const [c] = await q<{ id: number }[]>`insert into contracts (user_id, signer_name, signer_email, signer_phone, doc_title, doc_version, doc_sections, company_signer, company_signed_at, token_hash, status, sent_at, signed_at, signed_name, consent, pdf, pdf_sha256)
        values (${u.id}, ${name}, ${email}, ${str(a.phone, 40) || null}, ${str(a.title, 200) || "Contractor Agreement"}, 'external:Adobe Sign', ${JSON.stringify([])}::jsonb, 'MacroHype LLC', ${signedAt}, ${tokenHash}, 'signed', ${signedAt}, ${signedAt}, ${name}, true, ${pdf}, ${createHash("sha256").update(pdf).digest("hex")})
        returning id`;
      return { ok: true, contract_id: c.id, user: u.name, created };
    },
  },
  {
    name: "undo_contract_import",
    description: "Delete contracts imported with import_signed_contract for a signer email (to fix a bad import), and remove that team member if they were created by the import and have nothing else. Sends nothing.",
    inputSchema: obj({ email: S("Signer email used in the bad import") }, ["email"]),
    run: async (a) => {
      const email = str(a.email, 200).toLowerCase();
      const del = await q<{ user_id: number | null }[]>`delete from contracts where lower(signer_email) = ${email} and doc_version = 'external:Adobe Sign' returning user_id`;
      const [u] = await q<{ id: number }[]>`select id from users where lower(email) = ${email} and role = 'staff'`;
      let removedUser = false;
      if (u) {
        const [busy] = await q<{ n: number }[]>`select (select count(*) from contracts where user_id = ${u.id}) + (select count(*) from payouts where user_id = ${u.id}) as n`;
        if (Number(busy.n) === 0) { await q`delete from users where id = ${u.id}`; removedUser = true; }
      }
      return { ok: true, contracts_deleted: del.length, removed_user: removedUser };
    },
  },
  {
    name: "merge_staff",
    description: "Merge a duplicate team member into another (same person, two emails). Moves contracts, payouts, assignments and everything else, fills blank profile fields, keeps the second email as an alternate, then deletes the duplicate. Sends nothing.",
    inputSchema: obj({ keep_id: N("User id to keep"), merge_id: N("Duplicate user id to merge in and delete") }, ["keep_id", "merge_id"]),
    run: async (a) => {
      const keep = Number(a.keep_id), merge = Number(a.merge_id);
      if (!keep || !merge || keep === merge) return { error: "Bad ids" };
      const sql = await db();
      const users = await sql<{ id: number; email: string; role: string }[]>`select id, email, role from users where id in (${keep}, ${merge})`;
      if (users.length !== 2 || users.some((u) => u.role !== "staff")) return { error: "Both must be staff users" };
      const mergeEmail = users.find((u) => u.id === merge)!.email;
      const fks = await sql<{ table_name: string; column_name: string }[]>`
        select kcu.table_name, kcu.column_name from information_schema.table_constraints tc
        join information_schema.key_column_usage kcu on kcu.constraint_name = tc.constraint_name and kcu.table_schema = tc.table_schema
        join information_schema.constraint_column_usage ccu on ccu.constraint_name = tc.constraint_name and ccu.table_schema = tc.table_schema
        where tc.constraint_type = 'FOREIGN KEY' and ccu.table_name = 'users' and ccu.column_name = 'id' and tc.table_schema = 'public'`;
      const moved: Record<string, number> = {};
      for (const f of fks) {
        if (f.table_name === "staff_profiles") continue;
        try {
          const r = await sql`update ${sql(f.table_name)} set ${sql(f.column_name)} = ${keep} where ${sql(f.column_name)} = ${merge}`;
          if (r.count) moved[`${f.table_name}.${f.column_name}`] = r.count;
        } catch { /* unique per-user rows (sessions, tokens): left to cascade */ }
      }
      const cols = await sql<{ column_name: string; data_type: string }[]>`select column_name, data_type from information_schema.columns where table_name = 'staff_profiles' and table_schema = 'public'`;
      const [hasKeep] = await sql`select 1 from staff_profiles where user_id = ${keep}`;
      if (!hasKeep) await sql`update staff_profiles set user_id = ${keep} where user_id = ${merge}`;
      else {
        for (const c of cols) {
          if (["user_id", "updated_at"].includes(c.column_name)) continue;
          const col = sql(c.column_name);
          if (c.data_type === "ARRAY") await sql`update staff_profiles k set ${col} = (select array(select distinct unnest(k.${col} || m.${col}))) from staff_profiles m where k.user_id = ${keep} and m.user_id = ${merge}`;
          else if (c.data_type === "text") await sql`update staff_profiles k set ${col} = coalesce(nullif(k.${col}, ''), m.${col}) from staff_profiles m where k.user_id = ${keep} and m.user_id = ${merge}`;
          else await sql`update staff_profiles k set ${col} = coalesce(k.${col}, m.${col}) from staff_profiles m where k.user_id = ${keep} and m.user_id = ${merge}`;
        }
      }
      await sql`update users set alt_emails = array(select distinct unnest(alt_emails || ${[mergeEmail.toLowerCase()]}::text[])) where id = ${keep}`;
      await sql`delete from users where id = ${merge}`;
      return { ok: true, kept: keep, merged_email: mergeEmail, moved };
    },
  },
  {
    name: "update_staff_details",
    description: "Fill team members' profile details from their application (gear/kit, shoot types, T-shirt size, car, bio, address, travel, headshot link). Matches by email (or alternate email). Only fills blank fields unless overwrite is true. Sends nothing.",
    inputSchema: obj({
      people: { type: "array", items: obj({ email: S(""), gear: S(""), shoot_types: { type: "array", items: { type: "string" } }, tshirt_size: S(""), has_car: { type: "boolean" }, bio: S(""), address: S(""), travel: S(""), headshot_url: S("") }, ["email"]) },
      overwrite: { type: "boolean" },
    }, ["people"]),
    run: async (a) => {
      const list = (Array.isArray(a.people) ? a.people : []).slice(0, 500) as Json[];
      const ow = a.overwrite === true;
      const out = { updated: 0, missing: [] as string[] };
      for (const p of list) {
        const email = str(p.email, 200).trim().toLowerCase();
        const [u] = await q<{ id: number }[]>`select id from users where lower(email) = ${email} or ${email} = any(alt_emails) order by id limit 1`;
        if (!u) { out.missing.push(email); continue; }
        await q`insert into staff_profiles (user_id) values (${u.id}) on conflict (user_id) do nothing`;
        const t = (k: string, n = 4000) => str(p[k], n).trim() || null;
        const types = Array.isArray(p.shoot_types) ? (p.shoot_types as unknown[]).map((x) => str(x, 60).trim()).filter(Boolean) : [];
        const car = typeof p.has_car === "boolean" ? p.has_car : null;
        if (ow) await q`update staff_profiles set gear = coalesce(${t("gear")}, gear), shoot_types = case when ${types.length} > 0 then ${types} else shoot_types end, tshirt_size = coalesce(${t("tshirt_size", 10)}, tshirt_size), has_car = coalesce(${car}, has_car), bio = coalesce(${t("bio")}, bio), address = coalesce(${t("address", 300)}, address), travel = coalesce(${t("travel", 120)}, travel), headshot_url = coalesce(${t("headshot_url", 500)}, headshot_url), updated_at = now() where user_id = ${u.id}`;
        else await q`update staff_profiles set gear = case when coalesce(gear, '') = '' then coalesce(${t("gear")}, '') else gear end, shoot_types = case when coalesce(cardinality(shoot_types), 0) = 0 then ${types} else (select array(select distinct unnest(shoot_types || ${types}::text[]))) end, tshirt_size = coalesce(tshirt_size, ${t("tshirt_size", 10)}), has_car = coalesce(has_car, ${car}), bio = case when coalesce(bio, '') = '' then coalesce(${t("bio")}, '') else bio end, address = coalesce(address, ${t("address", 300)}), travel = coalesce(travel, ${t("travel", 120)}), headshot_url = coalesce(headshot_url, ${t("headshot_url", 500)}), updated_at = now() where user_id = ${u.id}`;
        out.updated++;
      }
      return out;
    },
  },
  {
    name: "block_contractor",
    description: "Blacklist a person: they never get any email or text again (all their emails and phone go on the blocklist), they're deactivated on the team (can't log in, hidden from the directory and offers) and unsubscribed from newsletters.",
    inputSchema: obj({ email: S("Their email"), reason: S("") }, ["email"]),
    run: async (a) => {
      const email = str(a.email, 200).trim().toLowerCase();
      const reason = str(a.reason, 300);
      const [u] = await q<{ id: number; name: string; email: string; alt_emails: string[] }[]>`select id, name, email, alt_emails from users where lower(email) = ${email} or ${email} = any(alt_emails) order by id limit 1`;
      const emails = [...new Set([email, ...(u ? [u.email.toLowerCase(), ...(u.alt_emails ?? [])] : [])])];
      for (const e of emails) await q`insert into blocklist (value, kind, reason) values (${e}, 'email', ${reason}) on conflict (value) do nothing`;
      let phone: string | null = null;
      if (u) {
        if (u.id && (await q<{ role: string }[]>`select role from users where id = ${u.id}`)[0]?.role !== "staff") return { error: "Only team members (staff) can be blocked here" };
        await q`update users set active = false, blocked = true where id = ${u.id}`;
        await q`delete from sessions where user_id = ${u.id}`;
        const { toE164 } = await import("@/lib/sms");
        const [p] = await q<{ phone: string | null }[]>`select phone from staff_profiles where user_id = ${u.id}`;
        phone = toE164(p?.phone);
        if (phone) await q`insert into blocklist (value, kind, reason) values (${phone}, 'phone', ${reason}) on conflict (value) do nothing`;
      }
      await q`update subscribers set status = 'unsubscribed' where lower(email) = any(${emails})`;
      return { ok: true, user: u?.name ?? null, emails_blocked: emails, phone_blocked: phone };
    },
  },
  {
    name: "send_feedback_request",
    description: "Email a client the satisfaction survey (rate the photographer/videographer, booking and quality; happy clients are invited to leave a Google review; optional crew tip). Use for clients who booked outside the website. Set send=false to only create the link.",
    inputSchema: obj({
      name: S("Client name"), email: S("Client email"), phone: S(""), event: S("Event name, e.g. GSIA 2026 ENGAGE"), event_date: S("YYYY-MM-DD"), location: S(""),
      services: S("Photography, Videography or Both"), crew: { type: "array", items: obj({ name: S(""), role: S("Photographer or Videographer"), email: S("Team member email (optional)") }, ["name"]) },
      booking_ref: S("Website booking ref, if any"), send: { type: "boolean" },
    }, ["name", "email"]),
    run: async (a) => {
      const { createSurvey, sendSurvey, surveyUrl } = await import("@/lib/surveys");
      const email = str(a.email, 200).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Bad email" };
      const [blocked] = await q`select 1 from blocklist where kind = 'email' and value = ${email}`;
      if (blocked) return { error: "That email is on the blocklist" };
      let bookingId: number | null = null;
      if (a.booking_ref) bookingId = (await q<{ id: number }[]>`select id from bookings where ref = ${str(a.booking_ref, 40)}`)[0]?.id ?? null;
      const crew = [];
      for (const c of (Array.isArray(a.crew) ? a.crew : []) as Json[]) {
        const ce = str(c.email, 200).toLowerCase();
        const uid = ce ? (await q<{ id: number }[]>`select id from users where lower(email) = ${ce} or ${ce} = any(alt_emails) limit 1`)[0]?.id ?? null : null;
        crew.push({ user_id: uid, name: str(c.name, 80), role: /video/i.test(str(c.role, 20)) ? "Videographer" as const : "Photographer" as const });
      }
      const id = await createSurvey({ bookingId, name: str(a.name, 100), email, phone: str(a.phone, 40) || null, event: str(a.event, 150), eventDate: /^\d{4}-\d{2}-\d{2}$/.test(str(a.event_date, 10)) ? str(a.event_date, 10) : null, location: str(a.location, 200), services: str(a.services, 20), crew });
      const sent = a.send === false ? false : await sendSurvey(id);
      return { ok: true, survey_id: id, sent, link: surveyUrl(id) };
    },
  },
  {
    name: "import_survey_response",
    description: "Store a past satisfaction-form response (from the old Google Form) and, if invite=true, email that client the Google review invitation (no survey, no tip link). Skips duplicates and blocked emails.",
    inputSchema: obj({
      name: S(""), email: S(""), phone: S(""), submitted_at: S("ISO time the form was answered"), event_date: S("YYYY-MM-DD"), location: S(""), heard: S(""), repeat: S(""), services: S(""),
      crew: { type: "array", items: obj({ name: S(""), role: S(""), professionalism: N(""), punctuality: N("") }, ["name"]) },
      booking: N("1-5"), quality: N("1-5"), recommend: N("1-5"), comments: S(""), invite: { type: "boolean" },
    }, ["name", "email", "submitted_at"]),
    run: async (a) => {
      const { reviewThanksEmail, reviewUrl } = await import("@/lib/surveys");
      const { sendMail } = await import("@/lib/mail");
      const email = str(a.email, 200).trim().toLowerCase();
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Bad email" };
      const at = new Date(str(a.submitted_at, 40));
      if (isNaN(+at)) return { error: "Bad submitted_at" };
      const n = (v: unknown) => Math.max(0, Math.min(5, Math.round(Number(v) || 0)));
      const crew = ((Array.isArray(a.crew) ? a.crew : []) as Json[]).map((c) => ({ name: str(c.name, 80), role: str(c.role, 20) || "Photographer", professionalism: n(c.professionalism), punctuality: n(c.punctuality) }));
      const answers = { name: str(a.name, 100), email, phone: str(a.phone, 40), heard: str(a.heard, 100), event_date: str(a.event_date, 10), location: str(a.location, 200), repeat: str(a.repeat, 10), services: str(a.services, 40), crew, booking: n(a.booking), quality: n(a.quality), recommend: n(a.recommend), comments: str(a.comments, 4000), tip: "" };
      const scores = [...crew.flatMap((c) => [c.professionalism, c.punctuality]), answers.booking, answers.quality, answers.recommend].filter((x) => x > 0);
      const avg = scores.length ? scores.reduce((x, y) => x + y, 0) / scores.length : null;
      let [row] = await q<{ id: number; review_invited_at: Date | null }[]>`select id, review_invited_at from surveys where lower(email) = ${email} and submitted_at = ${at}`;
      if (!row) [row] = await q<{ id: number; review_invited_at: Date | null }[]>`insert into surveys (name, email, phone, event, event_date, location, services, crew, sent_at, submitted_at, answers, avg_rating, recommend)
        values (${answers.name}, ${email}, ${answers.phone || null}, ${"Imported from Google Form"}, ${/^\d{4}-\d{2}-\d{2}$/.test(answers.event_date) ? answers.event_date : null}, ${answers.location}, ${answers.services},
        ${(await db()).json(crew.map((c) => ({ name: c.name, role: c.role })))}, ${at}, ${at}, ${(await db()).json(answers)}, ${avg}, ${answers.recommend || null}) returning id, review_invited_at`;
      if (a.invite !== true) return { ok: true, survey_id: row.id, invited: false };
      if (row.review_invited_at) return { ok: true, survey_id: row.id, invited: false, note: "Already invited" };
      const url = await reviewUrl();
      if (!url) return { error: "Set the Google review link first" };
      const m = reviewThanksEmail(answers.name, url, null);
      const r = await sendMail({ to: email, ...m });
      if (r.ok) await q`update surveys set review_invited_at = now() where id = ${row.id}`;
      return { ok: true, survey_id: row.id, invited: r.ok, result: r };
    },
  },
  {
    name: "list_feedback", readOnly: true,
    description: "Client survey results: ratings per crew member, booking/quality/recommend scores, comments, review invitation and tips.",
    inputSchema: obj({ limit: N("Default 30") }),
    run: async (a) => q`select id, name, email, event, event_date::text, sent_at, reminded_at, submitted_at, avg_rating::text, recommend, answers, review_invited_at, tip_cents, tip_paid_at
      from surveys order by coalesce(submitted_at, created_at) desc limit ${Math.min(100, Number(a.limit) || 30)}`,
  },
  {
    name: "set_google_review_url",
    description: "Save the public Google review link used in review invitations.",
    inputSchema: obj({ url: S("https://g.page/r/.../review") }, ["url"]),
    run: async (a) => {
      const url = str(a.url, 500).trim();
      if (!/^https:\/\/\S+$/.test(url)) return { error: "Must start with https://" };
      const { revalidateTag } = await import("next/cache");
      await q`insert into settings (key, value) values ('google_review_url', ${JSON.stringify(url)}::jsonb) on conflict (key) do update set value = excluded.value, updated_at = now()`;
      revalidateTag("settings");
      return { ok: true };
    },
  },
  {
    name: "fix_team_city",
    description: "Re-resolve the city of team members whose city text matches (e.g. fix 'Washington, UT' to 'Washington, DC'). Sends nothing.",
    inputSchema: obj({ from: S("Current city text, e.g. Washington, UT"), to: S("Correct city, e.g. Washington, DC") }, ["from", "to"]),
    run: async (a) => {
      const { resolveCity } = await import("@/lib/geo");
      const c = resolveCity(str(a.to, 80));
      const label = c ? `${c.name}${c.name.includes(",") ? "" : `, ${c.state}`}` : str(a.to, 80);
      const rows = await q<{ user_id: number }[]>`update staff_profiles set city = ${label}, lat = ${c?.lat ?? null}, lng = ${c?.lng ?? null}, updated_at = now() where city = ${str(a.from, 80)} returning user_id`;
      return { ok: true, updated: rows.length, city: label };
    },
  },
  {
    name: "subscribe_clients",
    description: "Add CRM contacts to the newsletter list (Subscribers). Skips team members, people already on the list (including anyone who unsubscribed) and the excluded emails. Sends nothing.",
    inputSchema: obj({ source: S("Only contacts from this source, e.g. Wix (optional)"), exclude_emails: { type: "array", items: { type: "string" } } }),
    run: async (a) => {
      const src = str(a.source, 40) || null;
      const ex = (Array.isArray(a.exclude_emails) ? a.exclude_emails : []).map((e) => str(e, 200).trim().toLowerCase()).filter(Boolean);
      const rows = await q<{ id: number }[]>`insert into subscribers (email, name, token, source, nurture_step)
        select c.email, trim(c.first_name || ' ' || c.last_name), md5(random()::text || clock_timestamp()::text || c.id::text), 'crm-' || lower(coalesce(c.source, 'portal')), 3
        from clients c where c.email is not null and c.email like '%@%.%' and (${src}::text is null or c.source = ${src})
          and not (c.email = any(${ex}::text[])) and not exists (select 1 from users u where lower(u.email) = c.email)
        on conflict (email) do nothing returning id`;
      return { ok: true, added: rows.length };
    },
  },
  {
    name: "remove_clients",
    description: "Delete CRM contacts by email (e.g. spam that came in through a form). Contacts with past orders are kept.",
    inputSchema: obj({ emails: { type: "array", items: { type: "string" } } }, ["emails"]),
    run: async (a) => {
      const em = (Array.isArray(a.emails) ? a.emails : []).map((e) => str(e, 200).trim().toLowerCase()).filter(Boolean);
      const rows = await q<{ email: string }[]>`delete from clients c where c.email = any(${em}::text[]) and not exists (select 1 from orders o where o.client_id = c.id) returning email`;
      return { ok: true, removed: rows.map((r) => r.email) };
    },
  },
  {
    name: "create_coupon",
    description: "Create a discount code in Stripe (applied at online checkout; share /book?coupon=CODE to pre-apply it).",
    inputSchema: obj({ code: S("e.g. HOLIDAY12"), name: S("Internal name"), percent_off: N("1-90"), amount_off: N("Dollars off, instead of percent"), book_by: S("Last day, YYYY-MM-DD (Eastern)"), max_uses: N(""), new_clients_only: { type: "boolean" }, min_order: N("Dollars") }, ["code"]),
    run: async (a) => {
      const { createCoupon } = await import("@/lib/coupons");
      const by = str(a.book_by, 10);
      try {
        return await createCoupon({ code: str(a.code, 30), name: str(a.name, 40), percentOff: Number(a.percent_off) || undefined, amountOffDollars: Number(a.amount_off) || undefined,
          expiresAt: /^\d{4}-\d{2}-\d{2}$/.test(by) ? new Date(`${by}T23:59:59-05:00`) : null, maxRedemptions: Number(a.max_uses) || null, firstTimeOnly: a.new_clients_only === true, minAmountDollars: Number(a.min_order) || null });
      } catch (e) { return { error: e instanceof Error ? e.message : "Failed" }; }
    },
  },
  {
    name: "list_coupons", readOnly: true,
    description: "All discount codes with uses and expiry.",
    inputSchema: obj({}),
    run: async () => (await import("@/lib/coupons")).listCoupons(),
  },
  {
    name: "host_image",
    description: "Copy an image from a public URL (e.g. a Canva export) into our own storage for newsletters. Returns the permanent URL: …/newsletter/<name>.<jpg|png|gif> (same name replaces the file).",
    inputSchema: obj({ url: S("https://… or a data:image/jpeg;base64,… URL"), name: S("file name, e.g. thanksgiving-2026-header") }, ["url", "name"]),
    run: async (a) => {
      const { put } = await import("@vercel/blob");
      const url = str(a.url, 4_000_000);
      if (!/^(https:\/\/|data:image\/(jpeg|png);base64,)/.test(url)) return { error: "https or data:image URL required" };
      let type = "", bytes: Buffer;
      const m = url.match(/^data:(image\/(?:jpeg|png));base64,(.+)$/);
      if (m) { type = m[1]; bytes = Buffer.from(m[2], "base64"); }
      else {
        const res = await fetch(url, { redirect: "follow" });
        type = res.headers.get("content-type") ?? "";
        if (!res.ok || !type.startsWith("image/")) return { error: `fetch ${res.status} ${type}` };
        bytes = Buffer.from(await res.arrayBuffer());
      }
      const ext = type.includes("png") ? "png" : type.includes("gif") ? "gif" : "jpg";
      const name = str(a.name, 80).toLowerCase().replace(/[^a-z0-9-]+/g, "-");
      const b = await put(`newsletter/${name}.${ext}`, bytes, { access: "public", contentType: type, addRandomSuffix: false });
      return { ok: true, url: b.url };
    },
  },
  {
    name: "save_newsletter_draft",
    description: "Create (or update, with id) a newsletter draft. Nothing is sent; the owner reviews and sends it from Admin → Newsletters. Body uses the newsletter formatting language.",
    inputSchema: obj({ id: N("Existing draft id to update"), subject: S(""), preheader: S(""), body: S(""), scheduled_at: S("Optional ISO time to note as planned send time (not sent automatically unless scheduled in admin)") }, ["subject", "body"]),
    run: async (a) => {
      const subject = str(a.subject, 200), pre = str(a.preheader, 250), body = str(a.body, 60000);
      if (a.id) {
        const r = await q<{ id: number }[]>`update newsletters set subject = ${subject}, preheader = ${pre}, body = ${body}, updated_at = now() where id = ${Number(a.id)} and status in ('draft', 'failed') returning id`;
        return r.length ? { ok: true, id: r[0].id } : { error: "Not found or already sent" };
      }
      const u = await actor();
      const [r] = await q<{ id: number }[]>`insert into newsletters (subject, preheader, body, created_by) values (${subject}, ${pre}, ${body}, ${u?.id ?? null}) returning id`;
      return { ok: true, id: r.id };
    },
  },
  {
    name: "sync_leads_to_clients",
    description: "Add every lead (website inquiries, Sulekha, The Knot, WeddingWire, Thumbtack…) and every website booking to the Clients list. Skips our own addresses, team members, applicants and blocked emails. Sends nothing.",
    inputSchema: obj({}),
    run: async () => ({ ok: true, upserted: await (await import("@/lib/leadSync")).syncLeadsToClients() }),
  },
  {
    name: "find_internal_clients", readOnly: true,
    description: "CRM contacts that are really us or our team: MacroHype/MacroSnaps addresses, the owner's personal email, team members (incl. alternate emails), photographer applicants, or contacts whose name matches a team member.",
    inputSchema: obj({}),
    run: async () => q`select c.id, c.email, trim(c.first_name || ' ' || c.last_name) as name, c.source,
        (select count(*)::int from orders o where o.client_id = c.id) as orders,
        (select count(*)::int from bookings b where lower(b.email) = c.email) as bookings,
        case when c.email ~ '@(macrohype|macrosnaps|e\.macrosnaps)\.com$' or c.email in ('rehmansiddiq@gmail.com', 'macrohype@gmail.com') then 'internal email'
             when exists (select 1 from users u where u.role = 'staff' and (lower(u.email) = c.email or c.email = any(u.alt_emails))) then 'team email'
             when exists (select 1 from users u where u.role <> 'staff' and (lower(u.email) = c.email or c.email = any(u.alt_emails))) then 'admin email'
             when exists (select 1 from inquiries i where i.kind = 'application' and lower(i.email) = c.email) then 'applicant'
             else 'name matches team member' end as why
      from clients c
      where c.email ~ '@(macrohype|macrosnaps|e\.macrosnaps)\.com$' or c.email in ('rehmansiddiq@gmail.com', 'macrohype@gmail.com')
        or exists (select 1 from users u where lower(u.email) = c.email or c.email = any(u.alt_emails))
        or exists (select 1 from inquiries i where i.kind = 'application' and lower(i.email) = c.email)
        or (length(trim(c.first_name || c.last_name)) > 4 and exists (select 1 from users u where u.role = 'staff' and lower(trim(u.name)) = lower(trim(c.first_name || ' ' || c.last_name))))
      order by why, c.email`,
  },
  {
    name: "purge_clients",
    description: "Remove CRM contacts by id (and unsubscribe them from newsletters). Their past orders are detached from the client record, not deleted.",
    inputSchema: obj({ ids: { type: "array", items: { type: "number" } } }, ["ids"]),
    run: async (a) => {
      const ids = (Array.isArray(a.ids) ? a.ids : []).map(Number).filter((n) => n > 0);
      const rows = await q<{ email: string }[]>`select email from clients where id = any(${ids}::int[])`;
      const emails = rows.map((r) => r.email);
      await q`update orders set client_id = null where client_id = any(${ids}::int[])`;
      await q`delete from clients where id = any(${ids}::int[])`;
      await q`update subscribers set status = 'unsubscribed' where lower(email) = any(${emails}::text[])`;
      return { ok: true, removed: emails };
    },
  },
  {
    name: "list_clients", readOnly: true,
    description: "CRM contacts (clients) with order count and total paid, most recent activity first.",
    inputSchema: obj({ search: S("Name, email, phone or company (optional)"), limit: N("Max rows, default 30") }),
    run: async (a) => {
      const s = a.search ? `%${str(a.search, 100)}%` : null;
      return q`select c.id, trim(c.first_name || ' ' || c.last_name) as name, c.email, c.phone, c.company, c.source, c.created_at, c.last_activity_at,
          (select count(*)::int from orders o where o.client_id = c.id) as orders, (select coalesce(sum(paid_cents),0)::int from orders o where o.client_id = c.id) as paid_cents
        from clients c where not exists (select 1 from users u where lower(u.email) = c.email) and (${s}::text is null or c.first_name || ' ' || c.last_name ilike ${s} or c.email ilike ${s} or c.phone ilike ${s} or c.company ilike ${s})
        order by c.last_activity_at desc nulls last, c.id desc limit ${Math.min(200, Number(a.limit) || 30)}`;
    },
  },
  {
    name: "get_client", readOnly: true,
    description: "One contact with their past orders, bookings and inbox messages.",
    inputSchema: obj({ id: N("Client id") }, ["id"]),
    run: async (a) => {
      const [c] = await q<{ id: number; email: string | null }[]>`select * from clients where id = ${Number(a.id)}`;
      if (!c) return { error: "Not found" };
      const e = c.email ?? "";
      const [orders, bookings, inbox] = await Promise.all([
        q`select id, source, number, created_at, payment_status, fulfillment_status, total_cents, paid_cents, balance_cents, items from orders where client_id = ${c.id} order by created_at desc`,
        e ? q`select ref, service_name, city, status, total_cents, first_date, created_at from bookings where lower(email) = ${e} order by created_at desc` : [],
        e ? q`select id, status, data->>'subject' as subject, created_at from inquiries where lower(email) = ${e} order by id desc` : [],
      ]);
      return { client: c, orders, bookings, inbox };
    },
  },
  {
    name: "list_orders", readOnly: true,
    description: "Past orders imported from earlier systems (Wix), newest first.",
    inputSchema: obj({ search: S("Name, email, order number or item (optional)"), payment_status: S("e.g. PAID, NOT_PAID (optional)"), limit: N("Max rows, default 30") }),
    run: async (a) => {
      const s = a.search ? `%${str(a.search, 100)}%` : null, ps = str(a.payment_status, 30) || null;
      return q`select id, source, number, client_id, name, email, company, event, location, event_date, notes, created_at, payment_status, fulfillment_status, total_cents, paid_cents, balance_cents, items
        from orders where (${ps}::text is null or payment_status = ${ps}) and (${s}::text is null or name ilike ${s} or email ilike ${s} or number ilike ${s} or items::text ilike ${s} or company ilike ${s} or event ilike ${s} or location ilike ${s})
        order by created_at desc limit ${Math.min(200, Number(a.limit) || 30)}`;
    },
  },
  {
    name: "import_payouts",
    description: "Record past payouts (e.g. from Cash App or Venmo history) against team members. Matches by email, then by name; unmatched rows are kept under the payee's name. Skips rows whose external_id was already imported. Sends NO email or notification.",
    inputSchema: obj({
      payouts: { type: "array", items: obj({
        name: S("Payee name as shown in the app"), email: S(""), amount: N("Dollars"), paid_on: S("YYYY-MM-DD"), method: S("Cash App, Venmo…"), note: S(""), external_id: S("Unique id for dedupe"),
      }, ["name", "amount", "paid_on"]) },
      dry_run: { type: "boolean", description: "Only report matches" },
    }, ["payouts"]),
    run: async (a) => {
      const u = await actor();
      if (!u) return { error: "No admin user" };
      const rows = Array.isArray(a.payouts) ? (a.payouts as Json[]).slice(0, 500) : [];
      const staff = await q<{ id: number; name: string; email: string }[]>`select u.id, u.name, lower(u.email) as email from users u where u.role in ('staff','admin','owner')`;
      const norm = (x: string) => x.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z\s]/g, " ").replace(/\b(jr|sr|ii|iii)\b/g, " ").replace(/\s+/g, " ").trim();
      const find = (name: string, email: string) => {
        if (email) { const e = staff.find((s) => s.email === email.toLowerCase()); if (e) return e; }
        const n = norm(name); if (!n) return undefined;
        const exact = staff.filter((s) => norm(s.name) === n); if (exact.length === 1) return exact[0];
        const t = n.split(" ");
        if (t.length >= 2) { const fl = staff.filter((s) => { const st = norm(s.name).split(" "); return st[0] === t[0] && st[st.length - 1] === t[t.length - 1]; }); if (fl.length === 1) return fl[0]; }
        const sub = staff.filter((s) => { const sn = norm(s.name); return t.length >= 2 && (sn.startsWith(n + " ") || n.startsWith(sn + " ")); }); if (sub.length === 1) return sub[0];
        return undefined;
      };
      const out = { added: 0, skipped: 0, matched: [] as string[], unmatched: [] as string[] };
      for (const r of rows) {
        const name = str(r.name, 120).trim(); const date = str(r.paid_on, 10); const cents = Math.round(Number(r.amount) * 100);
        if (!name || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !(cents > 0)) { out.skipped++; continue; }
        const m = find(name, str(r.email, 200));
        (m ? out.matched : out.unmatched).push(m ? `${name} → ${m.name}` : name);
        if (a.dry_run) continue;
        const ext = str(r.external_id, 200) || null;
        const res = await q<{ id: number }[]>`insert into payouts (user_id, payee_name, payee_email, amount_cents, paid_on, method, note, created_by, external_id)
          values (${m?.id ?? null}, ${m ? m.name : name}, ${m?.email ?? null}, ${cents}, ${date}, ${str(r.method, 40) || null}, ${str(r.note, 300)}, ${u.id}, ${ext})
          on conflict (external_id) where external_id is not null do nothing returning id`;
        if (res.length) out.added++; else out.skipped++;
      }
      return { ...out, matched: [...new Set(out.matched)], unmatched: [...new Set(out.unmatched)] };
    },
  },
  {
    name: "reassign_payouts",
    description: "Move payouts recorded under a payee name (e.g. a Cash App display name) to a team member found by email. Sends nothing.",
    inputSchema: obj({ payee_name: S("Name the payouts are recorded under"), email: S("Team member's email") }, ["payee_name", "email"]),
    run: async (a) => {
      const [m] = await q<{ id: number; name: string; email: string }[]>`select id, name, email from users where lower(email) = ${str(a.email, 200).toLowerCase()}`;
      if (!m) return { error: "No team member with that email" };
      const rows = await q<{ id: number }[]>`update payouts set user_id = ${m.id}, payee_name = ${m.name}, payee_email = ${m.email}
        where user_id is null and lower(payee_name) = ${str(a.payee_name, 120).toLowerCase()} returning id`;
      return { ok: true, moved: rows.length, to: m.name };
    },
  },
  {
    name: "sync_paid_invoices",
    description: "Turn paid Stripe invoices from admin → Invoices in the last N days (default 120) into bookings (admin → Bookings). Skips invoices that already have one; marks a matching unpaid website booking paid instead of duplicating it. Sends nothing.",
    inputSchema: obj({ days: N("Look back this many days, default 30") }),
    run: async (a) => {
      if (!stripe) return { error: "Stripe not configured" };
      const since = Math.floor(Date.now() / 1000) - Math.min(365, Number(a.days) || 120) * 86400;
      const out: { invoice: string; ref?: string; created?: boolean; error?: string }[] = [];
      for await (const inv of stripe.invoices.list({ status: "paid", created: { gte: since }, limit: 100 })) {
        try { const r = await bookingFromInvoice(inv); if (r) out.push({ invoice: inv.number ?? inv.id!, ...r }); }
        catch (e) { out.push({ invoice: inv.number ?? inv.id!, error: String(e) }); }
      }
      return { ok: true, results: out };
    },
  },
  {
    name: "update_payout",
    description: "Correct a recorded payout's method (e.g. Venmo, Cash App) and/or note. Sends nothing.",
    inputSchema: obj({ id: N("Payout id from list_payouts"), method: S("New method (optional)"), note: S("New note (optional)") }, ["id"]),
    run: async (a) => {
      const method = a.method == null ? null : str(a.method, 40);
      const note = a.note == null ? null : str(a.note, 500);
      const rows = await q<{ id: number; method: string | null; note: string }[]>`update payouts set method = coalesce(${method}, method), note = coalesce(${note}, note)
        where id = ${Number(a.id)} returning id, method, note`;
      return rows.length ? { ok: true, payout: rows[0] } : { error: "No payout with that id" };
    },
  },
  {
    name: "list_payouts", readOnly: true,
    description: "Payouts recorded to photographers.",
    inputSchema: obj({ limit: N("Max rows, default 30") }),
    run: async (a) => q`select p.id, coalesce(u.name, p.payee_name) as payee, coalesce(u.email, p.payee_email) as email, p.amount_cents, p.paid_on::text, p.method, p.note from payouts p left join users u on u.id = p.user_id order by p.paid_on desc, p.id desc limit ${Math.min(100, Number(a.limit) || 30)}`,
  },
];

function keyOk(key: string) {
  const want = process.env.MCP_KEY ?? "";
  if (want.length < 24 || key.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(key), Buffer.from(want));
}

async function actor(): Promise<User | null> {
  const email = (process.env.MCP_ACT_AS ?? "").toLowerCase();
  const [u] = await q<User[]>`select id, email, name, role, active, true as totp_enabled from users
    where active and role in ('owner','admin') and (${email} = '' or lower(email) = ${email}) order by (role = 'owner') desc, id limit 1`;
  return u ?? null;
}

const rpc = (id: unknown, result: unknown) => ({ jsonrpc: "2.0", id, result });
const rpcErr = (id: unknown, code: number, message: string) => ({ jsonrpc: "2.0", id, error: { code, message } });

async function handle(m: Json, user: User): Promise<Json | null> {
  const id = m.id ?? null;
  const method = String(m.method ?? "");
  if (method.startsWith("notifications/")) return null;
  if (method === "initialize") {
    const pv = String((m.params as Json | undefined)?.protocolVersion ?? "2025-06-18");
    return rpc(id, { protocolVersion: pv, capabilities: { tools: {} }, serverInfo: { name: "macrosnaps-crm", version: "1.0.0" },
      instructions: "MacroSnaps CRM (macrosnaps.com admin). Client-facing emails (replies, invoices, assignments, contracts) go out immediately when sent; preview first and confirm with the user before sending anything to a client unless they already asked you to send it." });
  }
  if (method === "ping") return rpc(id, {});
  if (method === "tools/list") return rpc(id, { tools: TOOLS.map((t) => ({ name: t.name, description: t.description, inputSchema: t.inputSchema, annotations: { readOnlyHint: !!t.readOnly, destructiveHint: !t.readOnly && /void/.test(t.name) } })) });
  if (method === "tools/call") {
    const p = (m.params ?? {}) as Json;
    const tool = TOOLS.find((t) => t.name === p.name);
    if (!tool) return rpcErr(id, -32602, `Unknown tool: ${String(p.name)}`);
    try {
      const out = await actingAs.run(user, () => tool.run((p.arguments ?? {}) as Json));
      if (!tool.readOnly) await audit(user.id, `mcp_${tool.name}`, JSON.stringify(p.arguments ?? {}).slice(0, 300));
      const isError = !!(out && typeof out === "object" && "error" in out && (out as Json).error);
      return rpc(id, { content: [{ type: "text", text: JSON.stringify(out ?? { ok: true }, null, 1) }], isError });
    } catch (e) {
      console.error("[mcp]", tool.name, e);
      return rpc(id, { content: [{ type: "text", text: `Error: ${e instanceof Error ? e.message : "failed"}` }], isError: true });
    }
  }
  return rpcErr(id, -32601, `Method not found: ${method}`);
}

export async function POST(req: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!keyOk(key)) return new NextResponse("Not found", { status: 404 });
  const user = await actor();
  if (!user) return NextResponse.json(rpcErr(null, -32000, "No active admin user to act as."), { status: 500 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json(rpcErr(null, -32700, "Parse error"), { status: 400 }); }
  if (Array.isArray(body)) {
    const out = (await Promise.all(body.map((m) => handle(m as Json, user)))).filter(Boolean);
    return out.length ? NextResponse.json(out) : new NextResponse(null, { status: 202 });
  }
  const r = await handle(body as Json, user);
  return r ? NextResponse.json(r, { headers: { "cache-control": "no-store" } }) : new NextResponse(null, { status: 202 });
}

export async function GET(_: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (!keyOk(key)) return new NextResponse("Not found", { status: 404 });
  return new NextResponse("Method not allowed", { status: 405, headers: { allow: "POST" } });
}
export const DELETE = GET;
