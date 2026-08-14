import { createHmac, randomBytes } from "node:crypto";
import {
  deleteStore,
  listStore,
  pushStore,
  readStore,
  reserveStoreKey,
  trimStore,
  writeStore,
} from "@/lib/durable-store";
import { planAccess, type LicenseTier } from "@/lib/plans";

const INVENTORY_TTL_SECONDS = 60 * 60 * 24 * 365 * 3;
const MAX_INDEX_ENTRIES = 5_000;
const MAX_HISTORY_ENTRIES = 200;

export type ManagedTier = Extract<LicenseTier, "pro" | "max">;

type InventoryRecord = {
  version: 1;
  id: string;
  tier: ManagedTier;
  createdAt: number;
  redeemedAt: number | null;
  expiresAt: number | null;
  visitorId: string | null;
  firstActiveAt: number | null;
  lastActiveAt: number | null;
  lastResetAt: number | null;
  lastResetReason: string | null;
};

type HistoryItem = {
  at: number;
  delta: number;
  remaining: number;
  visitorId: string | null;
  event: "scan" | "reset";
  reason?: string;
};

function gatewaySecret() {
  return process.env.MSCRAPE_LICENSE_SECRET?.trim() || "";
}

function assertManagedTier(value: unknown): value is ManagedTier {
  return value === "pro" || value === "max";
}

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[A-F0-9]{12}$/.test(value);
}

function inventoryKey(id: string) {
  return `mscrape:license-inventory:${id}`;
}

function licenseKey(id: string) {
  return `mscrape:license:${id}`;
}

function creditKey(tier: ManagedTier, id: string) {
  return `mscrape:credit:${tier}:license:${id}`;
}

function historyKey(id: string) {
  return `mscrape:license-history:${id}`;
}

function indexKey() {
  return "mscrape:license-inventory-index";
}

function codeFor(tier: ManagedTier, id: string) {
  const secret = gatewaySecret();
  if (secret.length < 32) throw new Error("Aktivasi lisensi belum dikonfigurasi.");
  const signature = createHmac("sha256", secret)
    .update(`MSC1|${tier.toUpperCase()}|${id}`)
    .digest("hex")
    .slice(0, 24)
    .toUpperCase();
  return `MSC1-${tier.toUpperCase()}-${id}-${signature}`;
}

function decodeInventory(raw: string | null): InventoryRecord | null {
  if (!raw) return null;
  try {
    const record = JSON.parse(raw) as Partial<InventoryRecord>;
    if (
      record.version !== 1
      || !validId(record.id)
      || !assertManagedTier(record.tier)
      || !Number.isSafeInteger(record.createdAt)
      || ![record.redeemedAt, record.expiresAt, record.visitorId, record.firstActiveAt, record.lastActiveAt, record.lastResetAt, record.lastResetReason].every((value) => value === null || typeof value === "number" || typeof value === "string")
    ) return null;
    return record as InventoryRecord;
  } catch {
    return null;
  }
}

function decodeHistory(raw: string): HistoryItem | null {
  try {
    const item = JSON.parse(raw) as Partial<HistoryItem>;
    if (
      !Number.isSafeInteger(item.at)
      || !Number.isSafeInteger(item.delta)
      || !Number.isSafeInteger(item.remaining)
      || (item.visitorId !== null && typeof item.visitorId !== "string")
      || (item.event !== "scan" && item.event !== "reset")
    ) return null;
    return item as HistoryItem;
  } catch {
    return null;
  }
}

function statusOf(record: InventoryRecord) {
  if (record.lastResetAt && !record.redeemedAt) return "revoked" as const;
  if (record.expiresAt && record.expiresAt <= Date.now()) return "expired" as const;
  if (record.redeemedAt) return "active" as const;
  return "unredeemed" as const;
}

async function saveInventory(record: InventoryRecord) {
  await writeStore(inventoryKey(record.id), JSON.stringify(record), INVENTORY_TTL_SECONDS);
}

async function hydrate(record: InventoryRecord) {
  const totalCredits = planAccess(record.tier).creditTotal;
  const rawRemaining = await readStore(creditKey(record.tier, record.id));
  const parsedRemaining = rawRemaining === null ? totalCredits : Number(rawRemaining);
  const creditRemaining = Number.isSafeInteger(parsedRemaining)
    ? Math.max(0, Math.min(totalCredits, parsedRemaining))
    : totalCredits;
  const history = (await listStore(historyKey(record.id), 0, 49))
    .map(decodeHistory)
    .filter((item): item is HistoryItem => item !== null);
  return {
    ...record,
    code: codeFor(record.tier, record.id),
    status: statusOf(record),
    creditTotal: totalCredits,
    creditRemaining,
    creditUsed: totalCredits - creditRemaining,
    history,
  };
}

export async function createManagedLicense(tier: ManagedTier) {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const id = randomBytes(6).toString("hex").toUpperCase();
    const record: InventoryRecord = {
      version: 1,
      id,
      tier,
      createdAt: Date.now(),
      redeemedAt: null,
      expiresAt: null,
      visitorId: null,
      firstActiveAt: null,
      lastActiveAt: null,
      lastResetAt: null,
      lastResetReason: null,
    };
    if (await reserveStoreKey(inventoryKey(id), JSON.stringify(record), INVENTORY_TTL_SECONDS)) {
      await pushStore(indexKey(), id);
      await trimStore(indexKey(), 0, MAX_INDEX_ENTRIES - 1);
      return hydrate(record);
    }
  }
  throw new Error("Kode redeem tidak dapat dibuat. Coba lagi.");
}

export async function recordLicenseActivation(
  id: string,
  tier: ManagedTier,
  redeemedAt: number,
  expiresAt: number,
  visitorId: string | null,
) {
  const existing = decodeInventory(await readStore(inventoryKey(id)));
  const record: InventoryRecord = {
    version: 1,
    id,
    tier,
    createdAt: existing?.createdAt || redeemedAt,
    redeemedAt,
    expiresAt,
    visitorId,
    firstActiveAt: existing?.firstActiveAt || redeemedAt,
    lastActiveAt: redeemedAt,
    lastResetAt: existing?.lastResetAt || null,
    lastResetReason: existing?.lastResetReason || null,
  };
  if (!existing) {
    await pushStore(indexKey(), id);
    await trimStore(indexKey(), 0, MAX_INDEX_ENTRIES - 1);
  }
  await saveInventory(record);
}

export async function recordCreditUsage(
  id: string,
  tier: ManagedTier,
  visitorId: string,
  remaining: number,
) {
  const at = Date.now();
  await pushStore(historyKey(id), JSON.stringify({
    at,
    delta: -1,
    remaining,
    visitorId,
    event: "scan",
  } satisfies HistoryItem));
  await trimStore(historyKey(id), 0, MAX_HISTORY_ENTRIES - 1);

  const existing = decodeInventory(await readStore(inventoryKey(id)));
  if (!existing) return;
  await saveInventory({ ...existing, tier, lastActiveAt: at, visitorId });
}

export async function recordLicensePresence(
  id: string,
  tier: ManagedTier,
  visitorId: string,
) {
  const existing = decodeInventory(await readStore(inventoryKey(id)));
  if (!existing) return;
  await saveInventory({ ...existing, tier, visitorId, lastActiveAt: Date.now() });
}

export async function listManagedLicenses() {
  const ids = await listStore(indexKey(), 0, 199);
  const records = await Promise.all(ids.map(async (id) => {
    if (!validId(id)) return null;
    const record = decodeInventory(await readStore(inventoryKey(id)));
    return record ? hydrate(record) : null;
  }));
  return records.filter((record): record is NonNullable<typeof record> => record !== null);
}

export async function getManagedLicense(id: string) {
  if (!validId(id)) return null;
  const record = decodeInventory(await readStore(inventoryKey(id)));
  return record ? hydrate(record) : null;
}

export async function resetManagedLicense(id: string, reason: string) {
  const existing = decodeInventory(await readStore(inventoryKey(id)));
  if (!existing) return null;
  const at = Date.now();
  const creditTotal = planAccess(existing.tier).creditTotal;
  await Promise.all([
    deleteStore(licenseKey(id)),
    deleteStore(creditKey(existing.tier, id)),
    pushStore(historyKey(id), JSON.stringify({
      at,
      delta: 0,
      remaining: creditTotal,
      visitorId: existing.visitorId,
      event: "reset",
      reason,
    } satisfies HistoryItem)),
  ]);
  await trimStore(historyKey(id), 0, MAX_HISTORY_ENTRIES - 1);
  const reset: InventoryRecord = {
    ...existing,
    redeemedAt: null,
    expiresAt: null,
    visitorId: null,
    firstActiveAt: null,
    lastActiveAt: null,
    lastResetAt: at,
    lastResetReason: reason,
  };
  await saveInventory(reset);
  return hydrate(reset);
}

export async function managedLicenseOverview() {
  const licenses = await listManagedLicenses();
  return licenses.reduce((summary, license) => {
    summary.totalCreated += 1;
    summary.totalCreditDistributed += license.creditTotal;
    summary.totalCreditUsed += license.creditUsed;
    summary[license.status] += 1;
    return summary;
  }, {
    totalCreated: 0,
    unredeemed: 0,
    active: 0,
    expired: 0,
    revoked: 0,
    totalCreditDistributed: 0,
    totalCreditUsed: 0,
  });
}
