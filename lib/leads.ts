export type LeadRow = {
  business: string;
  address: string;
  city: string;
  regency: string;
  subdistrict: string;
  phone: string;
  website: string;
  domain: string;
  email: string;
  rating: string;
  reviewCount: string;
  category: string;
  primaryCategory: string;
  additionalCategories: string;
  coordinates: string;
  latitude: string;
  longitude: string;
  placeId: string;
  businessStatus: string;
  openStatus: string;
  regularHours: string;
  priceRange: string;
  attributes: string;
  photoUrl: string;
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

function websiteDomain(value: string) {
  if (!value) return "";

  try {
    return new URL(value).hostname.replace(/^www\./i, "");
  } catch {
    return value.replace(/^https?:\/\//i, "").split("/")[0] || "";
  }
}

function explicitFlag(value: unknown) {
  return value === true || value === 1 || value === "1" || value === "true" || value === "yes";
}

function sourceAttributes(source: Record<string, unknown>) {
  const direct = pick(source, ["attributes", "amenities", "features", "Fasilitas"]);
  const flags = [
    ["delivery", "Delivery"],
    ["dineIn", "Dine-in"],
    ["takeout", "Takeout"],
    ["curbsidePickup", "Curbside pickup"],
    ["reservable", "Reservasi"],
    ["outdoorSeating", "Area luar"],
    ["wheelchairAccessibleEntrance", "Akses kursi roda"],
  ] as const;
  const inferred = flags.filter(([key]) => explicitFlag(source[key])).map(([, label]) => label);

  return [direct, ...inferred].filter(Boolean).join(", ");
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
  const website = pick(source, ["website", "website_uri", "Website"]);
  const primaryCategory = pick(source, ["primary_category", "primary_type_display_name", "primary_type", "Primary Category"]);
  const additionalCategories = pick(source, ["additional_categories", "types", "categories", "Additional Categories"]);
  const category = pick(source, ["category", "Category", "type"]) || [primaryCategory, additionalCategories].filter(Boolean).join(", ");

  const row: LeadRow = {
    business: pick(source, ["title", "name", "Business Name", "business_name"]),
    address: pick(source, ["address", "complete_address", "Full Address"]),
    city: pick(source, ["city", "locality", "kota", "City"]),
    regency: pick(source, ["regency", "kabupaten", "administrative_area_level_2", "Regency"]),
    subdistrict: pick(source, ["subdistrict", "district", "kecamatan", "sublocality", "Subdistrict"]),
    phone: pick(source, ["phone", "phone_number", "Phone"]),
    website,
    domain: pick(source, ["domain", "website_domain", "Domain"]) || websiteDomain(website),
    email: pick(source, ["email", "emails", "Emails"]),
    rating: pick(source, ["review_rating", "rating", "Rating"]),
    reviewCount: pick(source, ["review_count", "reviews", "Reviews"]),
    category,
    primaryCategory,
    additionalCategories,
    coordinates: coordinates || (latitude && longitude ? `${latitude}, ${longitude}` : ""),
    latitude,
    longitude,
    placeId: pick(source, ["place_id", "placeId", "google_place_id", "Place ID"]),
    businessStatus: pick(source, ["business_status", "businessStatus", "status", "Business Status"]),
    openStatus: pick(source, ["open_status", "open_now", "openNow", "Open Status"]),
    regularHours: pick(source, ["opening_hours", "regular_opening_hours", "hours", "Opening Hours"]),
    priceRange: pick(source, ["price_range", "price_level", "priceRange", "Price Range"]),
    attributes: sourceAttributes(source),
    photoUrl: pick(source, ["photo_url", "photo", "image_url", "image", "Photo URL"]),
    source: pick(source, ["google_maps_url", "link", "url", "Source"]),
  };

  return Object.values(row).some(Boolean) ? row : null;
}
