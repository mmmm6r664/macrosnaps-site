import { NextResponse } from "next/server";
import { contractPdf } from "@/lib/esign";

export const dynamic = "force-dynamic";

export async function GET(_: Request, { params }: { params: Promise<{ token: string }> }) {
  const c = await contractPdf({ token: (await params).token.slice(0, 100) }).catch(() => null);
  if (!c?.pdf) return new NextResponse("Not found", { status: 404 });
  return new NextResponse(new Uint8Array(c.pdf), { headers: { "content-type": "application/pdf", "content-disposition": `attachment; filename="MacroSnaps-Agreement-MS-C${c.id}.pdf"`, "cache-control": "no-store", "x-robots-tag": "noindex" } });
}
