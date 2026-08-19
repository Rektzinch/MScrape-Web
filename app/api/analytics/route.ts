import { analyticsOverview, recordAnalyticsEvent, type AnalyticsEventName, type NetworkLocation, type PreciseLocation } from "@/lib/admin-analytics-ledger";
import { DurableStoreError, durableStoreConfigured } from "@/lib/durable-store";
import { siteUrl } from "@/lib/site-url";
import { visitorSession } from "@/lib/visitor-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = { "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0" };
const allowedOrigins = new Set([siteUrl.origin, "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3001"]);

type AnalyticsPayload = {
  event?: unknown;
  path?: unknown;
  label?: unknown;
  depth?: unknown;
  timezone?: unknown;
  location?: unknown;
};

function allowedOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return Boolean(origin && allowedOrigins.has(origin));
}

function eventName(value: unknown): AnalyticsEventName | null {
  return value === "page_view" || value === "cta_click" || value === "scroll_depth" || value === "precise_location" ? value : null;
}

function pagePath(value: unknown) {
  return typeof value === "string" && value === "/" ? value : null;
}

function eventLabel(value: unknown) {
  const label = typeof value === "string" ? value.trim() : "";
  return label && label.length <= 80 ? label : null;
}

function scrollDepth(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && [25, 50, 75, 100].includes(value) ? value : null;
}

function browserTimezone(value: unknown) {
  return typeof value === "string" && /^[A-Za-z_]+\/[A-Za-z_]+(?:\/[A-Za-z_]+)?$/.test(value) && value.length <= 64 ? value : null;
}

function preciseLocation(value: unknown): PreciseLocation | null {
  if (!value || typeof value !== "object") return null;
  const location = value as Record<string, unknown>;
  const latitude = location.latitude;
  const longitude = location.longitude;
  const accuracyMeters = location.accuracyMeters;
  if (
    typeof latitude !== "number" || !Number.isFinite(latitude) || latitude < -90 || latitude > 90
    || typeof longitude !== "number" || !Number.isFinite(longitude) || longitude < -180 || longitude > 180
    || typeof accuracyMeters !== "number" || !Number.isFinite(accuracyMeters) || accuracyMeters < 0 || accuracyMeters > 100_000
  ) return null;
  return { latitude, longitude, accuracyMeters };
}

function networkLocation(request: Request): NetworkLocation {
  const header = (name: string) => request.headers.get(name)?.trim() || null;
  return {
    country: header("x-vercel-ip-country"),
    region: header("x-vercel-ip-country-region"),
    city: header("x-vercel-ip-city"),
  };
}

export async function POST(request: Request) {
  if (!allowedOrigin(request)) return Response.json({ message: "Asal analytics tidak diizinkan." }, { status: 403, headers: noStoreHeaders });
  if (!durableStoreConfigured()) return Response.json({ message: "Analytics sementara tidak tersedia." }, { status: 503, headers: noStoreHeaders });

  let payload: AnalyticsPayload;
  try {
    payload = await request.json() as AnalyticsPayload;
  } catch {
    return Response.json({ message: "Event analytics tidak dapat dibaca." }, { status: 400, headers: noStoreHeaders });
  }

  const event = eventName(payload.event);
  const path = pagePath(payload.path);
  const label = eventLabel(payload.label);
  const depth = scrollDepth(payload.depth);
  const location = preciseLocation(payload.location);
  if (!event || !path || (event === "cta_click" && !label) || (event === "scroll_depth" && depth === null) || (event === "precise_location" && !location)) {
    return Response.json({ message: "Format event analytics tidak valid." }, { status: 400, headers: noStoreHeaders });
  }

  try {
    const visitor = visitorSession(request);
    const result = await recordAnalyticsEvent({
      visitorId: visitor.id,
      event,
      path,
      label,
      depth,
      timezone: browserTimezone(payload.timezone),
      networkLocation: networkLocation(request),
      preciseLocation: location,
    });
    const headers = visitor.cookie ? { ...noStoreHeaders, "Set-Cookie": visitor.cookie } : noStoreHeaders;
    return Response.json({ accepted: result.accepted, recorded: result.recorded }, { status: result.accepted ? 202 : 429, headers });
  } catch (error) {
    const message = error instanceof DurableStoreError ? "Analytics sementara tidak tersedia." : "Event analytics tidak dapat direkam.";
    return Response.json({ message }, { status: 503, headers: noStoreHeaders });
  }
}

// Hanya gateway admin yang memakai ringkasan dari ledger; route publik tidak mengekspos data analytics.
export { analyticsOverview };
