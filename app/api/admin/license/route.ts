import { timingSafeEqual } from "node:crypto";
import {
  createManagedLicense,
  getManagedLicense,
  listManagedLicenses,
  managedLicenseOverview,
  resetManagedLicense,
  type ManagedTier,
} from "@/lib/admin-license-ledger";
import { analyticsOverview } from "@/lib/admin-analytics-ledger";
import { DurableStoreError, durableStoreConfigured } from "@/lib/durable-store";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

function authorized(request: Request) {
  const expected = process.env.MSCRAPE_ADMIN_GATEWAY_TOKEN?.trim() || "";
  const supplied = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return expected.length >= 32 && left.length === right.length && timingSafeEqual(left, right);
}

function isManagedTier(value: unknown): value is ManagedTier {
  return value === "pro" || value === "max";
}

function validId(value: unknown): value is string {
  return typeof value === "string" && /^[A-F0-9]{12}$/.test(value);
}

export async function POST(request: Request) {
  if (!authorized(request)) {
    return Response.json({ message: "Gateway admin tidak terotorisasi." }, { status: 401, headers: noStoreHeaders });
  }
  if (!durableStoreConfigured()) {
    return Response.json({ message: "Ledger lisensi belum tersedia." }, { status: 503, headers: noStoreHeaders });
  }

  let body: { action?: unknown; tier?: unknown; id?: unknown; reason?: unknown };
  try {
    body = await request.json() as typeof body;
  } catch {
    return Response.json({ message: "Permintaan gateway tidak dapat dibaca." }, { status: 400, headers: noStoreHeaders });
  }

  try {
    switch (body.action) {
      case "overview":
        return Response.json({ overview: await managedLicenseOverview() }, { headers: noStoreHeaders });
      case "analytics":
        return Response.json({ analytics: await analyticsOverview() }, { headers: noStoreHeaders });
      case "list":
        return Response.json({ licenses: await listManagedLicenses() }, { headers: noStoreHeaders });
      case "detail": {
        if (!validId(body.id)) return Response.json({ message: "ID lisensi tidak valid." }, { status: 400, headers: noStoreHeaders });
        const license = await getManagedLicense(body.id);
        if (!license) return Response.json({ message: "Kode tidak ditemukan di inventaris admin." }, { status: 404, headers: noStoreHeaders });
        return Response.json({ license }, { headers: noStoreHeaders });
      }
      case "create":
        if (!isManagedTier(body.tier)) return Response.json({ message: "Tier harus Pro atau Max." }, { status: 400, headers: noStoreHeaders });
        return Response.json({ license: await createManagedLicense(body.tier) }, { status: 201, headers: noStoreHeaders });
      case "reset": {
        if (!validId(body.id)) return Response.json({ message: "ID lisensi tidak valid." }, { status: 400, headers: noStoreHeaders });
        const reason = typeof body.reason === "string" ? body.reason.trim() : "";
        if (reason.length < 3 || reason.length > 300) {
          return Response.json({ message: "Catatan alasan reset harus berisi 3–300 karakter." }, { status: 400, headers: noStoreHeaders });
        }
        const license = await resetManagedLicense(body.id, reason);
        if (!license) return Response.json({ message: "Kode tidak ditemukan di inventaris admin." }, { status: 404, headers: noStoreHeaders });
        return Response.json({ license }, { headers: noStoreHeaders });
      }
      default:
        return Response.json({ message: "Aksi gateway tidak dikenal." }, { status: 400, headers: noStoreHeaders });
    }
  } catch (error) {
    const message = error instanceof DurableStoreError
      ? "Ledger lisensi sementara tidak tersedia."
      : error instanceof Error
        ? error.message
        : "Gateway lisensi tidak dapat diproses.";
    return Response.json({ message }, { status: 503, headers: noStoreHeaders });
  }
}
