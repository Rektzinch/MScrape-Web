import { backendFetch, getBackendConfig } from "@/lib/backend";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(_request: Request, context: RouteContext) {
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
  } catch {
    return Response.json(
      { message: "Backend tidak dapat dijangkau." },
      { status: 502 },
    );
  }
}
