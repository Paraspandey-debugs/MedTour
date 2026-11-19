/**
 * In-memory rate limiter.
 *
 * Structured for a future Redis/Upstash swap: replace the Map with a Redis
 * sliding-window counter by exporting the same `rateLimit()` interface.
 */

interface Window {
  count: number;
  resetAt: number; // epoch ms
}

const store = new Map<string, Window>();

/**
 * Returns true when the caller is OVER the limit.
 * @param key      Unique identifier (userId or IP + route)
 * @param limit    Max requests per window
 * @param windowMs Window duration in milliseconds (default 60 000 = 1 min)
 */
export function rateLimit(key: string, limit: number, windowMs = 60_000): boolean {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return false; // not over limit
  }

  entry.count += 1;
  if (entry.count > limit) {
    return true; // over limit
  }
  return false;
}
