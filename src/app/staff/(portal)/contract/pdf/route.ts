import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { q } from "@/lib/db";

export const dynamic = "force-dynamic";

/** A staff member's own most recent signed agreement. */
export async function GET() {
  const u = await currentUser();
  if (!u) return new NextResponse("Not found", { status: 404 });
  const c = (await q<{ id: number; pdf: Buffer }[]>`select id, pdf from contracts where status = 'signed' and pdf is not null and (user_id = ${u.id} or lower(signer_email) = ${u.email.toLowerCase()}) order by signed_at desc limit 1`)[0];
  if (!c) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(c.pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="MacroSnaps-Agreement-MS-C${c.id}.pdf"`, "cache-control": "no-store" } });
}
