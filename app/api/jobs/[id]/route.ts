import {
  backendErrorMessage,
  backendFetch,
  getBackendConfig,
  readBackendJson,
} from "@/lib/backend";
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

export async function GET(request: Request, context: RouteContext) {
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
    if (!await ownsJob(id, existingVisitorSession(request))) {
      return Response.json({ message: "Job tidak tersedia." }, { status: 404 });
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
  } catch (error) {
    const message = error instanceof DurableStoreError
      ? "Pemeriksaan akses job sementara tidak tersedia."
      : "Backend tidak dapat dijangkau.";
    return Response.json(
      { message },
      { status: error instanceof DurableStoreError ? 503 : 502 },
    );
  }
}
