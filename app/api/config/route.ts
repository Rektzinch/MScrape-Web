import { backendFetch, getBackendConfig } from "@/lib/backend";

export async function GET() {
  const config = getBackendConfig();

  if (!config) {
    return Response.json({
      configured: true,
      reachable: true,
      mode: "photon",
    });
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
