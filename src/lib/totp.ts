// Time-based one-time passwords (RFC 6238), the codes from Google Authenticator, Microsoft Authenticator, 1Password, Authy…
import "server-only";
import { createHmac, randomBytes, timingSafeEqual } from "crypto";

const B32 = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
export function newSecret(): string {
  const bytes = randomBytes(20);
  let bits = "", out = "";
  for (const b of bytes) bits += b.toString(2).padStart(8, "0");
  for (let i = 0; i + 5 <= bits.length; i += 5) out += B32[parseInt(bits.slice(i, i + 5), 2)];
  return out;
}
function decode(s: string): Buffer {
  let bits = "";
  for (const c of s.replace(/=+$/, "").toUpperCase()) { const v = B32.indexOf(c); if (v < 0) continue; bits += v.toString(2).padStart(5, "0"); }
  const out: number[] = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) out.push(parseInt(bits.slice(i, i + 8), 2));
  return Buffer.from(out);
}
function hotp(secret: string, counter: number): string {
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const h = createHmac("sha1", decode(secret)).update(msg).digest();
  const o = h[h.length - 1] & 0xf;
  const n = ((h[o] & 0x7f) << 24) | (h[o + 1] << 16) | (h[o + 2] << 8) | h[o + 3];
  return String(n % 1_000_000).padStart(6, "0");
}
/** Returns the matching time-step counter (to block reuse), or null. Accepts ±1 step (30 s) of clock drift. */
export function verifyTotp(secret: string, code: string, now = Date.now()): number | null {
  const c = code.replace(/\s/g, "");
  if (!/^\d{6}$/.test(c)) return null;
  const t = Math.floor(now / 30000);
  for (const d of [0, -1, 1]) {
    const want = Buffer.from(hotp(secret, t + d));
    if (timingSafeEqual(want, Buffer.from(c))) return t + d;
  }
  return null;
}
export const otpauthUrl = (secret: string, email: string) =>
  `otpauth://totp/${encodeURIComponent(`MacroSnaps:${email}`)}?secret=${secret}&issuer=MacroSnaps&algorithm=SHA1&digits=6&period=30`;
