import { activationIsConfigured, licenseCookie, validateLicenseCode } from "@/lib/license";
import { planAccess } from "@/lib/plans";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const noStoreHeaders = {
  "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
};

export async function POST(request: Request) {
  if (!activationIsConfigured()) {
    return Response.json(
      { message: "Aktivasi belum dikonfigurasi oleh admin." },
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

  return Response.json(
    { access: planAccess(license.tier) },
    {
      headers: {
        ...noStoreHeaders,
        "Set-Cookie": licenseCookie(license.code),
      },
    },
  );
}
