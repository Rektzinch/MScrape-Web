export const ALL_LIMITS = [10, 50, 75, 100, 150, 250, 500] as const;

export type ResultLimit = (typeof ALL_LIMITS)[number];
export type LicenseTier = "free" | "pro" | "max";

export type PlanAccess = {
  tier: LicenseTier;
  label: "Free" | "Pro" | "Max";
  maxLimit: ResultLimit;
  allowedLimits: ResultLimit[];
  cooldownSeconds: number;
  nextAllowedAt: string | null;
};

export const PLAN_RULES: Record<
  LicenseTier,
  Omit<PlanAccess, "nextAllowedAt">
> = {
  free: {
    tier: "free",
    label: "Free",
    maxLimit: 10,
    allowedLimits: [10],
    cooldownSeconds: 300,
  },
  pro: {
    tier: "pro",
    label: "Pro",
    maxLimit: 100,
    allowedLimits: [10, 50, 75, 100],
    cooldownSeconds: 30,
  },
  max: {
    tier: "max",
    label: "Max",
    maxLimit: 500,
    allowedLimits: [...ALL_LIMITS],
    cooldownSeconds: 0,
  },
};

export function planAccess(
  tier: LicenseTier,
  nextAllowedAt: string | null = null,
): PlanAccess {
  return {
    ...PLAN_RULES[tier],
    allowedLimits: [...PLAN_RULES[tier].allowedLimits],
    nextAllowedAt,
  };
}

export function isResultLimit(value: number): value is ResultLimit {
  return ALL_LIMITS.includes(value as ResultLimit);
}
