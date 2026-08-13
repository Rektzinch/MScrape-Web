import { createHash } from "node:crypto";
import { DurableStoreError, readStore, reserveStoreKey } from "@/lib/durable-store";
import type { ResolvedLicense } from "@/lib/license";
import { planAccess, type PlanAccess } from "@/lib/plans";

function clientAddress(request: Request) {
  const configuredHeader = process.env.MSCRAPE_TRUSTED_IP_HEADER?.trim().toLowerCase()
    || "cf-connecting-ip";
  return request.headers.get(configuredHeader)?.trim() || "unverified-origin";
}

function anonymousKey(request: Request) {
  const address = clientAddress(request);
  const agent = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${address}|${agent}`).digest("hex").slice(0, 24);
}

function keyFor(request: Request, license: ResolvedLicense) {
  return license.licenseId
    ? `mscrape:cooldown:${license.access.tier}:${license.licenseId}`
    : `mscrape:cooldown:free:${anonymousKey(request)}`;
}

function accessFor(license: ResolvedLicense, nextAllowedAt: number | null) {
  return planAccess(
    license.access.tier,
    nextAllowedAt ? new Date(nextAllowedAt).toISOString() : null,
    license.access.expiresAt,
    license.access.activatedAt,
  );
}

function parseTimestamp(value: string | null) {
  const timestamp = Number(value);
  return Number.isSafeInteger(timestamp) && timestamp > 0 ? timestamp : 0;
}

async function existingTimestamp(key: string, now: number) {
  const timestamp = parseTimestamp(await readStore(key));
  return timestamp > now ? timestamp : 0;
}

export async function readRateAccess(
  request: Request,
  license: ResolvedLicense,
): Promise<PlanAccess> {
  if (license.access.cooldownSeconds === 0) return accessFor(license, null);

  const now = Date.now();
  const nextAllowedAt = await existingTimestamp(keyFor(request, license), now);
  return accessFor(license, nextAllowedAt || null);
}

export async function consumeRateLimit(
  request: Request,
  license: ResolvedLicense,
): Promise<{ allowed: boolean; access: PlanAccess; retryAfter: number }> {
  if (license.access.cooldownSeconds === 0) {
    return { allowed: true, access: accessFor(license, null), retryAfter: 0 };
  }

  const now = Date.now();
  const cooldownSeconds = license.access.cooldownSeconds;
  const key = keyFor(request, license);
  const nextAllowedAt = now + cooldownSeconds * 1_000;

  for (let attempt = 0; attempt < 2; attempt += 1) {
    const reserved = await reserveStoreKey(key, String(nextAllowedAt), cooldownSeconds);
    if (reserved) {
      return {
        allowed: true,
        access: accessFor(license, nextAllowedAt),
        retryAfter: 0,
      };
    }

    const existing = await existingTimestamp(key, now);
    if (existing) {
      return {
        allowed: false,
        access: accessFor(license, existing),
        retryAfter: Math.ceil((existing - now) / 1_000),
      };
    }
  }

  throw new DurableStoreError("Limiter keamanan sedang tidak konsisten. Coba lagi.");
}
