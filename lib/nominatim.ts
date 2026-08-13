import type { LeadRow } from "@/lib/leads";

type NominatimResult = {
  place_id?: number;
  osm_type?: string;
  osm_id?: number;
  name?: string;
  display_name?: string;
  namedetails?: Record<string, unknown> | null;
  extratags?: Record<string, unknown> | null;
};

type SearchInput = {
  keyword: string;
  city: string;
  country: string;
  lang: string;
  depth: number;
  includeEmail: boolean;
};

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function pick(source: Record<string, unknown> | null | undefined, keys: string[]) {
  if (!source) return "";

  for (const key of keys) {
    const value = text(source[key]);
    if (value) return value;
  }

  return "";
}

function toLead(result: NominatimResult, includeEmail: boolean): LeadRow | null {
  const address = text(result.display_name);
  const business =
    text(result.name) ||
    pick(result.namedetails, ["name", "name:id", "name:en"]) ||
    address.split(",")[0]?.trim() ||
    "";

  if (!business && !address) return null;

  return {
    business,
    address,
    phone: pick(result.extratags, [
      "contact:phone",
      "phone",
      "contact:mobile",
      "mobile",
    ]),
    website: pick(result.extratags, ["contact:website", "website", "url"]),
    email: includeEmail
      ? pick(result.extratags, ["contact:email", "email"])
      : "",
    rating: "",
  };
}

export async function searchNominatim(input: SearchInput) {
  const baseUrl = (
    process.env.NOMINATIM_BASE_URL || "https://nominatim.openstreetmap.org"
  ).replace(/\/+$/, "");
  const params = new URLSearchParams({
    q: `${input.keyword} in ${input.city}, ${input.country}`,
    format: "jsonv2",
    addressdetails: "1",
    extratags: "1",
    namedetails: "1",
    dedupe: "1",
    limit: String(Math.min(Math.max(input.depth, 1) * 10, 30)),
    "accept-language": input.lang,
  });

  const response = await fetch(`${baseUrl}/search?${params}`, {
    headers: {
      Accept: "application/json",
      "User-Agent":
        "MScrape-Web/1.0 (https://github.com/Rektzinch/MScrape-Web)",
    },
    next: { revalidate: 86_400 },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Nominatim merespons dengan status ${response.status}.`);
  }

  const payload = (await response.json()) as unknown;
  if (!Array.isArray(payload)) {
    throw new Error("Format respons Nominatim tidak valid.");
  }

  const seen = new Set<string>();
  const results: LeadRow[] = [];

  for (const item of payload as NominatimResult[]) {
    const key = `${text(item.osm_type)}:${text(item.osm_id) || text(item.place_id)}`;
    if (seen.has(key)) continue;

    const lead = toLead(item, input.includeEmail);
    if (!lead) continue;

    seen.add(key);
    results.push(lead);
  }

  return results;
}
