import assert from "node:assert/strict";
import test from "node:test";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { normalizeLead } from "../lib/leads.ts";
import {
  recordsToCsv,
  recordsToJson,
  recordsToText,
  toExportRecord,
} from "../lib/lead-export.ts";
import { parseBackendCsv } from "../lib/backend-results.ts";
import { ScanResultRow, leadDetailItems } from "../app/_components/scan-result-row.ts";

test("normalisasi mempertahankan field detail yang dikirim sumber dan mengosongkan field yang tidak dikirim", () => {
  const detailed = normalizeLead({
    name: "Kopi Contoh",
    complete_address: "Jl. Contoh 1, Sleman",
    city: "Yogyakarta",
    regency: "Sleman",
    subdistrict: "Depok",
    latitude: -7.78,
    longitude: 110.38,
    website_uri: "https://www.kopicontoh.id/menu",
    reviewCount: 87,
    primary_type: "cafe",
    types: ["cafe", "food"],
    place_id: "ChIJ-example",
    business_status: "OPERATIONAL",
    open_now: "Buka",
    opening_hours: "Senin—Minggu 08.00—22.00",
    price_range: "Rp20.000—Rp50.000",
    delivery: true,
    dineIn: true,
    wheelchairAccessibleEntrance: true,
    photo_url: "https://images.example/kopi.jpg",
  });

  assert.ok(detailed);
  assert.equal(detailed.city, "Yogyakarta");
  assert.equal(detailed.regency, "Sleman");
  assert.equal(detailed.subdistrict, "Depok");
  assert.equal(detailed.domain, "kopicontoh.id");
  assert.equal(detailed.placeId, "ChIJ-example");
  assert.equal(detailed.reviewCount, "87");
  assert.equal(detailed.coordinates, "-7.78, 110.38");
  assert.match(detailed.attributes, /Delivery/);
  assert.match(detailed.attributes, /Dine-in/);
  assert.match(detailed.attributes, /Akses kursi roda/);
  assert.deepEqual(
    leadDetailItems(detailed).map(([label]) => label),
    ["Kategori utama", "Kategori tambahan", "Kota", "Kabupaten", "Kecamatan/area", "Domain website", "Status bisnis", "Status buka/tutup", "Jam operasional", "Kisaran harga", "Fasilitas/atribut", "Place ID"],
  );

  const basic = normalizeLead({ name: "Usaha Dasar" });
  assert.ok(basic);
  assert.equal(basic.city, "");
  assert.equal(basic.regularHours, "");
  assert.equal(basic.photoUrl, "");
  assert.deepEqual(leadDetailItems(basic), []);
});

test("ekspor membawa field baru pada CSV, JSON, dan TXT serta mengamankan formula", () => {
  const row = normalizeLead({
    name: "=Usaha Aman",
    website: "https://www.contoh.id",
    city: "Bandung",
    primary_category: "Kafe",
    place_id: "ChIJ-export",
    attributes: "Delivery, Dine-in",
  });
  assert.ok(row);

  const record = toExportRecord(row, "Bandung");
  const csv = recordsToCsv([record]);
  assert.match(csv, /"'=?Usaha Aman"/);
  assert.match(csv, /"Kategori Utama"/);
  assert.match(csv, /"Place ID"/);
  assert.match(csv, /"ChIJ-export"/);

  const json = JSON.parse(recordsToJson([record], { keyword: "kafe", city: "Bandung", fetchedAt: "2026-08-20T00:00:00.000Z" }, "all"));
  assert.equal(json.bisnis[0].googleMaps.placeId, "ChIJ-export");
  assert.equal(json.bisnis[0].website.domain, "contoh.id");
  assert.equal(json.bisnis[0].atribut.fasilitas, "Delivery, Dine-in");

  const text = recordsToText([record]);
  assert.match(text, /Place ID: ChIJ-export/);
  assert.match(text, /Domain: contoh.id/);
});

test("baris hasil merender detail terisi pada struktur tabel yang dipakai kartu ponsel", () => {
  const row = normalizeLead({ name: "Kopi Render", category: "Kafe", city: "Bandung", primary_category: "Kafe", place_id: "ChIJ-render", opening_hours: "08.00—22.00" });
  assert.ok(row);

  const markup = renderToStaticMarkup(createElement("table", null, createElement("tbody", null, createElement(ScanResultRow, { row, sequence: 1 }))));
  assert.match(markup, /data-label="Bisnis"/);
  assert.match(markup, /class="lead-details"/);
  assert.match(markup, /Kota/);
  assert.match(markup, /Place ID/);
  assert.match(markup, /data-label="Koordinat"/);
});

test("CSV backend memperkaya jumlah ulasan yang tidak ada pada respons JSON ringkas", () => {
  const records = parseBackendCsv([
    "title,address,review_count,review_rating,website,phone",
    '"Kopi, Tengah","Jl. Mawar ""Baru""",128,4.8,https://kopi.example,+62123',
  ].join("\r\n"));

  assert.equal(records.length, 1);
  assert.equal(records[0].title, "Kopi, Tengah");
  assert.equal(records[0].address, 'Jl. Mawar "Baru"');

  const normalized = normalizeLead(records[0]);
  assert.ok(normalized);
  assert.equal(normalized.reviewCount, "128");
  assert.equal(normalized.rating, "4.8");
});
