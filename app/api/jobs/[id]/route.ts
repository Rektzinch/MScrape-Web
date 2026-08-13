import {
  backendErrorMessage,
  backendFetch,
  getBackendConfig,
  readBackendJson,
} from "@/lib/backend";
import { normalizeLead } from "@/lib/leads";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeStatus(value: unknown) {
  const status = typeof value === "string" ? value.toLowerCase() : "pending";
  if (status === "ok" || status === "completed") return "completed";
  if (status === "working" || status === "running") return "running";
  if (status === "failed" || status === "cancelled") return "failed";
  return "pending";
}

export async function GET(_request: Request, context: RouteContext) {
  const config = getBackendConfig();
  if (!config) {
    return Response.json(
      { message: "Backend API belum dikonfigurasi." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  if (!/^[a-zA-Z0-9_-]{6,128}$/.test(id)) {
    return Response.json({ message: "ID job tidak valid." }, { status: 400 });
  }

  try {
    const response = await backendFetch(
      config,
      `/api/v1/jobs/${encodeURIComponent(id)}`,
      undefined,
      12_000,
    );
    const data = await readBackendJson(response);

    if (!response.ok) {
      return Response.json(
        {
          message: backendErrorMessage(
            data,
            `Status job tidak tersedia (${response.status}).`,
          ),
        },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const rawStatus = data.status ?? data.Status;
    const status = normalizeStatus(rawStatus);
    const rawResults = data.results;
    const results = Array.isArray(rawResults)
      ? rawResults.map(normalizeLead).filter((row) => row !== null)
      : [];
    const rawCount = data.result_count;
    const resultCount =
      typeof rawCount === "number" ? rawCount : results.length || null;

    return Response.json({
      jobId: id,
      status,
      resultCount,
      results,
      error:
        typeof data.error === "string" && data.error ? data.error : null,
      downloadReady: config.mode === "web" && status === "completed",
      mode: config.mode,
    });
  } catch {
    return Response.json(
      { message: "Backend tidak dapat dijangkau." },
      { status: 502 },
    );
  }
}
