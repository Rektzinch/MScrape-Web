import { createHash, createHmac, timingSafeEqual } from "node:crypto";
import type { ResolvedLicense } from "@/lib/license";
import { planAccess, type PlanAccess } from "@/lib/plans";

type RateEntry = { nextAllowedAt: number };

declare global {
  var __mscrapeRateLimits: Map<string, RateEntry> | undefined;
}

const rateLimits = globalThis.__mscrapeRateLimits ?? new Map<string, RateEntry>();
globalThis.__mscrapeRateLimits = rateLimits;
const RATE_COOKIE = "mscrape_cooldown";

function anonymousKey(request: Request) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const address = forwarded || request.headers.get("x-real-ip") || "local";
  const agent = request.headers.get("user-agent") || "unknown";
  return createHash("sha256").update(`${address}|${agent}`).digest("hex").slice(0, 24);
}

function keyFor(request: Request, license: ResolvedLicense) {
  return license.licenseId
    ? `${license.access.tier}:${license.licenseId}`
    : `free:${anonymousKey(request)}`;
}

function requestCookie(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

function signedNextAllowedAt(request: Request, key: string) {
  const secret = process.env.MSCRAPE_LICENSE_SECRET?.trim();
  const raw = requestCookie(request, RATE_COOKIE);
  if (!secret || !raw) return 0;

  const [cookieKey, timestamp, suppliedSignature] = raw.split("|");
  // Mobile browsers replace their User-Agent in desktop-site mode. Keep the
  // signed Free cooldown attached to the browser cookie across that switch.
  const compatibleKey = cookieKey === key
    || (key.startsWith("free:") && cookieKey?.startsWith("free:"));
  if (!compatibleKey || !/^\d+$/.test(timestamp) || !suppliedSignature) return 0;
  const expectedSignature = createHmac("sha256", secret)
    .update(`${cookieKey}|${timestamp}`)
    .digest("hex")
    .slice(0, 24);
  const left = Buffer.from(suppliedSignature);
  const right = Buffer.from(expectedSignature);
  if (left.length !== right.length || !timingSafeEqual(left, right)) return 0;
  return Number(timestamp);
}

function cooldownCookie(key: string, nextAllowedAt: number, maxAge: number) {
  const secret = process.env.MSCRAPE_LICENSE_SECRET?.trim();
  if (!secret) return null;
  const signature = createHmac("sha256", secret)
    .update(`${key}|${nextAllowedAt}`)
    .digest("hex")
    .slice(0, 24);
  const value = encodeURIComponent(`${key}|${nextAllowedAt}|${signature}`);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${RATE_COOKIE}=${value}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function cleanExpired(now: number) {
  if (rateLimits.size < 500) return;
  for (const [key, entry] of rateLimits) {
    if (entry.nextAllowedAt <= now) rateLimits.delete(key);
  }
}

export function readRateAccess(
  request: Request,
  license: ResolvedLicense,
): PlanAccess {
  if (license.access.cooldownSeconds === 0) {
    return planAccess(license.access.tier, null, license.access.expiresAt);
  }

  const now = Date.now();
  const key = keyFor(request, license);
  const entry = rateLimits.get(key);
  const timestamp = Math.max(entry?.nextAllowedAt || 0, signedNextAllowedAt(request, key));
  const nextAllowedAt = timestamp > now
    ? new Date(timestamp).toISOString()
    : null;

  return planAccess(license.access.tier, nextAllowedAt, license.access.expiresAt);
}

export function consumeRateLimit(
  request: Request,
  license: ResolvedLicense,
): { allowed: boolean; access: PlanAccess; retryAfter: number; cookie: string | null } {
  const now = Date.now();
  cleanExpired(now);

  if (license.access.cooldownSeconds === 0) {
    return {
      allowed: true,
      access: planAccess(license.access.tier, null, license.access.expiresAt),
      retryAfter: 0,
      cookie: null,
    };
  }

  const key = keyFor(request, license);
  const current = rateLimits.get(key);
  const currentNextAllowedAt = Math.max(
    current?.nextAllowedAt || 0,
    signedNextAllowedAt(request, key),
  );
  if (currentNextAllowedAt > now) {
    const retryAfter = Math.ceil((currentNextAllowedAt - now) / 1_000);
    return {
      allowed: false,
      access: planAccess(
        license.access.tier,
        new Date(currentNextAllowedAt).toISOString(),
        license.access.expiresAt,
      ),
      retryAfter,
      cookie: null,
    };
  }

  const nextAllowedAt = now + license.access.cooldownSeconds * 1_000;
  rateLimits.set(key, { nextAllowedAt });
  return {
    allowed: true,
    access: planAccess(
      license.access.tier,
      new Date(nextAllowedAt).toISOString(),
      license.access.expiresAt,
    ),
    retryAfter: 0,
    cookie: cooldownCookie(key, nextAllowedAt, license.access.cooldownSeconds),
  };
}
