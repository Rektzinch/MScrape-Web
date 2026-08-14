import { backendFetch, getBackendConfig } from "@/lib/backend";
import { readCreditAccess } from "@/lib/credits";
import { durableStoreConfigured } from "@/lib/durable-store";
import { activationIsConfigured, resolveLicense } from "@/lib/license";
import { planAccess } from "@/lib/plans";
import { readRateAccess } from "@/lib/rate-limit";
import { turnstileConfigured } from "@/lib/turnstile";
import { visitorSession } from "@/lib/visitor-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function GET(request: Request) {
  const config = getBackendConfig();
  if (!durableStoreConfigured()) {
    return Response.json({
      configured: false,
      reachable: false,
      mode: null,
      access: planAccess("free"),
      activationAvailable: false,
      message: "Storage keamanan belum dikonfigurasi.",
    }, { status: 503, headers: noStoreHeaders });
  }

  const visitor = visitorSession(request);
  const responseHeaders = visitor.cookie
    ? { ...noStoreHeaders, "Set-Cookie": visitor.cookie }
    : noStoreHeaders;

  let access;
  try {
    const license = await resolveLicense(request);
    access = await readCreditAccess(
      license,
      visitor.id,
      await readRateAccess(request, license),
    );
  } catch {
    return Response.json({
      configured: false,
      reachable: false,
      mode: null,
      access: planAccess("free"),
      activationAvailable: false,
      message: "Storage keamanan sementara tidak tersedia.",
    }, { status: 503, headers: responseHeaders });
  }
  const activationAvailable = activationIsConfigured();
  const turnstileSiteKey = turnstileConfigured()
    ? process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim() || null
    : null;

  if (!config) {
    return Response.json(
      {
        configured: true,
        reachable: true,
        mode: "google-live",
        access,
        activationAvailable,
        turnstileSiteKey,
      },
      { headers: responseHeaders },
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
      access,
      activationAvailable,
    }, { headers: responseHeaders });
  } catch {
    return Response.json({
      configured: true,
      reachable: false,
      mode: config.mode,
      access,
      activationAvailable,
    }, { headers: responseHeaders });
  }
}
