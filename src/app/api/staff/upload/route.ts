import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { q } from "@/lib/db";
import { driveReady, ensureFolder, startUpload } from "@/lib/drive";
import { notifyAdmins } from "@/lib/notify";

const OK_TYPES = /^(image\/|video\/|application\/(zip|x-zip-compressed|octet-stream))/;
const clean = (s: string) => s.replace(/[^\w .()&,-]/g, "").slice(0, 120) || "file";

/** POST {bookingId, name, type, size} → { url } for a direct browser→Google Drive upload.
 *  POST {done: true, bookingId, count} → logs the batch and alerts the admin team. */
export async function POST(req: Request) {
  const u = await currentUser();
  if (!u) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const b = await req.json().catch(() => null);
  if (!b) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const bookingId = Number(b.bookingId) || 0;
  const [bk] = await q<{ ref: string; service_name: string; customer_name: string; first_date: Date | null }[]>`
    select b.ref, b.service_name, b.customer_name, b.first_date from bookings b join crew_assignments c on c.booking_id = b.id where b.id = ${bookingId} and c.user_id = ${u.id}`;
  if (!bk) return NextResponse.json({ error: "Choose one of your shoots." }, { status: 400 });

  if (b.done) {
    const n = Math.min(10000, Number(b.count) || 0);
    await notifyAdmins(`${u.name} uploaded ${n} file${n === 1 ? "" : "s"} for ${bk.ref}`, `${bk.service_name} · ${bk.customer_name}. The files are in Google Drive.`, null);
    return NextResponse.json({ ok: true });
  }
  if (!driveReady()) return NextResponse.json({ error: "Uploads aren't connected yet. Please contact MacroSnaps." }, { status: 503 });
  const name = clean(String(b.name ?? ""));
  const type = String(b.type || "application/octet-stream").slice(0, 100);
  const size = Number(b.size) || 0;
  if (!OK_TYPES.test(type)) return NextResponse.json({ error: `${name}: only photos, videos and zip files can be uploaded.` }, { status: 400 });
  if (size <= 0 || size > 20 * 1024 ** 3) return NextResponse.json({ error: `${name}: file is empty or larger than 20 GB.` }, { status: 400 });
  try {
    const date = bk.first_date ? new Date(bk.first_date).toISOString().slice(0, 10) : "undated";
    const bookingFolder = await ensureFolder(clean(`${date} ${bk.ref} ${bk.service_name} - ${bk.customer_name}`));
    const folder = await ensureFolder(clean(u.name), bookingFolder);
    const origin = req.headers.get("origin") ?? new URL(req.url).origin;
    const url = await startUpload(folder, name, type, size, origin);
    await q`insert into staff_uploads (user_id, booking_id, file_name, size_bytes, drive_folder_id) values (${u.id}, ${bookingId}, ${name}, ${size}, ${folder})`;
    return NextResponse.json({ url });
  } catch (e) {
    console.error("[drive]", e);
    return NextResponse.json({ error: "Google Drive didn't accept the upload. Please try again." }, { status: 502 });
  }
}
