// Newsletter open and click tracking: a 1×1 pixel per email and signed redirect links, logged in newsletter_events.
import "server-only";
import { createHmac } from "crypto";

const ORIGIN = process.env.NEXT_PUBLIC_SITE_URL || (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "https://www.macrosnaps.com");
const secret = () => process.env.CRON_SECRET || process.env.MCP_KEY || "macrosnaps-nl";

/** Short signature so the click redirect only goes to links that were really in the email. */
export const sign = (nid: number, url: string) => createHmac("sha256", secret()).update(`${nid}|${url}`).digest("base64url").slice(0, 16);

/** Adds the open pixel and wraps every link except unsubscribe links. */
export function addTracking(html: string, nid: number, token: string) {
  const t = encodeURIComponent(token);
  const linked = html.replace(/href="(https?:\/\/[^"]+)"/g, (m, raw: string) => {
    const url = raw.replace(/&amp;/g, "&");
    if (/unsubscribe/i.test(url)) return m;
    return `href="${ORIGIN}/api/nl/c?n=${nid}&amp;t=${t}&amp;u=${encodeURIComponent(url)}&amp;s=${sign(nid, url)}"`;
  });
  const pixel = `<img src="${ORIGIN}/api/nl/o?n=${nid}&amp;t=${t}" width="1" height="1" alt="" style="display:block;width:1px;height:1px;border:0">`;
  return linked.includes("</body>") ? linked.replace("</body>", `${pixel}</body>`) : linked + pixel;
}
