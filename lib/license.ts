import { createHmac, timingSafeEqual } from "node:crypto";
import { planAccess, type LicenseTier, type PlanAccess } from "@/lib/plans";

export const LICENSE_COOKIE = "mscrape_license";
export const LICENSE_TERM_MONTHS = 1;

type ValidLicense = {
  code: string;
  id: string;
  tier: Exclude<LicenseTier, "free">;
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

  return {
    code,
    id,
    tier: tierPart === "PRO" ? "pro" : "max",
  };
}

function cookieValue(request: Request, name: string) {
  const raw = request.headers.get("cookie") || "";
  for (const part of raw.split(";")) {
    const [key, ...value] = part.trim().split("=");
    if (key === name) return decodeURIComponent(value.join("="));
  }
  return "";
}

export function resolveLicense(request: Request): ResolvedLicense {
  const session = decodeSession(cookieValue(request, LICENSE_COOKIE));
  if (!session || session.expiresAt <= Date.now()) {
    return { access: planAccess("free"), licenseId: null };
  }

  return {
    access: planAccess(
      session.tier,
      null,
      new Date(session.expiresAt).toISOString(),
      new Date(session.redeemedAt).toISOString(),
    ),
    licenseId: session.id,
  };
}

export function redeemLicense(license: ValidLicense, redeemedAt = new Date()) {
  const expiresAt = addLicenseTerm(redeemedAt);
  const session = encodeSession({
    version: 1,
    tier: license.tier,
    id: license.id,
    redeemedAt: redeemedAt.getTime(),
    expiresAt: expiresAt.getTime(),
  });
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const maxAge = Math.max(0, Math.floor((expiresAt.getTime() - redeemedAt.getTime()) / 1_000));

  return {
    access: planAccess(license.tier, null, expiresAt.toISOString(), redeemedAt.toISOString()),
    cookie: `${LICENSE_COOKIE}=${encodeURIComponent(session)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}; Expires=${expiresAt.toUTCString()}${secure}`,
  };
}
