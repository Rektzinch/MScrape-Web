import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);
const source = (path) => readFile(new URL(path, root), "utf8");

test("popover produksi stays layered and bounded on mobile", async () => {
  const styles = await source("app/ms-interface.css");
  assert.match(styles, /\.ms-production \.combobox \{ position: relative;/);
  assert.match(styles, /\.ms-production \.combobox__popover \{ position: absolute;[^}]*overflow: hidden;/);
  assert.match(styles, /\.ms-production \.combobox__search svg \{[^}]*width: 1rem; height: 1rem;/);
  assert.match(styles, /\.ms-production \.combobox__options \{[^}]*max-height:[^;}]+;[^}]*overflow-y: auto;/);
  assert.match(styles, /@media \(min-width: 64rem\)[\s\S]*?\.ms-production \.results__actions \{ grid-template-columns: repeat\(2,/);
  assert.match(styles, /@media \(min-width: 84rem\)[\s\S]*?\.ms-production \.results__actions \{ grid-template-columns:/);
});

test("every public page family exposes an English route and persistent locale switch", async () => {
  const [header, englishHome, englishProduction, englishPages, sitemap] = await Promise.all([
    source("app/_components/app-header.tsx"),
    source("app/en/page.tsx"),
    source("app/en/produksi/page.tsx"),
    source("app/en/[slug]/page.tsx"),
    source("app/sitemap.ts"),
  ]);

  assert.match(header, /className="ms-locale-switch"/);
  assert.match(header, />ID<\/Link>/);
  assert.match(header, />EN<\/Link>/);
  assert.match(englishHome, /<HomePage locale="en"/);
  assert.match(englishProduction, /<ProductionPage locale="en"/);
  for (const slug of ["google-maps-scraper", "cari-data-bisnis", "lead-generation", "export-google-maps-csv", "cari-bisnis-tanpa-website", "tentang-mscrape", "syarat-ketentuan", "developer"]) {
    assert.match(englishPages, new RegExp(slug));
  }
  assert.match(sitemap, /"en-US"/);
});
