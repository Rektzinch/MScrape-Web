import { readStore, reserveStoreKey } from "@/lib/durable-store";

function key(jobId: string) {
  return `mscrape:job-owner:${jobId}`;
}

function ttlSeconds() {
  const configured = Number(process.env.MSCRAPE_JOB_OWNERSHIP_TTL_SECONDS);
  return Number.isSafeInteger(configured) && configured >= 3_600 && configured <= 604_800
    ? configured
    : 86_400;
}

export async function rememberJobOwner(jobId: string, visitorId: string) {
  return reserveStoreKey(key(jobId), visitorId, ttlSeconds());
}

export async function ownsJob(jobId: string, visitorId: string | null) {
  if (!visitorId) return false;
  return (await readStore(key(jobId))) === visitorId;
}
