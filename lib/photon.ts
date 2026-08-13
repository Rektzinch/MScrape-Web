import type { LeadRow } from "@/lib/leads";

type PhotonFeature = {
  geometry?: {
    coordinates?: unknown[];
  };
  properties?: Record<string, unknown>;
};

type PhotonResponse = {
  features?: PhotonFeature[];
};

type SearchInput = {
  keyword: string;
  city: string;
  country: string;
  limit: number;
};

function text(value: unknown) {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}

function formatAddress(properties: Record<string, unknown>) {
  const street = [text(properties.street), text(properties.housenumber)]
    .filter(Boolean)
    .join(" ");

  return [
    street,
    text(properties.district),
    text(properties.city),
    text(properties.state),
    text(properties.postcode),
    text(properties.country),
  ]
    .filter(Boolean)
    .filter((value, index, values) => values.indexOf(value) === index)
    .join(", ");
}

function sourceUrl(properties: Record<string, unknown>) {
  const id = text(properties.osm_id);
  const type = text(properties.osm_type).toUpperCase();
  const path = type === "N" ? "node" : type === "W" ? "way" : "relation";
  return id ? `https://www.openstreetmap.org/${path}/${id}` : "";
}

function toLead(feature: PhotonFeature): LeadRow | null {
  const properties = feature.properties || {};
  const coordinates = feature.geometry?.coordinates || [];
  const longitude = text(coordinates[0]);
  const latitude = text(coordinates[1]);
  const business = text(properties.name);

  if (!business) return null;

  return {
    business,
    address: formatAddress(properties),
    phone: "",
    website: "",
    email: "",
    rating: "",
    category: text(properties.osm_value) || text(properties.osm_key),
    coordinates:
      latitude && longitude ? `${latitude}, ${longitude}` : "",
    source: sourceUrl(properties),
  };
}

export async function searchPhoton(input: SearchInput) {
  const baseUrl = (
    process.env.PHOTON_BASE_URL || "https://photon.komoot.io"
  ).replace(/\/+$/, "");
  const params = new URLSearchParams({
    q: `${input.keyword} ${input.city} ${input.country}`,
    limit: String(Math.min(Math.max(input.limit, 30), 50)),
  });

  const response = await fetch(`${baseUrl}/api/?${params}`, {
    headers: {
      Accept: "application/geo+json, application/json",
      "User-Agent":
        "MScrape-Web/1.1 (https://github.com/Rektzinch/MScrape-Web)",
    },
    next: { revalidate: 3_600 },
    signal: AbortSignal.timeout(20_000),
  });

  if (!response.ok) {
    throw new Error(`Photon merespons dengan status ${response.status}.`);
  }

  const payload = (await response.json()) as PhotonResponse;
  if (!Array.isArray(payload.features)) {
    throw new Error("Format respons Photon tidak valid.");
  }

  const seen = new Set<string>();
  const results: LeadRow[] = [];

  for (const feature of payload.features) {
    const properties = feature.properties || {};
    const key = `${text(properties.osm_type)}:${text(properties.osm_id)}`;
    if (!key || seen.has(key)) continue;

    const lead = toLead(feature);
    if (!lead) continue;

    seen.add(key);
    results.push(lead);
  }

  return results;
}
