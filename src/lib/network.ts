// The photographer & videographer network: approved staff plus applicants, searchable by area and shoot type.
import "server-only";
import { q } from "@/lib/db";
import { resolveCity, milesBetween } from "@/lib/geo";

export type Person = {
  key: string;                 // "u:12" (staff account) or "a:34" (applicant)
  userId: number | null; inquiryId: number | null;
  kind: "staff" | "applicant";
  name: string; email: string; phone: string | null;
  city: string; lat: number | null; lng: number | null; radius: number;
  roles: string; shootTypes: string[]; experience?: string; portfolio?: string;
  active: boolean; miles?: number;
};

export const parseRadius = (s: string | null | undefined) => {
  const m = String(s ?? "").match(/(\d+)/);
  return /\+|travel/i.test(String(s)) ? 500 : m ? Number(m[1]) : 25;
};

export async function allPeople(): Promise<Person[]> {
  const staff = await q<{ id: number; name: string; email: string; active: boolean; phone: string | null; city: string | null; lat: number | null; lng: number | null; radius_miles: number | null; roles: string[] | null; shoot_types: string[] | null; portfolio: string | null }[]>`
    select u.id, u.name, u.email, u.active, p.phone, p.city, p.lat, p.lng, p.radius_miles, p.roles, p.shoot_types, p.portfolio
    from users u left join staff_profiles p on p.user_id = u.id where u.role = 'staff'`;
  const apps = await q<{ id: number; name: string; email: string; phone: string | null; data: Record<string, string> }[]>`
    select i.id, i.name, i.email, i.phone, i.data from inquiries i
    where i.kind = 'application' and i.status not in ('rejected') and not exists (select 1 from staff_profiles p where p.application_id = i.id)
      and not exists (select 1 from users u where u.email = lower(i.email))`;
  const out: Person[] = staff.map((s) => ({
    key: `u:${s.id}`, userId: s.id, inquiryId: null, kind: "staff", name: s.name, email: s.email, phone: s.phone, city: s.city ?? "",
    lat: s.lat, lng: s.lng, radius: s.radius_miles ?? 25, roles: (s.roles ?? []).join(", "), shootTypes: s.shoot_types ?? [], portfolio: s.portfolio ?? undefined, active: s.active,
  }));
  for (const a of apps) {
    const c = resolveCity(a.data.city ?? "");
    out.push({
      key: `a:${a.id}`, userId: null, inquiryId: a.id, kind: "applicant", name: a.name, email: a.email, phone: a.phone, city: a.data.city ?? "",
      lat: c?.lat ?? null, lng: c?.lng ?? null, radius: parseRadius(a.data.radius), roles: a.data.role ?? "",
      shootTypes: String(a.data.shootTypes ?? "").split(",").map((x) => x.trim()).filter(Boolean), experience: a.data.experience, portfolio: a.data.portfolio, active: true,
    });
  }
  return out;
}

export type Filters = { near?: string; miles?: number; shoot?: string; role?: string; kind?: string; text?: string };

/** Filter by area: people whose own travel radius reaches the place, or who are within `miles` of it. */
export function filterPeople(people: Person[], f: Filters) {
  const place = f.near ? resolveCity(f.near) : undefined;
  return people
    .map((p) => ({ ...p, miles: place && p.lat != null && p.lng != null ? Math.round(milesBetween(place, { lat: p.lat, lng: p.lng! })) : undefined }))
    .filter((p) => {
      if (!p.active) return false;
      if (f.kind && p.kind !== f.kind) return false;
      if (f.shoot && !p.shootTypes.includes(f.shoot)) return false;
      if (f.role === "Photographer" && !/photo/i.test(p.roles)) return false;
      if (f.role === "Videographer" && !/video|both/i.test(p.roles)) return false;
      if (f.text) { const t = f.text.toLowerCase(); if (![p.name, p.email, p.city, p.phone ?? ""].some((x) => x.toLowerCase().includes(t))) return false; }
      if (f.near) {
        if (!place) return p.city.toLowerCase().includes(f.near.toLowerCase().split(",")[0].trim());
        if (p.miles == null) return false;
        return p.miles <= Math.max(p.radius, f.miles ?? 0);
      }
      return true;
    })
    .sort((a, b) => (a.miles ?? 9999) - (b.miles ?? 9999) || a.name.localeCompare(b.name));
}
