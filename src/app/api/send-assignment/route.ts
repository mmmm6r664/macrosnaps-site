import { NextResponse } from "next/server";
import { importKey } from "@/lib/snapprKey";
import { crewAssignment, type CrewAssignment } from "@/lib/emails";
import { sendMail } from "@/lib/mail";

export const dynamic = "force-dynamic";

/** Temporary: send a crew assignment email (key-protected). */
export async function GET(req: Request) {
  const u = new URL(req.url);
  const key = importKey();
  if (!key || u.searchParams.get("k") !== key) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const d = JSON.parse(Buffer.from(u.searchParams.get("d") || "", "base64url").toString("utf8")) as CrewAssignment & { to: string };
  const e = crewAssignment(d);
  if (u.searchParams.get("dry")) return NextResponse.json({ to: d.to, subject: e.subject });
  const r = await sendMail({ to: d.to, subject: e.subject, html: e.html });
  return NextResponse.json({ to: d.to, subject: e.subject, result: r });
}
