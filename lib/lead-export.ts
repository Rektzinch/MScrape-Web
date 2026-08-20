import type { LeadRow } from "./leads";

export type ExportRecord = {
  business: string;
  category: string;
  primaryCategory: string;
  additionalCategories: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  regency: string;
  subdistrict: string;
  latitude: string;
  longitude: string;
  coordinates: string;
  rating: string;
  reviews: string;
  businessStatus: string;
  openStatus: string;
  regularHours: string;
  priceRange: string;
  attributes: string;
  websiteStatus: string;
  website: string;
  domain: string;
  googleMaps: string;
  placeId: string;
  photoUrl: string;
};

export const exportColumns = [
  ["business", "Nama Bisnis"],
  ["category", "Kategori"],
  ["primaryCategory", "Kategori Utama"],
  ["additionalCategories", "Kategori Tambahan"],
  ["phone", "Telepon"],
  ["email", "Email"],
  ["address", "Alamat Lengkap"],
  ["city", "Kota"],
  ["regency", "Kabupaten"],
  ["subdistrict", "Kecamatan/Area"],
  ["latitude", "Latitude"],
  ["longitude", "Longitude"],
  ["coordinates", "Koordinat"],
  ["rating", "Rating"],
  ["reviews", "Jumlah Ulasan"],
  ["businessStatus", "Status Bisnis"],
  ["openStatus", "Status Buka/Tutup"],
  ["regularHours", "Jam Operasional"],
  ["priceRange", "Kisaran Harga"],
  ["attributes", "Fasilitas/Atribut"],
  ["websiteStatus", "Status Website"],
  ["website", "Website"],
  ["domain", "Domain Website"],
  ["googleMaps", "Google Maps URL"],
  ["placeId", "Place ID"],
  ["photoUrl", "Foto/Logo URL"],
] as const satisfies readonly (readonly [keyof ExportRecord, string])[];

export const exportHeaders = exportColumns.map(([, label]) => label);

export function toExportRecord(row: LeadRow, city: string): ExportRecord {
  return {
    business: row.business,
    category: row.category,
    primaryCategory: row.primaryCategory,
    additionalCategories: row.additionalCategories,
    phone: row.phone,
    email: row.email,
    address: row.address,
    city: row.city || city,
    regency: row.regency,
    subdistrict: row.subdistrict,
    latitude: row.latitude,
    longitude: row.longitude,
    coordinates: row.coordinates,
    rating: row.rating,
    reviews: row.reviewCount,
    businessStatus: row.businessStatus,
    openStatus: row.openStatus,
    regularHours: row.regularHours,
    priceRange: row.priceRange,
    attributes: row.attributes,
    websiteStatus: row.website ? "Memiliki website" : "Belum memiliki website",
    website: row.website,
    domain: row.domain,
    googleMaps: row.source,
    placeId: row.placeId,
    photoUrl: row.photoUrl,
  };
}

function csvCell(value: string | number) {
  const normalized = String(value).replace(/[\r\n]+/g, " ").trim();
  const formulaSafe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${formulaSafe.replaceAll('"', '""')}"`;
}

function rowsToCsv(headers: string[], rows: Array<Array<string | number>>) {
  return `\uFEFF${[
    headers.map(csvCell).join(","),
    ...rows.map((row) => row.map(csvCell).join(",")),
  ].join("\r\n")}`;
}

export function recordsToCsv(records: ExportRecord[]) {
  return rowsToCsv(exportHeaders, records.map((record) => exportColumns.map(([key]) => record[key])));
}

export function recordsToSheetsCsv(records: ExportRecord[]) {
  const headers = [...exportHeaders, "Status Prospek", "Terakhir Dihubungi", "Follow-up", "Catatan"];
  const rows = records.map((record) => [...exportColumns.map(([key]) => record[key]), "", "", "", ""]);
  return rowsToCsv(headers, rows);
}

export function recordsToText(records: ExportRecord[]) {
  return records.map((record, index) => [
    `# ${index + 1}`,
    `Nama Bisnis: ${record.business}`,
    `Kategori: ${record.category}`,
    `Kontak: ${record.phone}`,
    `Email: ${record.email}`,
    `Alamat: ${record.address}`,
    `Wilayah: ${[record.city, record.regency, record.subdistrict].filter(Boolean).join(" · ")}`,
    `Koordinat: ${record.coordinates}`,
    `Rating/Ulasan: ${[record.rating, record.reviews && `${record.reviews} ulasan`].filter(Boolean).join(" · ")}`,
    `Operasional: ${[record.businessStatus, record.openStatus, record.regularHours].filter(Boolean).join(" · ")}`,
    `Atribut: ${record.attributes}`,
    `Status Website: ${record.websiteStatus}`,
    `Website: ${record.website}`,
    `Domain: ${record.domain}`,
    `Google Maps: ${record.googleMaps}`,
    `Place ID: ${record.placeId}`,
    `Foto/Logo: ${record.photoUrl}`,
  ].join("\n")).join("\n\n");
}

export function recordsToJson(records: ExportRecord[], metadata: { keyword: string; city: string; fetchedAt: string | null }, websiteFilter: string) {
  return JSON.stringify({
    metadataPencarian: {
      kataKunci: metadata.keyword,
      kota: metadata.city,
      filterWebsite: websiteFilter,
      waktuPengambilan: metadata.fetchedAt,
      jumlahBisnis: records.length,
    },
    bisnis: records.map((record) => ({
      nama: record.business,
      kategori: { umum: record.category, utama: record.primaryCategory, tambahan: record.additionalCategories },
      kontak: { telepon: record.phone, email: record.email },
      lokasi: { alamat: record.address, kota: record.city, kabupaten: record.regency, kecamatanArea: record.subdistrict, latitude: record.latitude, longitude: record.longitude, koordinat: record.coordinates },
      ratingUlasan: { rating: record.rating, ulasan: record.reviews },
      operasional: { statusBisnis: record.businessStatus, statusBuka: record.openStatus, jam: record.regularHours },
      atribut: { fasilitas: record.attributes, kisaranHarga: record.priceRange },
      website: { status: record.websiteStatus, url: record.website, domain: record.domain },
      googleMaps: { url: record.googleMaps, placeId: record.placeId },
      media: { fotoAtauLogo: record.photoUrl },
    })),
  }, null, 2);
}
