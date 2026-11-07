"use server";
import { requireUser } from "@/lib/auth";
import { sendMail } from "@/lib/mail";
import { SAMPLES } from "@/lib/emailSamples";

export type TestState = { ok?: string; error?: string } | undefined;

/** Sends one sample (or all) to the signed-in admin's own email address. */
export async function sendTest(_: TestState, fd: FormData): Promise<TestState> {
  const u = await requireUser();
  const key = String(fd.get("key") ?? "");
  const list = key === "all" ? SAMPLES : SAMPLES.filter((s) => s.key === key);
  if (!list.length) return { error: "Unknown email." };
  let ok = 0;
  for (const s of list) {
    const m = s.build();
    if ((await sendMail({ to: u.email, subject: `[TEST] ${m.subject}`, html: m.html })).ok) ok++;
  }
  return ok === list.length ? { ok: `Sent ${ok} test email${ok === 1 ? "" : "s"} to ${u.email}.` } : { error: `Sent ${ok} of ${list.length}. Is email (Resend) connected?` };
}
