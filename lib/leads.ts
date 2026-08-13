export type LeadRow = {
  business: string;
  address: string;
  phone: string;
  website: string;
  email: string;
  rating: string;
  reviewCount: string;
  category: string;
  coordinates: string;
  latitude: string;
  longitude: string;
  source: string;
};

function asText(value: unknown): string {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean).join(", ");
  }

  if (typeof value === "string" || typeof value === "number") {
    return String(value);
  }

  return "";
}

function pick(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = asText(source[key]);
    if (value) return value;
  }
  return "";
}

export function normalizeLead(value: unknown): LeadRow | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const source = value as Record<string, unknown>;
  const coordinates = pick(source, ["coordinates", "Coordinates"]);
  const [derivedLatitude = "", derivedLongitude = ""] = coordinates
    .split(",")
    .map((part) => part.trim());
  const latitude = pick(source, ["latitude", "lat", "Latitude"]) || derivedLatitude;
  const longitude = pick(source, ["longitude", "lng", "lon", "Longitude"]) || derivedLongitude;

  const row: LeadRow = {
    business: pick(source, ["title", "name", "Business Name", "business_name"]),
    address: pick(source, ["address", "complete_address", "Full Address"]),
    phone: pick(source, ["phone", "phone_number", "Phone"]),
    website: pick(source, ["website", "Website"]),
    email: pick(source, ["email", "emails", "Emails"]),
    rating: pick(source, ["review_rating", "rating", "Rating"]),
    reviewCount: pick(source, ["review_count", "reviews", "Reviews"]),
    category: pick(source, ["category", "categories", "type", "Category"]),
    coordinates: coordinates || (latitude && longitude ? `${latitude}, ${longitude}` : ""),
    latitude,
    longitude,
    source: pick(source, ["google_maps_url", "link", "url", "Source"]),
  };

  return Object.values(row).some(Boolean) ? row : null;
}
