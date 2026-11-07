import { NextResponse } from "next/server";
import { runCrewDelivery } from "@/lib/crewDelivery";

export const maxDuration = 120;

/** Hourly Vercel cron: asks crew for their Google Drive link about an hour after each shoot ends (due within 24 hours). */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json({ crew: await runCrewDelivery().catch((e) => ({ error: String(e) })) });
}
