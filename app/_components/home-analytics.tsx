"use client";

import { useEffect } from "react";

type AnalyticsPayload = {
  event: "page_view" | "cta_click" | "scroll_depth";
  path: "/";
  label?: string;
  depth?: number;
  timezone: string | null;
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

  return null;
}
