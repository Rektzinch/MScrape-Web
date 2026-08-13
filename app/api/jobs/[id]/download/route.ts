import { backendFetch, getBackendConfig } from "@/lib/backend";
import { DurableStoreError } from "@/lib/durable-store";
import { ownsJob } from "@/lib/job-ownership";
import { existingVisitorSession } from "@/lib/visitor-session";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: Request, context: RouteContext) {
  const config = getBackendConfig();
  if (!config) {
    return Response.json(
      { message: "Backend API belum dikonfigurasi." },
      { status: 503 },
    );
  }

  if (config.mode !== "web") {
    return Response.json(
      { message: "Unduhan CSV langsung hanya tersedia pada mode web." },
      { status: 400 },
    );
  }

  const { id } = await context.params;
  if (!/^[a-zA-Z0-9_-]{6,128}$/.test(id)) {
    return Response.json({ message: "ID job tidak valid." }, { status: 400 });
  }

  try {
    if (!await ownsJob(id, existingVisitorSession(request))) {
      return Response.json({ message: "File tidak tersedia." }, { status: 404 });
    }

    const response = await backendFetch(
      config,
      `/api/v1/jobs/${encodeURIComponent(id)}/download`,
      { headers: { Accept: "text/csv" } },
      30_000,
    );

    if (!response.ok) {
      return Response.json(
        { message: "File hasil belum tersedia." },
        { status: response.status === 404 ? 404 : 502 },
      );
    }

    return new Response(response.body, {
      headers: {
        "Content-Type": response.headers.get("Content-Type") || "text/csv",
        "Content-Disposition": `attachment; filename="mscrape-${id}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    const message = error instanceof DurableStoreError
      ? "Pemeriksaan akses file sementara tidak tersedia."
      : "Backend tidak dapat dijangkau.";
    return Response.json(
      { message },
      { status: error instanceof DurableStoreError ? 503 : 502 },
    );
  }
}
