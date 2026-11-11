import { legacyPostTarget } from "@/lib/legacy";
import { SITE } from "@/lib/site";

/** Old Wix blog posts: one permanent redirect straight to the closest live page. */
export async function GET(_: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params;
  const to = legacyPostTarget(decodeURIComponent(slug[0] ?? ""));
  return new Response(null, { status: 308, headers: { location: to.startsWith("http") ? to : `${SITE.url}${to}`, "cache-control": "public, max-age=86400" } });
}
export const HEAD = GET;
