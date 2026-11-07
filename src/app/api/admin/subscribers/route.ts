import { currentUser, isManager } from "@/lib/auth";
import { db, q } from "@/lib/db";

export const dynamic = "force-dynamic";
const cell = (v: string) => `"${v.replace(/"/g, '""').replace(/^[=+\-@]/, "'$&")}"`; // also blocks spreadsheet formula injection

export async function GET() {
  const u = await currentUser();
  if (!u || !isManager(u)) return new Response("Unauthorized", { status: 401 });
  const rows = await q<{ email: string; name: string; status: string; source: string | null; created_at: Date }[]>`select email, name, status, source, created_at from subscribers order by created_at`;
  const csv = ["email,name,status,source,joined", ...rows.map((r) => [r.email, r.name, r.status, r.source ?? "", r.created_at.toISOString()].map(cell).join(","))].join("\n");
  return new Response(csv, { headers: { "content-type": "text/csv; charset=utf-8", "content-disposition": `attachment; filename="macrosnaps-subscribers.csv"`, "cache-control": "no-store" } });
}
