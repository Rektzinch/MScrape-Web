import { backendFetch, getBackendConfig } from "@/lib/backend";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function GET() {
  const config = getBackendConfig();

  if (!config) {
    return Response.json(
      {
        configured: true,
        reachable: true,
        mode: "google-live",
      },
      { headers: noStoreHeaders },
    );
  }

  const healthPath =
    config.mode === "queue" ? "/api/v1/health" : "/api/v1/jobs";

  try {
    const response = await backendFetch(config, healthPath, undefined, 8_000);
    return Response.json({
      configured: true,
      reachable: response.ok,
      mode: config.mode,
    });
  } catch {
    return Response.json({
      configured: true,
      reachable: false,
      mode: config.mode,
    });
  }
}
