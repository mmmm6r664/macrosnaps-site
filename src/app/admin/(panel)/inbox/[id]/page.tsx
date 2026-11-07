import { notFound } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { db, q } from "@/lib/db";
import { PageHead, Card, Badge, fmtDate, inputCls, labelCls, btnPrimary } from "@/components/admin/ui";
import { updateInquiry } from "../actions";

export const metadata = { title: "Message" };
const LABELS: Record<string, string> = {
  company: "Company", date: "Event date(s)", subject: "Subject", message: "Message", page: "Sent from page", city: "City", radius: "Work radius", role: "Role",
  experience: "Experience", workStatus: "Work status", hours: "Working hours", portfolio: "Portfolio", shootTypes: "Shoot types", camera: "Primary camera",
  secondary: "Secondary cameras", lenses: "Lens kit", lighting: "Lighting kit", notes: "Notes",
};

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
    </>
  );
}
