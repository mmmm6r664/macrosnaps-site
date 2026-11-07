// Order tracking, galleries and feedback for the client portal and the admin booking page.
import "server-only";
import { q } from "@/lib/db";

/** Production stages shown to clients as a progress tracker. */
export const STAGES = [
  { id: "booked", label: "Booked", client: "Your booking is confirmed and your date is reserved." },
  { id: "crew_assigned", label: "Crew assigned", client: "Your photographer/videographer has been assigned." },
  { id: "shoot_complete", label: "Shoot complete", client: "Your shoot is done. Your photos and videos are on their way to our editors." },
  { id: "editing", label: "Editing", client: "Our editors are working on your photos and videos." },
  { id: "gallery_ready", label: "Gallery ready", client: "Your gallery is ready to view and download." },
] as const;
export type StageId = (typeof STAGES)[number]["id"];
export const isStage = (s: string): s is StageId => STAGES.some((x) => x.id === s);
export const stageIndex = (s: string) => Math.max(0, STAGES.findIndex((x) => x.id === s));

export type ClientOrder = {
  id: number; ref: string; status: string; stage: string; service_name: string; package: string | null; addon: string | null; city: string | null;
  venue_address: string | null; schedule: { date: string; start: string; end: string; venue?: string }[]; lines: { label: string; amount: number }[];
  total_cents: number; amount_refunded_cents: number; first_date: string | null; created_at: string; stage_updated_at: string | null;
};
const VISIBLE = ["paid", "confirmed", "completed", "requested", "refunded", "partially_refunded"];

export async function ordersFor(email: string) {
  return q<(ClientOrder & { gallery_ready: boolean })[]>`
    select b.id, b.ref, b.status, b.stage, b.service_name, b.package, b.addon, b.city, b.venue_address, b.schedule, b.lines, b.total_cents,
      b.amount_refunded_cents, b.first_date::text, b.created_at, b.stage_updated_at,
      exists(select 1 from galleries g where g.booking_id = b.id and g.status = 'published') as gallery_ready
    from bookings b where lower(b.email) = ${email.toLowerCase()} and b.status = any(${VISIBLE})
    order by b.first_date desc nulls last, b.created_at desc`;
}

export async function orderFor(email: string, ref: string) {
  const rows = await q<ClientOrder[]>`
    select id, ref, status, stage, service_name, package, addon, city, venue_address, schedule, lines, total_cents, amount_refunded_cents,
      first_date::text, created_at, stage_updated_at
    from bookings where ref = ${ref} and lower(email) = ${email.toLowerCase()} and status = any(${VISIBLE})`;
  return rows[0] ?? null;
}

export type Gallery = { id: number; booking_id: number; title: string; message: string; download_url: string | null; status: string; published_at: string | null };
export type GalleryPhoto = { id: number; url: string; file_name: string; size_bytes: number | null };

export async function galleryFor(bookingId: number) {
  const g = (await q<Gallery[]>`select id, booking_id, title, message, download_url, status, published_at from galleries where booking_id = ${bookingId}`)[0] ?? null;
  const photos = g ? await q<GalleryPhoto[]>`select id, url, file_name, size_bytes from gallery_photos where gallery_id = ${g.id} order by sort, id` : [];
  return { gallery: g, photos };
}

export async function ensureGallery(bookingId: number) {
  const rows = await q<{ id: number }[]>`insert into galleries (booking_id) values (${bookingId}) on conflict (booking_id) do update set booking_id = excluded.booking_id returning id`;
  return rows[0].id;
}

export type Feedback = { rating: number; comment: string; created_at: string; review_invited_at: string | null };
export async function feedbackFor(bookingId: number) {
  return (await q<Feedback[]>`select rating, comment, created_at, review_invited_at from feedback where booking_id = ${bookingId}`)[0] ?? null;
}
