import { requireStaff } from "@/lib/auth";
import { q } from "@/lib/db";
import { myShoots } from "@/lib/staffData";
import { PageHead, Table, Empty, fmtDate } from "@/components/admin/ui";
import Uploader from "@/components/staff/Uploader";

export const metadata = { title: "Upload photos" };

export default async function Uploads() {
  const u = await requireStaff();
  const shoots = await myShoots(u.id);
  const recent = await q<{ id: number; file_name: string; size_bytes: number; created_at: Date; ref: string | null }[]>`
    select s.id, s.file_name, s.size_bytes, s.created_at, b.ref from staff_uploads s left join bookings b on b.id = s.booking_id where s.user_id = ${u.id} order by s.id desc limit 100`;
  return (
    <>
      <PageHead title="Upload photos & video" sub="Upload every original file within 24 hours of the shoot. Files go straight to MacroSnaps' Google Drive." />
      <Uploader shoots={shoots.map((b) => ({ id: b.id, label: `${b.schedule[0]?.date ?? ""} · ${b.ref} · ${b.service_name} · ${b.customer_name}` }))} />
      <h2 className="mb-3 mt-8 font-serif text-2xl">Recent uploads</h2>
      {recent.length ? <Table head={["File", "Shoot", "Size", "When"]}>{recent.map((r) => <tr key={r.id}><td className="px-4 py-3">{r.file_name}</td><td className="px-4 py-3">{r.ref}</td><td className="px-4 py-3">{(Number(r.size_bytes) / 1024 ** 2).toFixed(1)} MB</td><td className="px-4 py-3">{fmtDate(r.created_at, true)}</td></tr>)}</Table> : <Empty>No uploads yet.</Empty>}
    </>
  );
}
