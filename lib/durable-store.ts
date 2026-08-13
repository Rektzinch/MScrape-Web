type StoreResponse = {
  result?: unknown;
  error?: string;
};

export class DurableStoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "DurableStoreError";
  }
}

function config() {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim().replace(/\/+$/, "") || "";
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim() || "";
  return { url, token };
}

export function durableStoreConfigured() {
  const { url, token } = config();
  return Boolean(url && token);
}

async function command<T>(...parts: string[]) {
  const { url, token } = config();
  if (!url || !token) {
    throw new DurableStoreError("Storage keamanan belum dikonfigurasi.");
  }

  const response = await fetch(
    `${url}/${parts.map((part) => encodeURIComponent(part)).join("/")}`,
    {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
      signal: AbortSignal.timeout(5_000),
    },
  );

  if (!response.ok) {
    throw new DurableStoreError("Storage keamanan tidak dapat dijangkau.");
  }

  const body = (await response.json()) as StoreResponse;
  if (body.error) {
    throw new DurableStoreError("Storage keamanan menolak operasi.");
  }

  return body.result as T;
}

export async function readStore(key: string) {
  return command<string | null>("GET", key);
}

export async function writeStore(key: string, value: string, ttlSeconds: number) {
  return command<string>("SET", key, value, "EX", String(ttlSeconds));
}

export async function reserveStoreKey(key: string, value: string, ttlSeconds: number) {
  const result = await command<string | null>(
    "SET",
    key,
    value,
    "NX",
    "EX",
    String(ttlSeconds),
  );
  return result === "OK";
}

export async function deleteStore(key: string) {
  return command<number>("DEL", key);
}

export async function storeTtl(key: string) {
  return command<number>("TTL", key);
}
