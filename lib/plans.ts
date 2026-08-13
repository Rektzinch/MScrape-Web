export const NUMERIC_LIMITS = [10, 50, 75, 100, 150, 250, 500] as const;
export const ALL_RESULTS_LIMIT = "all" as const;
export const ALL_LIMITS = [...NUMERIC_LIMITS, ALL_RESULTS_LIMIT] as const;

export type ResultLimit = number | typeof ALL_RESULTS_LIMIT;
export type LicenseTier = "free" | "pro" | "max";

export type PlanAccess = {
  tier: LicenseTier;
  label: "Free" | "Pro" | "Max";
  maxLimit: ResultLimit;
  allowedLimits: ResultLimit[];
  cooldownSeconds: number;
  allowsCustomLimit: boolean;
  nextAllowedAt: string | null;
  activatedAt: string | null;
  expiresAt: string | null;
};

export const PLAN_RULES: Record<
  LicenseTier,
  Omit<PlanAccess, "nextAllowedAt" | "activatedAt" | "expiresAt">
> = {
  free: {
    tier: "free",
    label: "Free",
    maxLimit: 10,
    allowedLimits: [10],
    cooldownSeconds: 3_600,
    allowsCustomLimit: false,
  },
  pro: {
    tier: "pro",
    label: "Pro",
    maxLimit: 250,
    allowedLimits: NUMERIC_LIMITS.filter((limit) => limit <= 250),
    cooldownSeconds: 60,
    allowsCustomLimit: true,
  },
  max: {
    tier: "max",
    label: "Max",
    maxLimit: 500,
    allowedLimits: [...NUMERIC_LIMITS],
    cooldownSeconds: 0,
    allowsCustomLimit: true,
  },
};

export function planAccess(
  tier: LicenseTier,
  nextAllowedAt: string | null = null,
  expiresAt: string | null = null,
  activatedAt: string | null = null,
): PlanAccess {
  return {
    ...PLAN_RULES[tier],
    allowedLimits: [...PLAN_RULES[tier].allowedLimits],
    nextAllowedAt,
    activatedAt,
    expiresAt,
  };
}

export function isResultLimit(value: unknown): value is ResultLimit {
  return value === ALL_RESULTS_LIMIT
    || (typeof value === "number" && Number.isSafeInteger(value) && value > 0);
}

export function allowsResultLimit(access: PlanAccess, limit: ResultLimit) {
  if (access.allowedLimits.includes(limit)) return true;
  if (!access.allowsCustomLimit || limit === ALL_RESULTS_LIMIT) return false;
  return access.maxLimit === ALL_RESULTS_LIMIT || limit <= access.maxLimit;
}
