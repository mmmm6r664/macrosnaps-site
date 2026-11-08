// Admin-only: hands the signed-in admin the key for the temporary Snappr import route. Safe to remove after the import.
import { NextResponse } from "next/server";
import { currentUser } from "@/lib/auth";
import { importKey } from "@/lib/snapprKey";

export const dynamic = "force-dynamic";
export async function GET() {
  const u = await currentUser();
  if (!u || u.role === "staff") return NextResponse.json({ error: "no" }, { status: 403 });
  return NextResponse.json({ k: importKey() }, { headers: { "cache-control": "no-store" } });
}
