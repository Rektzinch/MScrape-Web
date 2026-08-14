import {
  backendErrorMessage,
  backendFetch,
  getBackendConfig,
  readBackendJson,
} from "@/lib/backend";
import { DurableStoreError, durableStoreConfigured } from "@/lib/durable-store";
import { searchGoogleMapsLive } from "@/lib/google-maps-live";
import { rememberJobOwner } from "@/lib/job-ownership";
import { resolveLicense } from "@/lib/license";
import { ALL_RESULTS_LIMIT, allowsResultLimit, isResultLimit } from "@/lib/plans";
import { consumeRateLimit, readRateAccess } from "@/lib/rate-limit";
import { turnstileConfigured, verifyTurnstile } from "@/lib/turnstile";
import { visitorSession } from "@/lib/visitor-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

type ScrapeInput = {
  keyword?: unknown;
  city?: unknown;
  subdistrict?: unknown;
  country?: unknown;
  lang?: unknown;
  limit?: unknown;
  email?: unknown;
  turnstileToken?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const config = getBackendConfig();
  if (!durableStoreConfigured()) {
    return Response.json(
      { message: "Kontrol keamanan belum dikonfigurasi oleh admin." },
      { status: 503, headers: noStoreHeaders },
    );
  }

  let license;
  try {
    license = await resolveLicense(request);
  } catch {
    return Response.json(
      { message: "Kontrol keamanan sementara tidak tersedia." },
      { status: 503, headers: noStoreHeaders },
    );
  }
  const visitor = visitorSession(request);

  let body: ScrapeInput;
  try {
    body = (await request.json()) as ScrapeInput;
  } catch {
    return Response.json({ message: "Payload tidak valid." }, { status: 400, headers: noStoreHeaders });
  }

  const keyword = cleanText(body.keyword, 100);
  const city = cleanText(body.city, 100);
  const subdistrict = cleanText(body.subdistrict, 100);
  const country = cleanText(body.country, 100);
  const lang = cleanText(body.lang, 2).toLowerCase() || "en";
  const limit = body.limit === ALL_RESULTS_LIMIT ? ALL_RESULTS_LIMIT : Number(body.limit);
  const email = body.email !== false;

  if (!keyword || !city || !country) {
    return Response.json(
      { message: "Niche, kota, dan negara wajib diisi." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  if (!/^[a-z]{2}$/.test(lang)) {
    return Response.json(
      { message: "Kode bahasa harus terdiri dari dua huruf." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  if (subdistrict && !license.access.allowsSubdistrict) {
    return Response.json(
      {
        message: "Pencarian hingga kecamatan memerlukan lisensi Pro atau Max.",
        requiredTier: "pro",
        access: await readRateAccess(request, license),
      },
      { status: 403, headers: noStoreHeaders },
    );
  }

  if (!isResultLimit(limit)) {
    return Response.json(
      { message: "Batas hasil harus berupa bilangan bulat positif atau Semua hasil." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  if (!allowsResultLimit(license.access, limit)) {
    const requiredTier = limit === ALL_RESULTS_LIMIT || limit > 250 ? "Max" : "Pro";
    const limitLabel = limit === ALL_RESULTS_LIMIT ? "Semua hasil" : String(limit);
    return Response.json(
      {
        message: `Batas ${limitLabel} memerlukan lisensi ${requiredTier}. Masukkan kode aktivasi dari admin.`,
        requiredTier: requiredTier.toLowerCase(),
        access: await readRateAccess(request, license),
      },
      { status: 403, headers: noStoreHeaders },
    );
  }

  if (license.access.tier === "free" && turnstileConfigured()) {
    const verified = await verifyTurnstile(body.turnstileToken, request);
    if (!verified) {
      return Response.json(
        { message: "Verifikasi keamanan diperlukan sebelum scan Free." },
        { status: 403, headers: noStoreHeaders },
      );
    }
  }

  let rate: Awaited<ReturnType<typeof consumeRateLimit>>;
  try {
    rate = await consumeRateLimit(request, license);
  } catch {
    return Response.json(
      { message: "Limiter keamanan sementara tidak tersedia." },
      { status: 503, headers: noStoreHeaders },
    );
  }
  if (!rate.allowed) {
    return Response.json(
      {
        message: `Tier ${rate.access.label} masih dalam cooldown. Coba lagi dalam ${rate.retryAfter} detik.`,
        retryAfter: rate.retryAfter,
        access: rate.access,
      },
      {
        status: 429,
        headers: { ...noStoreHeaders, "Retry-After": String(rate.retryAfter) },
      },
    );
  }

  const backendDepth = limit === ALL_RESULTS_LIMIT
    ? 100
    : Math.min(Math.max(Math.ceil(limit / 10), 1), 100);
  const responseHeaders = visitor.cookie
    ? { ...noStoreHeaders, "Set-Cookie": visitor.cookie }
    : noStoreHeaders;

  const area = [subdistrict, city].filter(Boolean).join(", ");
  const query = `${keyword} in ${area}, ${country}`;

  console.info("[api/scrape] request", {
    provider: config ? `google-maps-${config.mode}` : "google-maps-live",
    keyword,
    city,
    subdistrict: subdistrict || null,
    country,
    limit: limit === ALL_RESULTS_LIMIT ? "all" : limit,
  });

  if (!config) {
    try {
      const search = await searchGoogleMapsLive({
        keyword,
        area,
        country,
        lang,
        limit,
      });
      const { results, completion } = search;
      const fetchedAt = new Date().toISOString();

      console.info("[api/scrape] success", {
        provider: "google-maps-live",
        count: results.length,
        durationMs: Date.now() - startedAt,
      });

      return Response.json(
        {
          jobId: `google-live-${crypto.randomUUID()}`,
          status: "completed",
          mode: "google-live",
          fetchedAt,
          resultCount: results.length,
          results,
          completion,
          downloadReady: false,
          access: rate.access,
        },
        { headers: responseHeaders },
      );
    } catch (error) {
      console.error("[api/scrape] failed", {
        provider: "google-maps-live",
        message: error instanceof Error ? error.message : String(error),
        durationMs: Date.now() - startedAt,
      });

      return Response.json(
        {
          message:
            error instanceof Error
              ? error.message
              : "Google Maps tidak dapat dijangkau.",
          access: rate.access,
        },
        { status: 502, headers: responseHeaders },
      );
    }
  }

  const path = config.mode === "queue" ? "/api/v1/scrape" : "/api/v1/jobs";
  const payload =
    config.mode === "queue"
      ? {
          keyword: query,
          lang,
          max_depth: backendDepth,
          email,
          timeout: 300,
        }
      : {
          name: query,
          keywords: [query],
          lang,
          depth: backendDepth,
          email,
          max_time: 300,
        };

  try {
    const response = await backendFetch(config, path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await readBackendJson(response);

    if (!response.ok) {
      return Response.json(
        {
          message: backendErrorMessage(
            data,
            `Backend menolak permintaan (${response.status}).`,
          ),
          access: rate.access,
        },
        { status: 502, headers: responseHeaders },
      );
    }

    const jobId = data.job_id ?? data.id;
    if (typeof jobId !== "string" || !jobId) {
      return Response.json(
        { message: "Backend tidak mengembalikan ID job." },
        { status: 502, headers: responseHeaders },
      );
    }

    if (!await rememberJobOwner(jobId, visitor.id)) {
      return Response.json(
        { message: "Job tidak dapat diamankan. Coba lagi." },
        { status: 502, headers: responseHeaders },
      );
    }

    return Response.json(
      {
        jobId,
        status: typeof data.status === "string" ? data.status : "pending",
        mode: config.mode,
        access: rate.access,
      },
      { status: 202, headers: responseHeaders },
    );
  } catch (error) {
    const message = error instanceof DurableStoreError
      ? "Kontrol akses job sementara tidak tersedia."
      : "Backend tidak dapat dijangkau.";
    return Response.json(
      { message, access: rate.access },
      { status: error instanceof DurableStoreError ? 503 : 502, headers: responseHeaders },
    );
  }
}
