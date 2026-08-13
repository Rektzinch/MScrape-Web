import {
  backendErrorMessage,
  backendFetch,
  getBackendConfig,
  readBackendJson,
} from "@/lib/backend";

type ScrapeInput = {
  keyword?: unknown;
  city?: unknown;
  country?: unknown;
  lang?: unknown;
  depth?: unknown;
  email?: unknown;
};

function cleanText(value: unknown, maxLength: number) {
  return typeof value === "string" ? value.trim().slice(0, maxLength) : "";
}

export async function POST(request: Request) {
  const config = getBackendConfig();

  if (!config) {
    return Response.json(
      { message: "Backend API belum dikonfigurasi." },
      { status: 503 },
    );
  }

  let body: ScrapeInput;
  try {
    body = (await request.json()) as ScrapeInput;
  } catch {
    return Response.json({ message: "Payload tidak valid." }, { status: 400 });
  }

  const keyword = cleanText(body.keyword, 100);
  const city = cleanText(body.city, 100);
  const country = cleanText(body.country, 100);
  const lang = cleanText(body.lang, 2).toLowerCase() || "en";
  const depth = Math.min(Math.max(Number(body.depth) || 1, 1), 10);
  const email = body.email === true;

  if (!keyword || !city || !country) {
    return Response.json(
      { message: "Niche, kota, dan negara wajib diisi." },
      { status: 400 },
    );
  }

  if (!/^[a-z]{2}$/.test(lang)) {
    return Response.json(
      { message: "Kode bahasa harus terdiri dari dua huruf." },
      { status: 400 },
    );
  }

  const query = `${keyword} in ${city}, ${country}`;
  const path = config.mode === "queue" ? "/api/v1/scrape" : "/api/v1/jobs";
  const payload =
    config.mode === "queue"
      ? {
          keyword: query,
          lang,
          max_depth: depth,
          email,
          timeout: 300,
        }
      : {
          name: query,
          keywords: [query],
          lang,
          depth,
          email,
          max_time: 300,
        };

  try {
    const response = await backendFetch(config, path, {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const data = await readBackendJson(response);

    if (!response.ok) {
      return Response.json(
        {
          message: backendErrorMessage(
            data,
            `Backend menolak permintaan (${response.status}).`,
          ),
        },
        { status: 502 },
      );
    }

    const jobId = data.job_id ?? data.id;
    if (typeof jobId !== "string" || !jobId) {
      return Response.json(
        { message: "Backend tidak mengembalikan ID job." },
        { status: 502 },
      );
    }

    return Response.json(
      {
        jobId,
        status: typeof data.status === "string" ? data.status : "pending",
        mode: config.mode,
      },
      { status: 202 },
    );
  } catch {
    return Response.json(
      { message: "Backend tidak dapat dijangkau." },
      { status: 502 },
    );
  }
}
