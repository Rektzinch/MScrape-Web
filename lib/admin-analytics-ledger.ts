import { createHash, randomUUID } from "node:crypto";
import { evalStore, listStore, readStore } from "@/lib/durable-store";

const EVENT_TTL_SECONDS = 60 * 60 * 24 * 30;
const COUNTER_TTL_SECONDS = 60 * 60 * 24 * 10;
const RECENT_EVENT_LIMIT = 500;

export type AnalyticsEventName = "page_view" | "cta_click" | "scroll_depth" | "precise_location";

export type PreciseLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number;
};

export type NetworkLocation = {
  country: string | null;
  region: string | null;
  city: string | null;
};

export type AnalyticsEvent = {
  id: string;
  at: number;
  event: AnalyticsEventName;
  visitor: string;
  path: string;
  label: string | null;
  depth: number | null;
  timezone: string | null;
  networkLocation: NetworkLocation;
  preciseLocation: PreciseLocation | null;
};

type EventInput = Omit<AnalyticsEvent, "id" | "at" | "visitor"> & { visitorId: string };

function dayKey(at: number) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jakarta",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(at));
  const part = (type: string) => parts.find((item) => item.type === type)?.value || "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

function jakartaHour(at: number) {
  const value = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Jakarta",
    hour: "2-digit",
    hourCycle: "h23",
  }).format(new Date(at));
  return Number(value);
}

function recentKey() {
  return "mscrape:analytics:recent";
}

function dailyVisitorKey(day: string, visitorId: string) {
  return `mscrape:analytics:visitor:${day}:${visitorId}`;
}

function dailyVisitorsKey(day: string) {
  return `mscrape:analytics:summary:${day}:visitors`;
}

function dailyEventsKey(day: string) {
  return `mscrape:analytics:summary:${day}:events`;
}

function hourlyEventsKey(day: string, hour: number) {
  return `mscrape:analytics:summary:${day}:hour:${hour}`;
}

function dailyCtaKey(day: string) {
  return `mscrape:analytics:summary:${day}:cta`;
}

function pageViewKey(day: string, visitorId: string) {
  return `mscrape:analytics:page-view:${day}:${visitorId}`;
}

function rateKey(visitorId: string, at: number) {
  return `mscrape:analytics:rate:${visitorId}:${Math.floor(at / 60_000)}`;
}

function publicVisitorId(visitorId: string) {
  return createHash("sha256").update(visitorId).digest("hex").slice(0, 10).toUpperCase();
}

function decodeEvent(raw: string): AnalyticsEvent | null {
  try {
    const event = JSON.parse(raw) as Partial<AnalyticsEvent>;
    if (
      typeof event.id !== "string"
      || !Number.isSafeInteger(event.at)
      || (event.event !== "page_view" && event.event !== "cta_click" && event.event !== "scroll_depth" && event.event !== "precise_location")
      || typeof event.visitor !== "string"
      || typeof event.path !== "string"
      || (event.label !== null && typeof event.label !== "string")
      || (event.depth !== null && !Number.isSafeInteger(event.depth))
      || (event.timezone !== null && typeof event.timezone !== "string")
      || !event.networkLocation
      || ![event.networkLocation.country, event.networkLocation.region, event.networkLocation.city].every((value) => value === null || typeof value === "string")
    ) return null;
    return event as AnalyticsEvent;
  } catch {
    return null;
  }
}

export async function recordAnalyticsEvent(input: EventInput) {
  const at = Date.now();
  const day = dayKey(at);
  const hour = jakartaHour(at);
  const event: AnalyticsEvent = {
    id: randomUUID(),
    at,
    event: input.event,
    visitor: publicVisitorId(input.visitorId),
    path: input.path,
    label: input.label,
    depth: input.depth,
    timezone: input.timezone,
    networkLocation: input.networkLocation,
    preciseLocation: input.preciseLocation,
  };
  const allowed = await evalStore<number>(
    "local count = redis.call('INCR', KEYS[1]); if count == 1 then redis.call('EXPIRE', KEYS[1], ARGV[1]) end; if count > tonumber(ARGV[2]) then return 0 end; if ARGV[8] == '1' then local firstView = redis.call('SET', KEYS[8], '1', 'NX', 'EX', ARGV[3]); if not firstView then return 2 end end; local fresh = redis.call('SET', KEYS[2], '1', 'NX', 'EX', ARGV[3]); if fresh then redis.call('INCR', KEYS[3]); redis.call('EXPIRE', KEYS[3], ARGV[3]) end; redis.call('INCR', KEYS[4]); redis.call('EXPIRE', KEYS[4], ARGV[3]); redis.call('INCR', KEYS[5]); redis.call('EXPIRE', KEYS[5], ARGV[3]); if ARGV[7] == 'cta_click' then redis.call('INCR', KEYS[7]); redis.call('EXPIRE', KEYS[7], ARGV[3]) end; redis.call('LPUSH', KEYS[6], ARGV[4]); redis.call('LTRIM', KEYS[6], 0, tonumber(ARGV[5]) - 1); redis.call('EXPIRE', KEYS[6], ARGV[6]); return 1",
    [
      rateKey(input.visitorId, at),
      dailyVisitorKey(day, input.visitorId),
      dailyVisitorsKey(day),
      dailyEventsKey(day),
      hourlyEventsKey(day, hour),
      recentKey(),
      dailyCtaKey(day),
      pageViewKey(day, input.visitorId),
    ],
    ["60", "30", String(COUNTER_TTL_SECONDS), JSON.stringify(event), String(RECENT_EVENT_LIMIT), String(EVENT_TTL_SECONDS), input.event, input.event === "page_view" ? "1" : "0"],
  );
  return { accepted: allowed > 0, recorded: allowed === 1, event };
}

async function countFor(key: string) {
  const value = Number(await readStore(key));
  return Number.isSafeInteger(value) && value >= 0 ? value : 0;
}

function lastDays(at: number, total: number) {
  return Array.from({ length: total }, (_, index) => dayKey(at - index * 86_400_000));
}

export async function analyticsOverview() {
  const now = Date.now();
  const [today] = lastDays(now, 1);
  const week = lastDays(now, 7);
  const [visitorsToday, eventsToday, ctaClicksToday, visitorWeek, eventWeek, hourly, recent] = await Promise.all([
    countFor(dailyVisitorsKey(today)),
    countFor(dailyEventsKey(today)),
    countFor(dailyCtaKey(today)),
    Promise.all(week.map((day) => countFor(dailyVisitorsKey(day)))),
    Promise.all(week.map((day) => countFor(dailyEventsKey(day)))),
    Promise.all(Array.from({ length: 24 }, (_, hour) => countFor(hourlyEventsKey(today, hour)))),
    listStore(recentKey(), 0, 39),
  ]);
  const hourlyActivity = hourly.map((count, hour) => ({ hour, count }));
  const peak = hourlyActivity.reduce((best, item) => item.count > best.count ? item : best, { hour: 0, count: 0 });
  return {
    visitorsToday,
    visitors7d: visitorWeek.reduce((sum, value) => sum + value, 0),
    eventsToday,
    ctaClicksToday,
    events7d: eventWeek.reduce((sum, value) => sum + value, 0),
    peakHourJakarta: peak.count ? peak.hour : null,
    hourlyActivity,
    recent: recent.map(decodeEvent).filter((event): event is AnalyticsEvent => event !== null),
  };
}
