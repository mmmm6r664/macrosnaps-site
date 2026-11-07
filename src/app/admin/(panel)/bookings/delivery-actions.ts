"use server";
// Client delivery: production stage updates and the client gallery (uploaded to Vercel Blob).
import { revalidatePath } from "next/cache";
import { del } from "@vercel/blob";
import { requireUser } from "@/lib/auth";
import { audit, q } from "@/lib/db";
import { ensureGallery, isStage, STAGES } from "@/lib/clientData";
import { sendMail } from "@/lib/mail";
import { ORIGIN } from "@/lib/emailTemplate";
import { stageUpdate, galleryReady } from "@/lib/emails";
import { sendSms } from "@/lib/sms";

export type DeliveryState = { ok?: string; error?: string } | undefined;
type Row = { ref: string; email: string; customer_name: string; phone: string | null; service_name: string };
const bookingRow = async (id: number) => (await q<Row[]>`select ref, email, customer_name, phone, service_name from bookings where id = ${id}`)[0];
const isBlobUrl = (u: string) => { try { const x = new URL(u); return x.protocol === "https:" && x.hostname.endsWith(".public.blob.vercel-storage.com"); } catch { return false; } };

export async function setStage(_: DeliveryState, fd: FormData): Promise<DeliveryState> {
  const u = await requireUser();
  const id = Number(fd.get("id"));
  const stage = String(fd.get("stage") ?? "");
  if (!isStage(stage)) return { error: "Pick a stage." };
  const b = await bookingRow(id);
  if (!b) return { error: "Booking not found." };
  await q`update bookings set stage = ${stage}, stage_updated_at = now(), updated_at = now() where id = ${id}`;
  await audit(u.id, "booking_stage", `${b.ref} → ${stage}`);
  let note = "";
  if (fd.get("notify") === "on") {
    const s = STAGES.find((x) => x.id === stage)!;
    const url = `${ORIGIN}/account/orders/${b.ref}`;
    const m = stageUpdate(b.customer_name, s.label, s.client, b.service_name, b.ref, url);
    const r = await sendMail({ to: b.email, subject: m.subject, html: m.html });
    note = r.ok ? " Client emailed." : " (Email not sent: email isn't set up yet.)";
  }
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: `Stage set to “${STAGES.find((x) => x.id === stage)!.label}”.${note}` };
}

export async function saveGallery(_: DeliveryState, fd: FormData): Promise<DeliveryState> {
  await requireUser();
  const id = Number(fd.get("id"));
  const title = String(fd.get("title") ?? "").trim().slice(0, 120);
  const message = String(fd.get("message") ?? "").trim().slice(0, 2000);
  const dl = String(fd.get("download_url") ?? "").trim().slice(0, 1000);
  if (dl && !/^https:\/\/\S+$/.test(dl)) return { error: "The download link must start with https://" };
  const gid = await ensureGallery(id);
  await q`update galleries set title = ${title}, message = ${message}, download_url = ${dl || null} where id = ${gid}`;
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: "Gallery details saved." };
}

/** Records photos the browser just uploaded straight to Blob storage. */
export async function addPhotos(bookingId: number, items: { url: string; pathname: string; name: string; size: number }[]) {
  await requireUser();
  const ok = items.filter((i) => isBlobUrl(i.url)).slice(0, 200);
  if (!ok.length) return { added: 0 };
  const gid = await ensureGallery(bookingId);
  const max = (await q<{ m: number }[]>`select coalesce(max(sort), 0)::int as m from gallery_photos where gallery_id = ${gid}`)[0].m;
  for (const [i, p] of ok.entries())
    await q`insert into gallery_photos (gallery_id, url, pathname, file_name, size_bytes, sort) values (${gid}, ${p.url}, ${p.pathname.slice(0, 500)}, ${p.name.slice(0, 200)}, ${Math.max(0, Math.floor(p.size)) || null}, ${max + i + 1})`;
  revalidatePath(`/admin/bookings/${bookingId}`);
  return { added: ok.length };
}

export async function removePhoto(bookingId: number, photoId: number) {
  await requireUser();
  const rows = await q<{ url: string }[]>`
    delete from gallery_photos p using galleries g where p.id = ${photoId} and p.gallery_id = g.id and g.booking_id = ${bookingId} returning p.url`;
  if (rows[0] && process.env.BLOB_READ_WRITE_TOKEN) await del(rows[0].url).catch((e) => console.error("[blob] delete", e));
  revalidatePath(`/admin/bookings/${bookingId}`);
}

export async function publishGallery(_: DeliveryState, fd: FormData): Promise<DeliveryState> {
  const u = await requireUser();
  const id = Number(fd.get("id"));
  const publish = fd.get("publish") === "1";
  const b = await bookingRow(id);
  if (!b) return { error: "Booking not found." };
  const gid = await ensureGallery(id);
  if (!publish) {
    await q`update galleries set status = 'draft' where id = ${gid}`;
    revalidatePath(`/admin/bookings/${id}`);
    return { ok: "Gallery hidden from the client." };
  }
  const g = (await q<{ n: number; dl: string | null }[]>`select (select count(*) from gallery_photos where gallery_id = ${gid})::int as n, download_url as dl from galleries where id = ${gid}`)[0];
  if (!g.n && !g.dl) return { error: "Upload photos or add a download link first." };
  await q`update galleries set status = 'published', published_at = coalesce(published_at, now()) where id = ${gid}`;
  await q`update bookings set stage = 'gallery_ready', stage_updated_at = now(), updated_at = now() where id = ${id}`;
  await audit(u.id, "gallery_published", b.ref);
  const url = `${ORIGIN}/account/orders/${b.ref}#gallery`;
  const previews = (await q<{ url: string }[]>`select url from gallery_photos where gallery_id = ${gid} order by sort, id limit 3`).map((x) => x.url);
  const m = galleryReady(b.customer_name, b.service_name, url, b.email, previews);
  const r = await sendMail({ to: b.email, subject: m.subject, html: m.html });

  if (b.phone && fd.get("sms") === "on") await sendSms(b.phone, `MacroSnaps: your gallery is ready! View and download it here: ${url}`).catch(() => null);
  revalidatePath(`/admin/bookings/${id}`);
  return { ok: r.ok ? "Gallery published and the client was emailed." : "Gallery published. (Email not sent: email isn't set up yet.)" };
}
