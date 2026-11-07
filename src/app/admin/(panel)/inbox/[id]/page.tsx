import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db, q } from "@/lib/db";
import { PageHead, Card, Badge, fmtDate, inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import { updateInquiry } from "../actions";
import ApproveButton from "@/components/admin/ApproveButton";
import ReplyForm from "@/components/admin/ReplyForm";
import { q as qq } from "@/lib/db";

export const metadata = { title: "Message" };
const LABELS: Record<string, string> = {
  company: "Company", date: "Event date(s)", subject: "Subject", message: "Message", page: "Sent from page", city: "City", radius: "Work radius", role: "Role",
  experience: "Experience", workStatus: "Work status", hours: "Working hours", portfolio: "Portfolio", shootTypes: "Shoot types", camera: "Primary camera",
  secondary: "Secondary cameras", lenses: "Lens kit", lighting: "Lighting kit", notes: "Notes",
};

/** A ready-to-send "we're available, please book online" reply, personalised from the inquiry. */
function draftReply(name: string, d: Record<string, string>) {
  const first = (name || "").trim().split(/\s+/)[0] || "there";
  const what = (d.subject || "").trim();
  const wedding = /wedding|engage/i.test(`${what} ${d.message ?? ""}`);
  const date = (d.date || "").trim();
  const subject = what ? `Re: ${what}${date ? ` on ${date}` : ""}` : "Thank you for contacting MacroSnaps";
  const message = [
    `Hi ${first},`,
    `Thank you so much for reaching out${wedding ? ", and congratulations!" : "!"}`,
    `Good news: we're available${date ? ` on ${date}` : ""} and would love to provide our ${what ? what.toLowerCase() : "photography and videography"} services${wedding ? " for your big day" : " for your event"}.`,
    "The easiest way to reserve your date is to book directly on our website. You can choose your hours and any add-ons, see your price instantly, and confirm in just a few minutes. Popular dates fill up quickly, so we recommend booking soon.",
    "If you have any questions before booking, just reply to this email or give us a call. We're happy to help.",
  ].join("\n\n");
  return { subject, message };
}

export default async function InquiryPage({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const [r] = await q<{ id: number; kind: string; name: string; email: string; phone: string | null; data: Record<string, string>; status: string; notes: string; created_at: Date }[]>`
    select * from inquiries where id = ${Number((await params).id) || 0}`;
  if (!r) notFound();
  return (
    <>
      <PageHead title={r.name || r.email} sub={`${r.kind === "application" ? "Careers application" : "Contact message"} · ${fmtDate(r.created_at, true)}`} actions={<Badge status={r.status} />} />
      <div className="grid gap-5 xl:grid-cols-[1fr_360px]">
        <Card>
          <dl className="space-y-3 text-sm">
            <div><dt className="text-black/50">Email</dt><dd><a className="underline" href={`mailto:${r.email}`}>{r.email}</a></dd></div>
            {r.phone && <div><dt className="text-black/50">Phone</dt><dd><a className="underline" href={`tel:${r.phone}`}>{r.phone}</a></dd></div>}
            {Object.entries(r.data).filter(([, v]) => v).map(([k, v]) => (
              <div key={k}><dt className="text-black/50">{LABELS[k] ?? k}</dt><dd className="whitespace-pre-wrap">{k === "portfolio" && /^https?:\/\//.test(v) ? <a className="underline" href={v} target="_blank" rel="noopener noreferrer">{v}</a> : v}</dd></div>
            ))}
          </dl>
        </Card>
        <div className="space-y-5">
        {r.kind === "application" && (
          <Card title="Hire">
            {(await qq`select 1 from users where email = ${r.email.toLowerCase()}`).length
              ? <p className="text-sm">Approved: this person has a staff login.</p>
              : <><p className="mb-3 text-sm text-black/60">Creates their private /staff login and emails them a link to set a password, sign the contractor agreement and complete their profile.</p><ApproveButton id={r.id} /></>}
          </Card>
        )}
        {r.kind === "contact" && r.email && (
          <Card title="Reply by email"><ReplyForm id={r.id} to={r.email} {...draftReply(r.name, r.data)} /></Card>
        )}
        <Card title="Status & notes">
          <form action={updateInquiry} className="space-y-3">
            <input type="hidden" name="id" value={r.id} />
            <div><label className={labelCls} htmlFor="st">Status</label>
              <select id="st" name="status" defaultValue={r.status} className={inputCls}>{["new", "in_progress", "done", "rejected"].map((s) => <option key={s} value={s}>{s.replace("_", " ")}</option>)}</select></div>
            <div><label className={labelCls} htmlFor="nt">Notes</label><textarea id="nt" name="notes" rows={6} defaultValue={r.notes} className={inputCls} /></div>
            <button className={btnPrimary}>Save</button>
          </form>
        </Card>
        </div>
      </div>
    </>
  );
}
