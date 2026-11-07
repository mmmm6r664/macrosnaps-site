// Text messages through Twilio (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM).
import "server-only";

export const smsReady = () => !!(process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN && process.env.TWILIO_FROM);

/** US/Canada numbers to E.164 (+1XXXXXXXXXX); returns null when it doesn't look like a valid number. */
export function toE164(phone: string | null | undefined): string | null {
  const d = String(phone ?? "").replace(/\D/g, "");
  if (d.length === 10) return `+1${d}`;
  if (d.length === 11 && d.startsWith("1")) return `+${d}`;
  return null;
}

export async function sendSms(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!smsReady()) return { ok: false, error: "Text messaging isn't connected (Twilio)." };
  const num = toE164(to);
  if (!num) return { ok: false, error: "Invalid phone number" };
  const sid = process.env.TWILIO_ACCOUNT_SID!;
  const r = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
    method: "POST",
    headers: { Authorization: `Basic ${Buffer.from(`${sid}:${process.env.TWILIO_AUTH_TOKEN}`).toString("base64")}`, "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ To: num, From: process.env.TWILIO_FROM!, Body: body.slice(0, 1500) }),
  }).catch((e) => ({ ok: false, json: async () => ({ message: String(e) }) }) as unknown as Response);
  if (r.ok) return { ok: true };
  const j = await r.json().catch(() => ({}));
  return { ok: false, error: (j as { message?: string }).message ?? "Twilio error" };
}
