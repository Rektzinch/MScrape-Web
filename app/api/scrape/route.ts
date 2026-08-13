import {
  backendErrorMessage,
  backendFetch,
  getBackendConfig,
  readBackendJson,
} from "@/lib/backend";
import { searchGoogleMapsLive } from "@/lib/google-maps-live";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const maxDuration = 60;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

type ScrapeInput = {
  keyword?: unknown;
  city?: unknown;
  country?: unknown;
  lang?: unknown;
  limit?: unknown;
  email?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  const config = getBackendConfig();

  let body: ScrapeInput;
  try {
    body = (await request.json()) as ScrapeInput;
  } catch {
    return Response.json({ message: "Payload tidak valid." }, { status: 400 });
  }

  const keyword = cleanText(body.keyword, 100);
  const city = cleanText(body.city, 100);
  const country = cleanText(body.country, 100);
  const lang = cleanText(body.lang, 2).toLowerCase() || "en";
  const limit = Math.min(Math.max(Number(body.limit) || 50, 30), 50);
  const backendDepth = Math.min(Math.max(Math.ceil(limit / 10), 1), 10);
  const email = body.email === true;

  if (!keyword || !city || !country) {
    return Response.json(
      { message: "Niche, kota, dan negara wajib diisi." },
      { status: 400 },
    );
  }

  if (!/^[a-z]{2}$/.test(lang)) {
    return Response.json(
      { message: "Kode bahasa harus terdiri dari dua huruf." },
      { status: 400 },
    );
  }

  const query = `${keyword} in ${city}, ${country}`;

  console.info("[api/scrape] request", {
    provider: config ? `google-maps-${config.mode}` : "google-maps-live",
    keyword,
    city,
    country,
    limit,
  });

  if (!config) {
    try {
      const results = await searchGoogleMapsLive({
        keyword,
        city,
        country,
        lang,
        limit,
      });
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
          downloadReady: false,
        },
        { headers: noStoreHeaders },
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
        },
        { status: 502, headers: noStoreHeaders },
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
        },
        { status: 502 },
      );
    }

    const jobId = data.job_id ?? data.id;
    if (typeof jobId !== "string" || !jobId) {
      return Response.json(
        { message: "Backend tidak mengembalikan ID job." },
        { status: 502 },
      );
    }

    return Response.json(
      {
        jobId,
        status: typeof data.status === "string" ? data.status : "pending",
        mode: config.mode,
      },
      { status: 202 },
    );
  } catch {
    return Response.json(
      { message: "Backend tidak dapat dijangkau." },
      { status: 502 },
    );
  }
}
