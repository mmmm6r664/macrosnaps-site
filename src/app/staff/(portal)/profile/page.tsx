import { requireStaff } from "@/lib/auth";
import { getProfile } from "@/lib/staffData";
import { SHOOT_TYPES } from "@/lib/careers";
import { PageHead } from "@/components/admin/ui";
import { ProfileForm } from "@/components/staff/StaffForms";

export const metadata = { title: "Profile & payout" };

export default async function Profile() {
  const u = await requireStaff();
  const p = await getProfile(u.id);
  return (
    <>
      <PageHead title="Profile & payout" sub="We use your area, travel distance and shoot types to offer you the right shoots." />
      <ProfileForm shootTypes={SHOOT_TYPES} p={{ phone: p?.phone ?? "", city: p?.city ?? "", radius: p?.radius_miles ?? 25, roles: p?.roles ?? [], shoots: p?.shoot_types ?? [], gear: p?.gear ?? "", bio: p?.bio ?? "", portfolio: p?.portfolio ?? "", payout_method: p?.payout_method ?? "", payout_handle: p?.payout_handle ?? "" }} />
    </>
  );
}
