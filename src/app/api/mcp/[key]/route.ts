// MacroSnaps CRM connector: a remote MCP server (Streamable HTTP, JSON responses) so Claude can run the admin panel
// from any chat, without a browser. The secret lives in the URL path and is set as MCP_KEY in Vercel; nothing works
// without it. Every action runs as an admin user (MCP_ACT_AS, else the first owner) and is written to the activity log.
import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { actingAs, type User } from "@/lib/auth";
import { q, audit } from "@/lib/db";
import { stripe } from "@/lib/stripe";
import { replyInquiry, updateInquiry } from "@/app/admin/(panel)/inbox/actions";
import { createInvoice, invoiceEmailAction, invoiceAction } from "@/app/admin/(panel)/invoices/actions";
import { addPhotographer, requestFiles, sendAssignment } from "@/app/admin/(panel)/photographers/actions";
import { sendNew, voidContract } from "@/app/admin/(panel)/contracts/actions";

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
      return q`select id, to_addr, subject, status, error, created_at from email_log where (${s}::text is null or to_addr ilike ${s} or subject ilike ${s}) order by id desc limit ${Math.min(100, Number(a.limit) || 30)}`;
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
