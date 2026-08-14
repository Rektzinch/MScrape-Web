import { DurableStoreError, durableStoreConfigured } from "@/lib/durable-store";
import { recordLicenseActivation } from "@/lib/admin-license-ledger";
import { activationIsConfigured, redeemLicense, validateLicenseCode } from "@/lib/license";
import { existingVisitorSession } from "@/lib/visitor-session";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function POST(request: Request) {
  if (!activationIsConfigured() || !durableStoreConfigured()) {
    return Response.json(
      { message: "Aktivasi belum dikonfigurasi aman oleh admin." },
      { status: 503, headers: noStoreHeaders },
    );
  }

  let body: { code?: unknown };
  try {
    body = (await request.json()) as { code?: unknown };
  } catch {
    return Response.json(
      { message: "Kode aktivasi tidak dapat dibaca." },
      { status: 400, headers: noStoreHeaders },
    );
  }

  const license = validateLicenseCode(body.code);
  if (!license) {
    return Response.json(
      { message: "Kode tidak valid. Periksa kembali kode dari admin." },
      { status: 401, headers: noStoreHeaders },
    );
  }

  try {
    const redeemed = await redeemLicense(license);
    if (!redeemed.redeemed) {
      return Response.json(
        { message: "Kode ini sudah diaktifkan. Hubungi admin untuk reset perangkat bila diperlukan." },
        { status: 409, headers: noStoreHeaders },
      );
    }

    try {
      await recordLicenseActivation(
        license.id,
        license.tier,
        new Date(redeemed.access.activatedAt || Date.now()).getTime(),
        new Date(redeemed.access.expiresAt || Date.now()).getTime(),
        existingVisitorSession(request),
      );
    } catch {
      // ponytail: aktivasi lisensi tetap berhasil bila pencatatan observabilitas tertunda.
    }

    return Response.json(
      { access: redeemed.access },
      {
        headers: {
          ...noStoreHeaders,
          "Set-Cookie": redeemed.cookie,
        },
      },
    );
  } catch (error) {
    const message = error instanceof DurableStoreError
      ? "Aktivasi sementara tidak tersedia. Coba lagi nanti."
      : "Aktivasi tidak dapat diproses.";
    return Response.json({ message }, { status: 503, headers: noStoreHeaders });
  }
}
