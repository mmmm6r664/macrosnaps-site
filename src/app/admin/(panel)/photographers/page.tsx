import { requireUser } from "@/lib/auth";
import { allPeople, filterPeople } from "@/lib/network";
import { getBooking } from "@/lib/adminData";
import { SHOOT_TYPES } from "@/lib/careers";
import { smsReady } from "@/lib/sms";
import { PageHead, Notice, inputCls, btnGhost } from "@/components/admin/ui";
import Directory from "@/components/admin/Directory";
import AddPhotographer from "@/components/admin/AddPhotographer";
import RequestFiles from "@/components/admin/RequestFiles";
import WelcomeMember from "@/components/admin/WelcomeMember";
import SendAssignment from "@/components/admin/SendAssignment";
import UpdatePhone from "@/components/admin/UpdatePhone";
import { DEFAULT_SCOPE } from "@/lib/emails";
import { q } from "@/lib/db";
import { listFileRequests } from "@/lib/crewDelivery";

export const metadata = { title: "Photographers & videographers" };

export default async function Photographers({ searchParams }: { searchParams: Promise<Record<string, string | undefined>> }) {
  await requireUser();
  const sp = await searchParams;
  const booking = sp.booking ? await getBooking(Number(sp.booking) || 0) : null;
  const near = (sp.near ?? booking?.city ?? "").slice(0, 80);
  const f = { near, miles: Number(sp.miles) || 0, shoot: SHOOT_TYPES.includes(sp.shoot ?? "") ? sp.shoot : undefined, role: sp.role, kind: sp.kind, text: (sp.text ?? "").slice(0, 60) || undefined };
  const people = filterPeople(await allPeople(), f);
  const offer = booking ? {
    bookingId: booking.id, city: booking.city ?? "", title: `${booking.service_name}${booking.addon ? ` + ${booking.addon}` : ""}`,
    date: booking.schedule.map((s) => `${s.date} ${s.start}–${s.end}`).join("; "), details: `Venue: ${booking.venue_address ?? ""}`,
  } : undefined;
  return (
    <>
      <PageHead title="Photographers & videographers" sub="Your team and every applicant. Filter by area and shoot type, then email, text or offer them a shoot." />
      <AddPhotographer />
      <SendAssignment defaultScope={DEFAULT_SCOPE.conference} team={await q<{ id: number; name: string; email: string }[]>`select id, name, email from users where role = 'staff' and active order by name limit 300`.catch(() => [])} />
      <WelcomeMember team={await q<{ id: number; name: string; email: string; signed: boolean }[]>`select u.id, u.name, u.email, (p.contract_signed_at is not null) as signed from users u left join staff_profiles p on p.user_id = u.id where u.role = 'staff' and u.active order by u.created_at desc limit 200`.catch(() => [])} />
      <UpdatePhone team={await q<{ id: number; name: string; email: string; phone: string | null }[]>`select u.id, u.name, u.email, p.phone from users u left join staff_profiles p on p.user_id = u.id where u.role = 'staff' and u.active order by u.name limit 300`.catch(() => [])} />
      <RequestFiles rows={(await listFileRequests().catch(() => [])).map((r) => ({ id: r.id, name: r.name, email: r.email, shoot: r.shoot, shoot_date: r.shoot_date, link: r.drive_link,
        due: new Date(r.due_at).toLocaleString("en-US", { timeZone: "America/New_York", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }) }))} />
      {!smsReady() && <Notice>Text messaging isn&apos;t connected yet (Twilio). Email and portal notifications still work.</Notice>}
      {booking && <Notice tone="green">Finding crew for booking {booking.ref}: {booking.service_name} in {booking.city}. The offer form is filled in for you.</Notice>}
      <form className="mb-4 grid gap-2 rounded-lg border border-black/10 bg-white p-4 sm:grid-cols-2 xl:grid-cols-6">
        {booking && <input type="hidden" name="booking" value={booking.id} />}
        <input name="near" defaultValue={near} placeholder="Near city, e.g. San Francisco, CA" className={`${inputCls} xl:col-span-2`} />
        <select name="miles" defaultValue={sp.miles ?? ""} className={inputCls} aria-label="Distance">
          <option value="">Within their travel radius</option>{[10, 25, 50, 100, 200].map((m) => <option key={m} value={m}>Within {m} miles</option>)}
        </select>
        <select name="shoot" defaultValue={f.shoot ?? ""} className={inputCls} aria-label="Shoot type"><option value="">Any shoot type</option>{SHOOT_TYPES.map((s) => <option key={s}>{s}</option>)}</select>
        <select name="role" defaultValue={sp.role ?? ""} className={inputCls} aria-label="Role"><option value="">Photo or video</option><option>Photographer</option><option>Videographer</option></select>
        <select name="kind" defaultValue={sp.kind ?? ""} className={inputCls} aria-label="Status"><option value="">Team + applicants</option><option value="staff">Team only</option><option value="applicant">Applicants only</option></select>
        <input name="text" defaultValue={f.text} placeholder="Search name, email, phone" className={`${inputCls} xl:col-span-2`} />
        <button className={btnGhost}>Filter</button>
        <p className="self-center text-sm text-black/60 xl:col-span-3">{people.length} match{people.length === 1 ? "" : "es"}</p>
      </form>
      <Directory people={people.map(({ lat: _lat, lng: _lng, userId: _u, inquiryId: _i, active: _a, ...p }) => p)} offer={offer} />
    </>
  );
}
