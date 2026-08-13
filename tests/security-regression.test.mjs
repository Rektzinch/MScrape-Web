import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

async function source(path) {
  return readFile(new URL(path, root), "utf8");
}

test("limiter memakai reservation durable dan tidak menyimpan Map atau cookie cooldown", async () => {
  const code = await source("lib/rate-limit.ts");
  assert.match(code, /reserveStoreKey/);
  assert.doesNotMatch(code, /globalThis\.__mscrapeRateLimits/);
  assert.doesNotMatch(code, /mscrape_cooldown/);
});

test("ledger lisensi mendukung reservasi sekali pakai dan revokasi", async () => {
  const code = await source("lib/license.ts");
  assert.match(code, /reserveStoreKey\(/);
  assert.match(code, /export async function revokeLicense/);
  assert.match(code, /revokedAt/);
});

test("route job dan download memverifikasi ownership sesi", async () => {
  const [jobRoute, downloadRoute] = await Promise.all([
    source("app/api/jobs/[id]/route.ts"),
    source("app/api/jobs/[id]/download/route.ts"),
  ]);
  assert.match(jobRoute, /ownsJob\(/);
  assert.match(downloadRoute, /ownsJob\(/);
});

test("paket Max memiliki batas deterministik dan hasil live membawa metadata kelengkapan", async () => {
  const [plans, scraper] = await Promise.all([
    source("lib/plans.ts"),
    source("lib/google-maps-live.ts"),
  ]);
  assert.match(plans, /maxLimit: 500/);
  assert.match(scraper, /stoppedReason/);
  assert.match(scraper, /isComplete/);
});

test("header dan challenge browser diproteksi dari konfigurasi Next dan API", async () => {
  const [config, scrape] = await Promise.all([
    source("next.config.ts"),
    source("app/api/scrape/route.ts"),
  ]);
  assert.match(config, /Content-Security-Policy/);
  assert.match(config, /X-Content-Type-Options/);
  assert.match(scrape, /verifyTurnstile/);
});
