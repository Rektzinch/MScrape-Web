import { createElement } from "react";
import type { LeadRow } from "../../lib/leads";

type ScanResultRowProps = {
  row: LeadRow;
  sequence: number;
};

export function leadDetailItems(row: LeadRow) {
  return [
    ["Kategori utama", row.primaryCategory],
    ["Kategori tambahan", row.additionalCategories],
    ["Kota", row.city],
    ["Kabupaten", row.regency],
    ["Kecamatan/area", row.subdistrict],
    ["Domain website", row.domain],
    ["Status bisnis", row.businessStatus],
    ["Status buka/tutup", row.openStatus],
    ["Jam operasional", row.regularHours],
    ["Kisaran harga", row.priceRange],
    ["Fasilitas/atribut", row.attributes],
    ["Place ID", row.placeId],
  ].filter(([, value]) => Boolean(value));
}

function detailPanel(row: LeadRow) {
  const items = leadDetailItems(row);
  if (items.length === 0 && !row.photoUrl) return null;

  return createElement("details", { className: "lead-details" },
    createElement("summary", null, "Detail data ", createElement("span", null, `${items.length + (row.photoUrl ? 1 : 0)} tersedia`)),
    createElement("dl", null,
      ...items.map(([label, value]) => createElement("div", { key: label }, createElement("dt", null, label), createElement("dd", null, value))),
      row.photoUrl
        ? createElement("div", null, createElement("dt", null, "Foto/logo"), createElement("dd", null, createElement("a", { href: row.photoUrl, target: "_blank", rel: "noreferrer" }, "Buka sumber foto ↗")))
        : null,
    ),
  );
}

export function ScanResultRow({ row, sequence }: ScanResultRowProps) {
  const telephone = row.phone.replace(/[^\d+]/g, "");

  return createElement("tr", null,
    createElement("td", { "data-label": "No" }, createElement("span", { className: "result-index" }, sequence)),
    createElement("td", { "data-label": "Bisnis", className: "business-cell" },
      createElement("strong", null, row.business || "Nama tidak tersedia"),
      createElement("span", null, row.category || "Kategori tidak tersedia"),
      detailPanel(row),
    ),
    createElement("td", { "data-label": "Alamat", className: "address-cell" }, row.address || "Alamat tidak tersedia"),
    createElement("td", { "data-label": "Kontak", className: "contact-cell" },
      row.phone ? createElement("a", { href: `tel:${telephone}` }, row.phone) : createElement("span", null, "Telepon tidak tersedia"),
      row.email ? createElement("a", { href: `mailto:${row.email}` }, row.email) : createElement("span", null, "Email tidak tersedia"),
    ),
    createElement("td", { "data-label": "Website", className: "website-cell" },
      row.website
        ? [createElement("span", { key: "status", className: "status-tag", "data-status": "ready" }, "Tersedia"), createElement("a", { key: "link", href: row.website, target: "_blank", rel: "noreferrer" }, "Buka website ↗")]
        : createElement("span", { className: "status-tag", "data-status": "missing" }, "Belum ada"),
    ),
    createElement("td", { "data-label": "Rating", className: "rating-cell" }, createElement("strong", null, row.rating || "—")),
    createElement("td", { "data-label": "Ulasan", className: "review-count-cell" }, createElement("strong", null, row.reviewCount || "—"), createElement("span", { className: "cell-note" }, row.reviewCount ? "ulasan Google Maps" : "Tidak dikirim sumber")),
    createElement("td", { "data-label": "Koordinat", className: "numeric-cell" }, row.coordinates || "—"),
    createElement("td", { "data-label": "Sumber", className: "source-cell" }, row.source ? createElement("a", { href: row.source, target: "_blank", rel: "noreferrer" }, "Buka Maps ↗") : createElement("span", null, "—")),
  );
}
