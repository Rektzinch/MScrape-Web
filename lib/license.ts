import { createHmac, timingSafeEqual } from "node:crypto";
import {
  readStore,
  reserveStoreKey,
  storeTtl,
  writeStore,
} from "@/lib/durable-store";
import { planAccess, type LicenseTier, type PlanAccess } from "@/lib/plans";

export const LICENSE_COOKIE = "mscrape_license";
export const LICENSE_TERM_MONTHS = 2;

type ValidLicense = {
  id: string;
  tier: Exclude<LicenseTier, "free">;
};

type LicenseRecord = {
  version: 1;
  tier: ValidLicense["tier"];
  redeemedAt: number;
  expiresAt: number;
  revokedAt: number | null;
};

export type ResolvedLicense = {
  access: PlanAccess;
  licenseId: string | null;
};

type LicenseSession = {
  version: 1;
  tier: ValidLicense["tier"];
  id: string;
  redeemedAt: number;
  expiresAt: number;
};

function secret() {
  return process.env.MSCRAPE_LICENSE_SECRET?.trim() || "";
}

function signature(tier: string, id: string) {
  const key = secret();
  if (!key) return "";

  return createHmac("sha256", key)
    .update(`MSC1|${tier}|${id}`)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();
}

function safeEqual(left: string, right: string) {
  const a = Buffer.from(left);
  const b = Buffer.from(right);
  return a.length === b.length && timingSafeEqual(a, b);
}

function sessionSignature(payload: string) {
  const key = secret();
  if (!key) return "";

  return createHmac("sha256", key)
    .update(`MSL1|${payload}`)
    .digest("base64url");
}

function licenseKey(id: string) {
  return `mscrape:license:${id}`;
}

function addLicenseTerm(redeemedAt: Date) {
  const expiresAt = new Date(redeemedAt);
  const originalDay = expiresAt.getUTCDate();
  expiresAt.setUTCDate(1);
  expiresAt.setUTCMonth(expiresAt.getUTCMonth() + LICENSE_TERM_MONTHS);
  const lastDay = new Date(Date.UTC(
    expiresAt.getUTCFullYear(),
    expiresAt.getUTCMonth() + 1,
    0,
  )).getUTCDate();
  expiresAt.setUTCDate(Math.min(originalDay, lastDay));
  return expiresAt;
}

function encodeSession(session: LicenseSession) {
  const payload = Buffer.from(JSON.stringify(session)).toString("base64url");
  return `${payload}.${sessionSignature(payload)}`;
}

function decodeSession(value: string): LicenseSession | null {
  if (!activationIsConfigured()) return null;

  const [payload, suppliedSignature, ...rest] = value.split(".");
  if (!payload || !suppliedSignature || rest.length > 0) return null;
  if (!safeEqual(suppliedSignature, sessionSignature(payload))) return null;

  try {
    const parsed = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as Partial<LicenseSession>;
    if (
      parsed.version !== 1
      || (parsed.tier !== "pro" && parsed.tier !== "max")
      || typeof parsed.id !== "string"
      || !/^[A-F0-9]{12}$/.test(parsed.id)
      || !Number.isSafeInteger(parsed.redeemedAt)
      || !Number.isSafeInteger(parsed.expiresAt)
      || parsed.expiresAt! <= parsed.redeemedAt!
    ) return null;

    return parsed as LicenseSession;
  } catch {
    return null;
  }
}

function decodeRecord(value: string | null): LicenseRecord | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<LicenseRecord>;
    if (
      parsed.version !== 1
      || (parsed.tier !== "pro" && parsed.tier !== "max")
      || !Number.isSafeInteger(parsed.redeemedAt)
      || !Number.isSafeInteger(parsed.expiresAt)
      || parsed.expiresAt! <= parsed.redeemedAt!
      || (parsed.revokedAt !== null && !Number.isSafeInteger(parsed.revokedAt))
    ) return null;
    return parsed as LicenseRecord;
  } catch {
    return null;
  }
}

function cookieValue(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

function freeLicense(): ResolvedLicense {
  return { access: planAccess("free"), licenseId: null };
}

export function activationIsConfigured() {
  return secret().length >= 32;
}

export function validateLicenseCode(input: unknown): ValidLicense | null {
  if (!activationIsConfigured() || typeof input !== "string") return null;

  const code = input.trim().toUpperCase().replaceAll(" ", "");
  const match = /^MSC1-(PRO|MAX)-([A-F0-9]{12})-([A-F0-9]{24})$/.exec(code);
  if (!match) return null;

  const [, tierPart, id, suppliedSignature] = match;
  const expectedSignature = signature(tierPart, id);
  if (!safeEqual(suppliedSignature, expectedSignature)) return null;

  return { id, tier: tierPart === "PRO" ? "pro" : "max" };
}

export async function resolveLicense(request: Request): Promise<ResolvedLicense> {
  const session = decodeSession(cookieValue(request, LICENSE_COOKIE));
  if (!session || session.expiresAt <= Date.now()) return freeLicense();

  const record = decodeRecord(await readStore(licenseKey(session.id)));
  if (
    !record
    || record.revokedAt !== null
    || record.tier !== session.tier
    || record.redeemedAt !== session.redeemedAt
    || record.expiresAt !== session.expiresAt
    || record.expiresAt <= Date.now()
  ) return freeLicense();

  return {
    access: planAccess(
      record.tier,
      null,
      new Date(record.expiresAt).toISOString(),
      new Date(record.redeemedAt).toISOString(),
    ),
    licenseId: session.id,
  };
}

export async function redeemLicense(license: ValidLicense, redeemedAt = new Date()) {
  const expiresAt = addLicenseTerm(redeemedAt);
  const ttlSeconds = Math.max(1, Math.floor((expiresAt.getTime() - redeemedAt.getTime()) / 1_000));
  const record: LicenseRecord = {
    version: 1,
    tier: license.tier,
    redeemedAt: redeemedAt.getTime(),
    expiresAt: expiresAt.getTime(),
    revokedAt: null,
  };
  const reserved = await reserveStoreKey(
    licenseKey(license.id),
    JSON.stringify(record),
    ttlSeconds,
  );
  if (!reserved) return { redeemed: false as const };

  const session = encodeSession({
    version: 1,
    tier: license.tier,
    id: license.id,
    redeemedAt: record.redeemedAt,
    expiresAt: record.expiresAt,
  });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return {
    redeemed: true as const,
    access: planAccess(license.tier, null, expiresAt.toISOString(), redeemedAt.toISOString()),
    cookie: `${LICENSE_COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ttlSeconds}; Expires=${expiresAt.toUTCString()}${secure}`,
  };
}

export async function revokeLicense(id: string) {
  if (!/^[A-F0-9]{12}$/.test(id)) return false;
  const key = licenseKey(id);
  const record = decodeRecord(await readStore(key));
  const ttlSeconds = await storeTtl(key);
  if (!record || ttlSeconds <= 0) return false;

  await writeStore(
    key,
    JSON.stringify({ ...record, revokedAt: Date.now() }),
    ttlSeconds,
  );
  return true;
}
