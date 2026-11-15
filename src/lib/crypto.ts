// AES-256-GCM encryption for sensitive values (SSN / EIN).
// Key: TAX_ENCRYPTION_KEY (32 random bytes, base64) when set ("v1" tokens). If it isn't set, a key is derived
// server-side from the CRON_SECRET environment variable with HKDF ("d1" tokens), so no secret has to be typed anywhere.
// Either way the key lives only in Vercel's encrypted environment, never in the database or the repo:
// a database copy alone can't be decrypted. Note: if CRON_SECRET is ever changed, "d1" values can no longer be read.
import "server-only";
import { createCipheriv, createDecipheriv, randomBytes, hkdfSync } from "crypto";

function explicitKey(): Buffer | null {
  const k = process.env.TAX_ENCRYPTION_KEY;
  if (!k) return null;
  const b = Buffer.from(k, "base64");
  return b.length === 32 ? b : null;
}

function derivedKey(): Buffer | null {
  const s = process.env.CRON_SECRET;
  if (!s || s.length < 16) return null;
  return Buffer.from(hkdfSync("sha256", s, "macrosnaps-tax-encryption", "tin-v1", 32));
}

export const canEncrypt = () => !!(explicitKey() ?? derivedKey());

export function encrypt(plain: string): string {
  const ek = explicitKey();
  const [v, k] = ek ? ["v1", ek] : ["d1", derivedKey()];
  if (!k) throw new Error("No encryption key available");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return [v, iv.toString("base64"), c.getAuthTag().toString("base64"), enc.toString("base64")].join(".");
}

export function decrypt(token: string): string {
  const [v, iv, tag, data] = token.split(".");
  const k = v === "v1" ? explicitKey() : v === "d1" ? derivedKey() : null;
  if (!k) throw new Error(v === "v1" || v === "d1" ? "Encryption key not available" : "Unknown format");
  const d = createDecipheriv("aes-256-gcm", k, Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8");
}
