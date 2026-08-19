"use client";

import { useEffect, useState } from "react";

type AnalyticsPayload = {
  event: "page_view" | "cta_click" | "scroll_depth" | "precise_location";
  path: "/";
  label?: string;
  depth?: number;
  timezone: string | null;
  location?: { latitude: number; longitude: number; accuracyMeters: number };
};

function timezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone || null;
}

function emit(payload: AnalyticsPayload) {
  const body = JSON.stringify(payload);
  if (typeof navigator !== "undefined" && "sendBeacon" in navigator) {
    navigator.sendBeacon("/api/analytics", new Blob([body], { type: "application/json" }));
    return;
  }
  void fetch("/api/analytics", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    keepalive: true,
  });
}

export function HomeAnalytics() {
  const [locationState, setLocationState] = useState<"idle" | "requesting" | "shared" | "unavailable">("idle");

  useEffect(() => {
    const seenDepths = new Set<number>();
    emit({ event: "page_view", path: "/", timezone: timezone() });
    let pending = false;
    const trackScroll = () => {
      pending = false;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      if (maxScroll <= 0) return;
      const progress = Math.min(100, Math.round((window.scrollY / maxScroll) * 100));
      for (const depth of [25, 50, 75, 100]) {
        if (progress >= depth && !seenDepths.has(depth)) {
          seenDepths.add(depth);
          emit({ event: "scroll_depth", path: "/", depth, timezone: timezone() });
        }
      }
    };
    const requestFrame = () => {
      if (!pending) {
        pending = true;
        window.requestAnimationFrame(trackScroll);
      }
    };
    const trackClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>("[data-analytics-cta]") : null;
      const label = target?.dataset.analyticsCta?.trim();
      if (label) emit({ event: "cta_click", path: "/", label, timezone: timezone() });
    };
    window.addEventListener("scroll", requestFrame, { passive: true });
    document.addEventListener("click", trackClick, { capture: true });
    requestFrame();
    return () => {
      window.removeEventListener("scroll", requestFrame);
      document.removeEventListener("click", trackClick, { capture: true });
    };
  }, []);

  const requestLocation = () => {
    if (!("geolocation" in navigator)) {
      setLocationState("unavailable");
      return;
    }
    setLocationState("requesting");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        emit({
          event: "precise_location",
          path: "/",
          timezone: timezone(),
          location: {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracyMeters: position.coords.accuracy,
          },
        });
        setLocationState("shared");
      },
      () => setLocationState("unavailable"),
      { enableHighAccuracy: true, maximumAge: 0, timeout: 10_000 },
    );
  };

  const label = locationState === "requesting"
    ? "Meminta izin lokasi…"
    : locationState === "shared"
      ? "Lokasi presisi dibagikan"
      : locationState === "unavailable"
        ? "Lokasi tidak tersedia"
        : "Bagikan lokasi presisi (opsional)";

  return (
    <button
      type="button"
      className="analytics-location-consent"
      onClick={requestLocation}
      disabled={locationState === "requesting" || locationState === "shared"}
    >
      {label}
    </button>
  );
}
