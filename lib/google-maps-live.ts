import type { LeadRow } from "@/lib/leads";
import { ALL_RESULTS_LIMIT, type ResultLimit } from "@/lib/plans";

type SearchInput = {
  keyword: string;
  city: string;
  country: string;
  lang: string;
  limit: ResultLimit;
};

const PAGE_SIZE = 500;
const SEARCH_BUDGET_MS = 48_000;

function at(value: unknown, ...indexes: number[]): unknown {
  return indexes.reduce<unknown>(
    (current, index) => (Array.isArray(current) ? current[index] : undefined),
    value,
  );
}

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function stringList(value: unknown) {
  return Array.isArray(value) ? value.map(text).filter(Boolean) : [];
}

const emailPattern = /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i;

function findEmail(value: unknown, depth = 0): string {
  if (depth > 8) return "";

  if (typeof value === "string") {
    return value.match(emailPattern)?.[0] || "";
  }

  if (!Array.isArray(value)) return "";

  for (const item of value) {
    const email = findEmail(item, depth + 1);
    if (email) return email;
  }

  return "";
}

function mapsUrl(
  business: string,
  address: string,
  latitude: string,
  longitude: string,
  placeId: string,
) {
  const params = new URLSearchParams({
    api: "1",
    query:
      latitude && longitude
        ? `${latitude},${longitude}`
        : [business, address].filter(Boolean).join(", "),
  });

  if (placeId) params.set("query_place_id", placeId);
  return `https://www.google.com/maps/search/?${params}`;
}

function toLead(value: unknown): { key: string; row: LeadRow } | null {
  const business = text(at(value, 11));
  if (!business) return null;

  const address = stringList(at(value, 2)).join(", ");
  const latitude = text(at(value, 9, 2));
  const longitude = text(at(value, 9, 3));
  const placeId = text(at(value, 78));
  const dataId = text(at(value, 10));
  const rating = text(at(value, 4, 7));
  const reviewCount = text(at(value, 4, 8));

  return {
    key: placeId || dataId || `${business}|${address}`,
    row: {
      business,
      address,
      phone: text(at(value, 178, 0, 0)),
      website: text(at(value, 7, 0)),
      email: findEmail(value),
      rating,
      reviewCount,
      category: stringList(at(value, 13)).join(", "),
      coordinates:
        latitude && longitude ? `${latitude}, ${longitude}` : "",
      latitude,
      longitude,
      source: mapsUrl(business, address, latitude, longitude, placeId),
    },
  };
}

function buildParams(input: SearchInput, limit: number, offset: number) {
  const params = new URLSearchParams({
    tbm: "map",
    authuser: "0",
    hl: input.lang,
    q: `${input.keyword} in ${input.city}, ${input.country}`,
  });

  // Request format used by gosom/google-maps-scraper fast mode. The center is
  // intentionally neutral: the explicit city/country query determines the area.
  params.set(
    "pb",
    `!4m12!1m3!1d3826.902183192154!2d0.0000!3d0.0000` +
      `!2m3!1f0!2f0!3f0!3m2!1i600!2i800!4f13.0!7i${limit}!8i${offset}` +
      "!10b1!12m22!1m3!18b1!30b1!34e1!2m3!5m1!6e2!20e3!4b0" +
      "!10b1!12b1!13b1!16b1!17m1!3e1!20m3!5e2!6b1!14b1!46m1!1b0" +
      "!96b1!19m4!2m3!1i360!2i120!4i8",
  );

  return params;
}

function parseGoogleResponse(raw: string) {
  const firstNewline = raw.indexOf("\n");
  const json = raw.startsWith(")]}'")
    ? raw.slice(firstNewline >= 0 ? firstNewline + 1 : 4)
    : raw;

  const payload = JSON.parse(json) as unknown;
  const items = at(payload, 0, 1);
  if (!Array.isArray(items)) {
    throw new Error("Format respons Google Maps tidak dikenali.");
  }

  const seen = new Set<string>();
  const results: Array<{ key: string; row: LeadRow }> = [];

  for (const item of items.slice(1)) {
    const parsed = toLead(at(item, 14));
    if (!parsed || seen.has(parsed.key)) continue;

    seen.add(parsed.key);
    results.push(parsed);
  }

  return { results, candidateCount: Math.max(0, items.length - 1) };
}

export async function searchGoogleMapsLive(input: SearchInput) {
  const configuredUrl = process.env.GOOGLE_MAPS_SEARCH_URL?.replace(/\/+$/, "");
  const baseUrls = configuredUrl
    ? [configuredUrl]
    : ["https://maps.google.com/search", "https://www.google.com/search"];
  const requestedLimit = input.limit === ALL_RESULTS_LIMIT
    ? ALL_RESULTS_LIMIT
    : Math.max(input.limit, 1);
  const searchStartedAt = Date.now();
  let lastError: unknown;

  for (const [index, baseUrl] of baseUrls.entries()) {
    try {
      const collected = new Map<string, LeadRow>();
      let offset = 0;

      while (Date.now() - searchStartedAt < SEARCH_BUDGET_MS) {
        const batchSize = requestedLimit === ALL_RESULTS_LIMIT
          ? PAGE_SIZE
          : Math.min(PAGE_SIZE, requestedLimit - collected.size);
        if (batchSize <= 0) break;
        const remainingBudget = SEARCH_BUDGET_MS - (Date.now() - searchStartedAt);
        const response = await fetch(`${baseUrl}?${buildParams(input, batchSize, offset)}`, {
          cache: "no-store",
          headers: {
            Accept: "application/json, text/plain, */*",
            "Accept-Language": `${input.lang},en;q=0.8`,
            Referer: "https://www.google.com/maps/",
            "User-Agent":
              "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 " +
              "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
          },
          signal: AbortSignal.timeout(Math.max(1_000, Math.min(20_000, remainingBudget))),
        });

        if (!response.ok) {
          throw new Error(`Google Maps merespons dengan status ${response.status}.`);
        }

        const page = parseGoogleResponse(await response.text());
        const previousSize = collected.size;
        for (const result of page.results) collected.set(result.key, result.row);

        if (requestedLimit !== ALL_RESULTS_LIMIT && collected.size >= requestedLimit) break;
        if (page.candidateCount === 0 || collected.size === previousSize) break;
        offset += page.candidateCount;
      }

      const results = [...collected.values()];
      if (results.length === 0) {
        throw new Error(
          "Google Maps tidak mengembalikan tempat untuk pencarian ini.",
        );
      }

      return requestedLimit === ALL_RESULTS_LIMIT
        ? results
        : results.slice(0, requestedLimit);
    } catch (error) {
      lastError = error;
      if (index < baseUrls.length - 1) {
        console.warn("[google-maps-live] retrying fallback host", {
          message: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Google Maps tidak dapat dijangkau.");
}
