// Simple per-IP limiter (in memory, per server instance). Stops floods of tracking pings and form posts.
const hits = new Map<string, number[]>();

/** Returns true when this key has used up `max` requests in the last `windowMs`. */
export function limited(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) ?? []).filter((t) => now - t < windowMs);
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) for (const [k, v] of hits) if (!v.some((t) => now - t < windowMs)) hits.delete(k);
  return recent.length > max;
}
