// AES-256-GCM encryption for sensitive values (SSN / EIN). The key lives only in the TAX_ENCRYPTION_KEY
// environment variable (32 random bytes, base64). Without the key nothing can be decrypted, including from a database copy.
import "server-only";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

function key(): Buffer | null {
  const k = process.env.TAX_ENCRYPTION_KEY;
  if (!k) return null;
  const b = Buffer.from(k, "base64");
  return b.length === 32 ? b : null;
}
export const canEncrypt = () => !!key();

export function encrypt(plain: string): string {
  const k = key();
  if (!k) throw new Error("TAX_ENCRYPTION_KEY is not set");
  const iv = randomBytes(12);
  const c = createCipheriv("aes-256-gcm", k, iv);
  const enc = Buffer.concat([c.update(plain, "utf8"), c.final()]);
  return ["v1", iv.toString("base64"), c.getAuthTag().toString("base64"), enc.toString("base64")].join(".");
}

export function decrypt(token: string): string {
  const k = key();
  if (!k) throw new Error("TAX_ENCRYPTION_KEY is not set");
  const [v, iv, tag, data] = token.split(".");
  if (v !== "v1") throw new Error("Unknown format");
  const d = createDecipheriv("aes-256-gcm", k, Buffer.from(iv, "base64"));
  d.setAuthTag(Buffer.from(tag, "base64"));
  return Buffer.concat([d.update(Buffer.from(data, "base64")), d.final()]).toString("utf8");
}
