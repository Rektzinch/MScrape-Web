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
  assert.match(config, /www\.mscrape\.web\.id/);
  assert.match(config, /https:\/\/mscrape\.web\.id\/:path\*/);
  assert.match(scrape, /verifyTurnstile/);
});

test("pencarian kecamatan hanya tersedia untuk Pro dan Max serta diperiksa oleh server", async () => {
  const [plans, scrape] = await Promise.all([
    source("lib/plans.ts"),
    source("app/api/scrape/route.ts"),
  ]);
  assert.match(plans, /free:[\s\S]*allowsSubdistrict: false/);
  assert.match(plans, /pro:[\s\S]*allowsSubdistrict: true/);
  assert.match(plans, /max:[\s\S]*allowsSubdistrict: true/);
  assert.match(scrape, /subdistrict && !license\.access\.allowsSubdistrict/);
  assert.match(scrape, /Pencarian hingga kecamatan memerlukan lisensi Pro atau Max/);
});


test("kredit paket dikurangi atomik satu kali per scan dan masa lisensi mengikuti dua bulan", async () => {
  const [plans, credits, scrape, license] = await Promise.all([
    source("lib/plans.ts"),
    source("lib/credits.ts"),
    source("app/api/scrape/route.ts"),
    source("lib/license.ts"),
  ]);
  assert.match(plans, /creditTotal: 10/);
  assert.match(plans, /creditTotal: 500/);
  assert.match(plans, /creditTotal: 1_500/);
  assert.match(plans, /pro:[\s\S]*cooldownSeconds: 0/);
  assert.match(credits, /evalStore/);
  assert.match(credits, /consumeOneCredit/);
  assert.match(scrape, /consumeCredit\(license, visitor\.id, rate\.access\)/);
  assert.match(license, /LICENSE_TERM_MONTHS = 2/);
});

test("hasil menampilkan ulasan dan Homepage menggantikan Dashboard sebagai tujuan publik", async () => {
  const [scraper, rowRenderer, home, dashboard, menu, styles] = await Promise.all([
    source("lib/google-maps-live.ts"),
    source("app/_components/scan-result-row.ts"),
    source("app/page.tsx"),
    source("app/dashboard/page.tsx"),
    source("app/_components/app-menu.tsx"),
    source("app/workbench.css"),
  ]);
  assert.match(scraper, /reviewCount/);
  assert.match(rowRenderer, /data-label": "Ulasan"/);
  assert.match(rowRenderer, /ulasan Google Maps/);
  assert.match(rowRenderer, /Tidak dikirim sumber/);
  assert.match(styles, /@media \(max-width: 59\.99rem\), \(pointer: coarse\)/);
  assert.match(styles, /Hasil scan: perangkat sentuh selalu memakai kartu satu kolom/);
  assert.match(styles, /Homepage motion: urutan masuk mengikuti ritme membaca/);
  assert.match(styles, /home-visual-drift/);
  assert.match(styles, /\.seo-page--home \.home-fold__visual img/);
  assert.match(styles, /@media \(prefers-reduced-motion: reduce\)/);
  const reducedMotionStyles = styles.slice(styles.indexOf("@media (prefers-reduced-motion: reduce)"));
  assert.match(reducedMotionStyles, /\.seo-page--home \.home-fold__visual img/);
  assert.match(reducedMotionStyles, /\.seo-page--home \.seo-related__card/);
  assert.match(reducedMotionStyles, /animation: none;/);
  assert.match(home, /HomeDashboardContent/);
  assert.match(home, /jumlah ulasan/);
  assert.match(home, /absolute: "MScrape — Google Maps Scraper & Pencari Data Bisnis Indonesia"/);
  assert.match(home, /description:\s*\n\s*"[^"\n]*jumlah ulasan/);
  assert.match(home, /canonical: "\/"/);
  assert.match(home, /openGraph: \{\s*url: "\/"/);
  assert.match(dashboard, /permanentRedirect\("\/"\)/);
  assert.doesNotMatch(menu, /href="\/dashboard"/);
});

test("gateway admin memakai token, audit inventaris, dan pesan aktivasi perangkat yang diwajibkan", async () => {
  const [gateway, ledger, credits, activation] = await Promise.all([
    source("app/api/admin/license/route.ts"),
    source("lib/admin-license-ledger.ts"),
    source("lib/credits.ts"),
    source("app/api/license/activate/route.ts"),
  ]);
  assert.match(gateway, /MSCRAPE_ADMIN_GATEWAY_TOKEN/);
  assert.match(gateway, /timingSafeEqual/);
  assert.match(gateway, /case "create"/);
  assert.match(gateway, /case "reset"/);
  assert.match(ledger, /createManagedLicense/);
  assert.match(ledger, /recordLicensePresence/);
  assert.match(ledger, /recordCreditUsage/);
  assert.match(credits, /recordCreditUsage/);
  assert.match(activation, /Kode ini sudah diaktifkan\. Hubungi admin untuk reset perangkat bila diperlukan\./);
});

test("analytics Homepage mencatat interaksi tanpa IP mentah dan panel admin membaca ringkasan terautentikasi", async () => {
  const [route, ledger, client, home, dashboardContent, styles, adminProduction, adminLocal, adminHome] = await Promise.all([
    source("app/api/analytics/route.ts"),
    source("lib/admin-analytics-ledger.ts"),
    source("app/_components/home-analytics.tsx"),
    source("app/page.tsx"),
    source("app/_components/home-dashboard-content.tsx"),
    source("app/workbench.css"),
    source("../mscrape-redeem-admin/api/trpc/[...path].ts"),
    source("../mscrape-redeem-admin/server/routers.ts"),
    source("../mscrape-redeem-admin/client/src/pages/Home.tsx"),
  ]);
  assert.match(route, /allowedOrigins/);
  assert.match(route, /visitorSession\(request\)/);
  assert.match(route, /x-vercel-ip-city/);
  assert.doesNotMatch(route, /x-forwarded-for|cf-connecting-ip/);
  assert.match(ledger, /dailyCtaKey/);
  assert.match(ledger, /pageViewKey/);
  assert.match(ledger, /firstView/);
  assert.match(ledger, /publicVisitorId/);
  assert.match(ledger, /precise_location/);
  assert.match(client, /event: "page_view"/);
  assert.match(client, /navigator\.geolocation\.getCurrentPosition/);
  assert.match(client, /enableHighAccuracy: true/);
  assert.match(client, /onClick=\{requestLocation\}/);
  assert.match(home, /data-analytics-cta="hero_buka_produksi"/);
  assert.match(home, /href="\/produksi" data-analytics-cta="hero_buka_produksi"/);
  assert.match(dashboardContent, /href=\{plan\.href\}\s+data-analytics-cta=/);
  assert.doesNotMatch(client, /preventDefault/);
  assert.doesNotMatch(home, /home-visual-signal/);
  assert.doesNotMatch(styles, /home-signal-orbit|home-signal-pulse|home-visual-signal/);
  assert.match(styles, /\.app-header::after/);
  assert.match(styles, /background-image:/);
  assert.match(styles, /\.app-menu-trigger:focus-visible/);
  assert.match(adminProduction, /analytics: t\.procedure/);
  assert.match(adminLocal, /analytics: publicProcedure/);
  assert.match(adminHome, /refetchInterval: 10_000/);
  assert.match(adminHome, /analyticsQuery\.refetch\(\)/);
  assert.match(adminHome, /analytics-feed/);
});

test("hasil scan menormalisasi identitas, lokasi, operasional, atribut, dan ekspor detail tanpa memadatkan tabel", async () => {
  const [leads, live, console, exporter, rowRenderer] = await Promise.all([
    source("lib/leads.ts"),
    source("lib/google-maps-live.ts"),
    source("app/_components/scrape-console.tsx"),
    source("lib/lead-export.ts"),
    source("app/_components/scan-result-row.ts"),
  ]);
  assert.match(leads, /primaryCategory|additionalCategories/);
  assert.match(leads, /city: pick|regency: pick|subdistrict: pick/);
  assert.match(leads, /placeId: pick/);
  assert.match(leads, /businessStatus: pick|openStatus: pick|regularHours: pick/);
  assert.match(leads, /sourceAttributes/);
  assert.match(leads, /websiteDomain/);
  assert.match(live, /placeId,/);
  assert.match(live, /domain: websiteDomain\(website\)/);
  assert.match(exporter, /"Place ID"/);
  assert.match(exporter, /"Jam Operasional"/);
  assert.match(exporter, /"Fasilitas\/Atribut"/);
  assert.match(console, /<ScanResultRow key=/);
  assert.match(rowRenderer, /className: "lead-details"/);
});
