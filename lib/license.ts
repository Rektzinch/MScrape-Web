import { createHmac, timingSafeEqual } from "node:crypto";
import { planAccess, type LicenseTier, type PlanAccess } from "@/lib/plans";

export const LICENSE_COOKIE = "mscrape_license";

type ValidLicense = {
  code: string;
  id: string;
  tier: Exclude<LicenseTier, "free">;
};

export type ResolvedLicense = {
  access: PlanAccess;
  licenseId: string | null;
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
  const license = validateLicenseCode(cookieValue(request, LICENSE_COOKIE));
  if (!license) return { access: planAccess("free"), licenseId: null };

  return {
    access: planAccess(license.tier),
    licenseId: license.id,
  };
}

export function licenseCookie(code: string) {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  return `${LICENSE_COOKIE}=${encodeURIComponent(code)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=31536000${secure}`;
}
