import { DurableStoreError, evalStore, readStore } from "@/lib/durable-store";
import { recordCreditUsage } from "@/lib/admin-license-ledger";
import type { ResolvedLicense } from "@/lib/license";
import { planAccess, type PlanAccess } from "@/lib/plans";

const FREE_CREDIT_TTL_SECONDS = 60 * 60 * 24 * 30;

const consumeOneCredit = [
  "local current = redis.call('GET', KEYS[1])",
  "if not current then",
  "  local initialized = tonumber(ARGV[2]) - 1",
  "  redis.call('SET', KEYS[1], tostring(initialized), 'EX', ARGV[1])",
  "  return initialized",
  "end",
  "local remaining = tonumber(current)",
  "if not remaining then return -2 end",
  "if remaining < 1 then return -1 end",
  "redis.call('DECR', KEYS[1])",
  "return remaining - 1",
].join("\n");

function creditSubject(license: ResolvedLicense, visitorId: string) {
  return license.licenseId ? `license:${license.licenseId}` : `visitor:${visitorId}`;
}

function creditKey(license: ResolvedLicense, visitorId: string) {
  return `mscrape:credit:${license.access.tier}:${creditSubject(license, visitorId)}`;
}

function ttlSeconds(access: PlanAccess) {
  if (!access.expiresAt) return FREE_CREDIT_TTL_SECONDS;
  return Math.max(1, Math.floor((new Date(access.expiresAt).getTime() - Date.now()) / 1_000));
}

function withCredit(access: PlanAccess, creditRemaining: number) {
  return planAccess(
    access.tier,
    access.nextAllowedAt,
    access.expiresAt,
    access.activatedAt,
    creditRemaining,
  );
}

function validCredit(value: string | null, total: number) {
  if (value === null) return total;
  const credit = Number(value);
  if (!Number.isSafeInteger(credit) || credit < 0 || credit > total) {
    throw new DurableStoreError("Ledger kredit tidak konsisten.");
  }
  return credit;
}

export async function readCreditAccess(
  license: ResolvedLicense,
  visitorId: string,
  access: PlanAccess,
) {
  const credit = validCredit(
    await readStore(creditKey(license, visitorId)),
    access.creditTotal,
  );
  return withCredit(access, credit);
}

export async function consumeCredit(
  license: ResolvedLicense,
  visitorId: string,
  access: PlanAccess,
): Promise<{ allowed: boolean; access: PlanAccess }> {
  const result = await evalStore<number | string>(
    consumeOneCredit,
    [creditKey(license, visitorId)],
    [String(ttlSeconds(access)), String(access.creditTotal)],
  );
  const remaining = typeof result === "number" ? result : Number(result);

  if (!Number.isSafeInteger(remaining) || remaining < -1 || remaining >= access.creditTotal) {
    throw new DurableStoreError("Ledger kredit tidak konsisten.");
  }

  if (remaining < 0) return { allowed: false, access: withCredit(access, 0) };
  if (license.licenseId && (license.access.tier === "pro" || license.access.tier === "max")) {
    try {
      await recordCreditUsage(license.licenseId, license.access.tier, visitorId, remaining);
    } catch {
      // ponytail: audit tidak boleh membatalkan scan yang kreditnya sudah dipotong atomik.
    }
  }
  return { allowed: true, access: withCredit(access, remaining) };
}
