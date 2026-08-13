export type BackendMode = "web" | "queue";

export type BackendConfig = {
  baseUrl: string;
  mode: BackendMode;
  apiKey?: string;
};

export function getBackendConfig(): BackendConfig | null {
  const baseUrl = process.env.MAPS_API_BASE_URL?.trim().replace(/\/+$/, "");

  if (!baseUrl) {
    return null;
  }

  const requestedMode = process.env.MAPS_API_MODE?.trim().toLowerCase();
  const mode: BackendMode =
    requestedMode === "queue" || (!requestedMode && process.env.MAPS_API_KEY)
      ? "queue"
      : "web";

  return {
    baseUrl,
    mode,
    apiKey: process.env.MAPS_API_KEY?.trim() || undefined,
  };
}

export async function backendFetch(
  config: BackendConfig,
  path: string,
  init?: RequestInit,
  timeoutMs = 20_000,
) {
  const headers = new Headers(init?.headers);
  headers.set("Accept", "application/json");

  if (init?.body) {
    headers.set("Content-Type", "application/json");
  }

  if (config.apiKey) {
    headers.set("X-API-Key", config.apiKey);
  }

  return fetch(`${config.baseUrl}${path}`, {
    ...init,
    headers,
    cache: "no-store",
    signal: AbortSignal.timeout(timeoutMs),
  });
}

export async function readBackendJson(response: Response) {
  const text = await response.text();

  if (!text) {
    return {} as Record<string, unknown>;
  }

  try {
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return { message: text } as Record<string, unknown>;
  }
}

export function backendErrorMessage(
  data: Record<string, unknown>,
  fallback: string,
) {
  const message = data.message ?? data.error;
  return typeof message === "string" && message.trim() ? message : fallback;
}
