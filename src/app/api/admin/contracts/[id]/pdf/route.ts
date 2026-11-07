import { NextResponse } from "next/server";
import { currentUser, isManager } from "@/lib/auth";
import { contractPdf } from "@/lib/esign";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const u = await currentUser();
  if (!u || !isManager(u) || !u.totp_enabled) return new NextResponse("Not found", { status: 404 });
  const c = await contractPdf({ id: Number((await params).id) || 0 });
  if (!c?.pdf) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(c.pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="MacroSnaps-Agreement-${c.signer_name.replace(/[^\w]+/g, "-")}-MS-C${c.id}.pdf"`, "cache-control": "no-store" } });
}
