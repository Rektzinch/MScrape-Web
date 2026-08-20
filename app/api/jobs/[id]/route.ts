import {
  backendErrorMessage,
  backendFetch,
  getBackendConfig,
  readBackendJson,
  type BackendConfig,
} from "@/lib/backend";
import { parseBackendCsv } from "@/lib/backend-results";
import { DurableStoreError } from "@/lib/durable-store";
import { ownsJob } from "@/lib/job-ownership";
import { normalizeLead } from "@/lib/leads";
import { existingVisitorSession } from "@/lib/visitor-session";

type RouteContext = { params: Promise<{ id: string }> };

function normalizeStatus(value: unknown) {
  const status = typeof value === "string" ? value.toLowerCase() : "pending";
  if (status === "ok" || status === "completed") return "completed";
  if (status === "working" || status === "running") return "running";
  if (status === "failed" || status === "cancelled") return "failed";
  return "pending";
}

async function completedCsvResults(config: BackendConfig, id: string) {
  const response = await backendFetch(
    config,
    `/api/v1/jobs/${encodeURIComponent(id)}/download`,
    { headers: { Accept: "text/csv" } },
    8_000,
  );
  if (!response.ok) return [];

  return parseBackendCsv(await response.text())
    .map(normalizeLead)
    .filter((row) => row !== null);
}

export async function GET(request: Request, context: RouteContext) {
  const config = getBackendConfig();
  if (!config) {
    return Response.json(
      { message: "Layanan hasil belum tersedia." },
      { status: 503 },
    );
  }

  const { id } = await context.params;
  if (!/^[a-zA-Z0-9_-]{6,128}$/.test(id)) {
    return Response.json({ message: "ID hasil tidak valid." }, { status: 400 });
  }

  try {
    if (!await ownsJob(id, existingVisitorSession(request))) {
      return Response.json({ message: "Hasil scan tidak tersedia." }, { status: 404 });
    }

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
            `Status hasil tidak tersedia (${response.status}).`,
          ),
        },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    const rawStatus = data.status ?? data.Status;
    const status = normalizeStatus(rawStatus);
    const rawResults = data.results;
    let results = Array.isArray(rawResults)
      ? rawResults.map(normalizeLead).filter((row) => row !== null)
      : [];
    if (
      config.mode === "web"
      && status === "completed"
      && (results.length === 0 || results.some((row) => !row.reviewCount))
    ) {
      try {
        const csvResults = await completedCsvResults(config, id);
        if (csvResults.length > 0) results = csvResults;
      } catch {
        // The compact JSON result remains usable when the optional CSV is not ready yet.
      }
    }
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
  } catch (error) {
    const message = error instanceof DurableStoreError
      ? "Pemeriksaan akses hasil sementara tidak tersedia."
      : "Layanan tidak dapat dijangkau.";
    return Response.json(
      { message },
      { status: error instanceof DurableStoreError ? 503 : 502 },
    );
  }
}
