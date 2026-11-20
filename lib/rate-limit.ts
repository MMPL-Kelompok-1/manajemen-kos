// Disimpan di memori proses: ganti dengan penyimpanan bersama (mis. Redis) bila lebih dari satu instance.
import { ApiError } from "@/lib/errors";

type Window = { limit: number; windowMs: number };

const buckets = new Map<string, { windowMs: number; hits: number[] }>();
const MAX_BUCKETS = 10_000;

function recent(key: string, windowMs: number, now: number): number[] {
  const hits = (buckets.get(key)?.hits ?? []).filter((time) => now - time < windowMs);
  if (hits.length > 0) buckets.set(key, { windowMs, hits });
  else buckets.delete(key);
  return hits;
}

// Membersihkan key kedaluwarsa agar Map tidak tumbuh tanpa batas.
function prune(now: number) {
  if (buckets.size < MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) recent(key, bucket.windowMs, now);
}

export function assertNotLimited(keys: string[], { limit, windowMs }: Window, now = Date.now()) {
  for (const key of keys) {
    const hits = recent(key, windowMs, now);
    if (hits.length >= limit) {
      const minutes = Math.max(1, Math.ceil((hits[0] + windowMs - now) / 60_000));
      throw new ApiError(`Terlalu banyak percobaan. Coba lagi dalam ${minutes} menit.`, 429);
    }
  }
}

export function recordHit(keys: string[], { windowMs }: Window, now = Date.now()) {
  prune(now);
  for (const key of keys) {
    const hits = recent(key, windowMs, now);
    hits.push(now);
    buckets.set(key, { windowMs, hits });
  }
}

export function resetHits(keys: string[]) {
  for (const key of keys) buckets.delete(key);
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || request.headers.get("x-real-ip")?.trim() || "unknown";
}

export const LOGIN_LIMIT: Window = { limit: 5, windowMs: 15 * 60 * 1000 };
export const REGISTER_LIMIT: Window = { limit: 10, windowMs: 60 * 60 * 1000 };
