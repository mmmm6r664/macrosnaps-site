import { NextResponse } from "next/server";
import { db, hasDb, q } from "@/lib/db";
import { sendNewsletter } from "@/lib/newsletter";
import { runDailyAutomations } from "@/lib/automations";

export const maxDuration = 300;

/** Daily Vercel cron: sends newsletters scheduled for today or earlier, plus the email automations (reminders, welcome series, review requests). Vercel signs requests with CRON_SECRET. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!hasDb) return NextResponse.json({ skipped: "no database" });
  const due = await q<{ id: number }[]>`select id from newsletters where status = 'scheduled' and scheduled_at <= now() + interval '1 hour' order by scheduled_at`;
  const results = [];
  for (const n of due) results.push({ id: n.id, ...(await sendNewsletter(n.id)) });
  const automations = await runDailyAutomations().catch((e) => ({ error: String(e) }));
  return NextResponse.json({ results, automations });
}
