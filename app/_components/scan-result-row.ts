import { createElement } from "react";
import type { LeadRow } from "../../lib/leads";
import type { Locale } from "../../lib/locale";

type ScanResultRowProps = {
  row: LeadRow;
  sequence: number;
  locale?: Locale;
};

export function leadDetailItems(row: LeadRow, locale: Locale = "id") {
  const en = locale === "en";
  return [
    [en ? "Primary category" : "Kategori utama", row.primaryCategory],
    [en ? "Additional categories" : "Kategori tambahan", row.additionalCategories],
    [en ? "City" : "Kota", row.city],
    [en ? "Regency" : "Kabupaten", row.regency],
    [en ? "Subdistrict/area" : "Kecamatan/area", row.subdistrict],
    [en ? "Website domain" : "Domain website", row.domain],
    [en ? "Business status" : "Status bisnis", row.businessStatus],
    [en ? "Open/closed status" : "Status buka/tutup", row.openStatus],
    [en ? "Business hours" : "Jam operasional", row.regularHours],
    [en ? "Price range" : "Kisaran harga", row.priceRange],
    [en ? "Amenities/attributes" : "Fasilitas/atribut", row.attributes],
    ["Place ID", row.placeId],
  ].filter(([, value]) => Boolean(value));
}

function detailPanel(row: LeadRow, locale: Locale) {
  const en = locale === "en";
  const items = leadDetailItems(row, locale);
  if (items.length === 0 && !row.photoUrl) return null;

  return createElement("details", { className: "lead-details" },
    createElement("summary", null, en ? "Data details " : "Detail data ", createElement("span", null, `${items.length + (row.photoUrl ? 1 : 0)} ${en ? "available" : "tersedia"}`)),
    createElement("dl", null,
      ...items.map(([label, value]) => createElement("div", { key: label }, createElement("dt", null, label), createElement("dd", null, value))),
      row.photoUrl
        ? createElement("div", null, createElement("dt", null, en ? "Photo/logo" : "Foto/logo"), createElement("dd", null, createElement("a", { href: row.photoUrl, target: "_blank", rel: "noreferrer" }, en ? "Open photo source ↗" : "Buka sumber foto ↗")))
        : null,
    ),
  );
}

export function ScanResultRow({ row, sequence, locale = "id" }: ScanResultRowProps) {
  const en = locale === "en";
  const telephone = row.phone.replace(/[^\d+]/g, "");

  return createElement("tr", null,
    createElement("td", { "data-label": "No" }, createElement("span", { className: "result-index" }, sequence)),
    createElement("td", { "data-label": en ? "Business" : "Bisnis", className: "business-cell" },
      createElement("strong", null, row.business || (en ? "Name unavailable" : "Nama tidak tersedia")),
      createElement("span", null, row.category || (en ? "Category unavailable" : "Kategori tidak tersedia")),
      detailPanel(row, locale),
    ),
    createElement("td", { "data-label": en ? "Address" : "Alamat", className: "address-cell" }, row.address || (en ? "Address unavailable" : "Alamat tidak tersedia")),
    createElement("td", { "data-label": en ? "Contact" : "Kontak", className: "contact-cell" },
      row.phone ? createElement("a", { href: `tel:${telephone}` }, row.phone) : createElement("span", null, en ? "Phone unavailable" : "Telepon tidak tersedia"),
      row.email ? createElement("a", { href: `mailto:${row.email}` }, row.email) : createElement("span", null, en ? "Email unavailable" : "Email tidak tersedia"),
    ),
    createElement("td", { "data-label": "Website", className: "website-cell" },
      row.website
        ? [createElement("span", { key: "status", className: "status-tag", "data-status": "ready" }, en ? "Available" : "Tersedia"), createElement("a", { key: "link", href: row.website, target: "_blank", rel: "noreferrer" }, en ? "Open website ↗" : "Buka website ↗")]
        : createElement("span", { className: "status-tag", "data-status": "missing" }, en ? "Missing" : "Belum ada"),
    ),
    createElement("td", { "data-label": "Rating", className: "rating-cell" }, createElement("strong", null, row.rating || "—")),
    createElement("td", en ? { "data-label": "Review count", className: "review-count-cell" } : { "data-label": "Jumlah ulasan", className: "review-count-cell" }, createElement("strong", null, row.reviewCount || "—"), createElement("span", { className: "cell-note" }, row.reviewCount ? (en ? "Google Maps reviews" : "ulasan Google Maps") : (en ? "Not provided by source" : "Tidak dikirim sumber"))),
    createElement("td", { "data-label": en ? "Coordinates" : "Koordinat", className: "numeric-cell" }, row.coordinates || "—"),
    createElement("td", { "data-label": en ? "Source" : "Sumber", className: "source-cell" }, row.source ? createElement("a", { href: row.source, target: "_blank", rel: "noreferrer" }, en ? "Open Maps ↗" : "Buka Maps ↗") : createElement("span", null, "—")),
  );
}
