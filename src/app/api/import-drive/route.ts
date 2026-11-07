// One-time import: copies chosen photos from MacroSnaps' public Google Drive albums into our own Blob storage
// (two sizes) so the website never depends on Drive. Safe to remove after use.
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";

export const maxDuration = 300;

// Only these hand-picked photos can be imported, so the route is harmless if called by anyone else.
const ALLOWED = ["1Ss1Ev2_n3Cud4wyFvrIiV9MtW4k1sk2R", "1gApa7nJPsEpSBLBPsOUZinqwYBBO38QD", "171BS6uXXu3rlkseKmZ_Da_OOvKaY0laJ", "1Uo_D9rTJG2q5dWZeWcJpnr1UHWIo2OY3", "13lB2e7os4wNNPaXuJ8lQuSa7lfa9S2pd", "1ShffOxbxHyQ9IAjF1A6U2jWCwBdfUrK4", "1x2AByp90VVLiLVJE-5wS1YJc7sL_SWQK", "1aDRjCrPI7ivN5pwFFCtp4mdHynRvAHwl", "1PVkfGmxv62XC7sA_RbEF99VgbX-dQ3MY", "13L3CjEiFRcraE7ywuAp--xqUn9eAvGQC", "1DWRJbuwNK927h74CQbKxjqZb2bCGNXi0", "1collrwP_Z70FQRye0IlmTR8S19bkDuIo", "13cLCWNI6aHOwcHIcJND9mHd0juC4rWxk", "1cYnYj7eKQrg_ZvOJPduMp_bmBOlnRiXJ", "1yOtg7YJnioaKAh6QTuQK_fIIktM80X7Z", "1yKrrjSPh5lXgByld0XmFdgQA671NNemy", "1awvv9eQcbHLUK7dyuV3rz2OLUhb55Nfl", "1QPIl8zf-aXXp6ThIc8T_xmGiWXdFQ-YV", "1uX9dX_RUUObxfP4cKbO-oQugFvBS21np", "103If2s5VvxBN4bA23k7FNXQARAhHaPTE", "1I4UlO1C6pALeF5zCceyEoYEqaSqRfNzF", "10TBhAXObsRSmDrBVuUlCI0miUWCTtHeE", "1ysIq1ogJNoVYHlDrG8OP2Rw9l7LvHfI0", "1oyJSu7hpnTPCreeR5AIEwuU-O-IgUDqM", "1KKbidwRxZQxVu4YOr9DzBIf4kxFKQMvx", "1zlVte4Og8wozV0L-pW4GE3VokfRpJtE9", "1teMJYygtbmX3H-T6ClfsZe6lfFLopiuf", "1D2X1OlJInTxxBxfPYPFQpij6jIuPheOl", "1DwuszZeTz28dwKr8ODhupkzJj79q0XkR", "1sHfEaKJ_N9qIvOuIJGo4slfkTbVjVNek", "1TGcURdgoleWda4OnDkifBJ30_rSbWQ9U", "1d1QW1zsTXNvCSa84fOA09rl09EnGKX4s", "1Aw_PT4yMKXL1Ae4pQPX_EhvSRgeEdIUZ", "1doflKF-mBjnaotitVbjjXpMBKXbhfFsx", "11JwGabz51aUEoOSW7lz0ZsQ9ffHsRdmM", "1VkSnpFs3F0tpRGRlsUpD4C6ljIONHwZZ", "1qP0paZLt85ZNuIFyNgPpPuu16-lFSBQ0", "13rnd7xcR0K2nn3w71jfpm_uPyH3L6Y9a"];

export async function GET(req: Request) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) return NextResponse.json({ error: "Blob not connected" }, { status: 503 });
  const part = Number(new URL(req.url).searchParams.get("part") ?? 0);
  const ids = ALLOWED.slice(part * 10, part * 10 + 10);
  const out: { id: string; large?: string; small?: string; error?: string }[] = [];
  for (const id of (ids ?? []).filter((x) => /^[\w-]{20,60}$/.test(x)).slice(0, 25)) {
    try {
      const r: Record<string, string> = {};
      for (const [k, w] of [["large", 2000], ["small", 800]] as const) {
        const res = await fetch(`https://drive.google.com/thumbnail?id=${id}&sz=w${w}`, { redirect: "follow" });
        const type = res.headers.get("content-type") ?? "";
        if (!res.ok || !type.startsWith("image/")) throw new Error(`fetch ${res.status} ${type}`);
        const b = await put(`portfolio/${id}-${w}.jpg`, Buffer.from(await res.arrayBuffer()), { access: "public", contentType: "image/jpeg", addRandomSuffix: false });
        r[k] = b.url;
      }
      out.push({ id, large: r.large, small: r.small });
    } catch (e) { out.push({ id, error: String(e).slice(0, 200) }); }
  }
  return NextResponse.json({ out });
}
