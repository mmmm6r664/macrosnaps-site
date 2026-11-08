import "server-only";
import { createHash } from "crypto";
/** Key for the temporary Snappr import route, derived from CRON_SECRET (only shown to signed-in admins). */
export const importKey = () => (process.env.CRON_SECRET ? createHash("sha256").update(`${process.env.CRON_SECRET}|snappr-import`).digest("hex").slice(0, 32) : "");
