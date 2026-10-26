import { headers } from "next/headers";

/**
 * Einfaches Rate-Limit für öffentliche Formular-Actions (best effort).
 *
 * Fixed-Window pro IP im Speicher der jeweiligen Serverless-Instanz — bremst
 * einfache Skripte, ist aber KEIN harter Schutz (Instanzen teilen keinen
 * Speicher). Zusätzlich empfohlen: Vercel-Firewall-Rate-Limit-Regel.
 * Limits großzügig, damit echte Gäste hinter einem gemeinsamen WLAN nicht
 * ausgesperrt werden.
 */
const buckets = new Map<string, { count: number; resetAt: number }>();

export async function isRateLimited(
  scope: string,
  max: number,
  windowMs: number,
): Promise<boolean> {
  const h = await headers();
  const ip =
    h.get("x-real-ip") ??
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown";
  const key = `${scope}:${ip}`;
  const now = Date.now();

  // Abgelaufene Einträge gelegentlich aufräumen (Speicher begrenzen).
  if (buckets.size > 5000) {
    for (const [k, v] of buckets) if (v.resetAt <= now) buckets.delete(k);
  }

  const b = buckets.get(key);
  if (!b || b.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return false;
  }
  b.count += 1;
  return b.count > max;
}
