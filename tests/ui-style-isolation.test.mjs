import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../", import.meta.url);

test("landing dan produksi baru terisolasi dari selector layout lama", async () => {
  const [legacy, rebrand, home, pricing, production, consoleView] = await Promise.all([
    readFile(new URL("app/workbench.css", root), "utf8"),
    readFile(new URL("app/ms-interface.css", root), "utf8"),
    readFile(new URL("app/page.tsx", root), "utf8"),
    readFile(new URL("app/_components/home-dashboard-content.tsx", root), "utf8"),
    readFile(new URL("app/produksi/page.tsx", root), "utf8"),
    readFile(new URL("app/_components/scrape-console.tsx", root), "utf8"),
  ]);

  assert.doesNotMatch(legacy, /\.ms-(?:home|hero|pricing|plan|production|console|header|footer)\b/);
  assert.doesNotMatch(`${home}\n${pricing}`, /className="[^"]*(?:dashboard-|pricing-card|pricing-rail|home-hero|seo-page)/);
  assert.match(home, /className="ms-home"/);
  assert.match(pricing, /className="ms-plan"/);
  assert.match(production, /className="ms-production"/);
  assert.match(consoleView, /className="ms-console"/);
  assert.doesNotMatch(`${home}\n${pricing}`, /product-stage|ms-process|ms-use-list/);
  assert.doesNotMatch(pricing, /ms-workflow|Mesin kerja/);
  assert.match(pricing, /aria-roledescription="carousel"/);

  assert.match(rebrand, /\.ms-header__nav,\s*\.ms-header__actions \{ display: none; \}/);
  assert.match(rebrand, /\.ms-plan-list \{[^}]*grid-auto-flow: column;[^}]*scroll-snap-type: inline mandatory;/);
  assert.match(rebrand, /\.ms-plan \{[^}]*scroll-snap-align: start;[^}]*scroll-snap-stop: always;/);
  assert.match(rebrand, /@media\s*\(min-width:\s*64rem\)[\s\S]*?\.ms-header__actions \{ display: flex;/);
  assert.match(rebrand, /--ms-paper: #f3efe6;/);
  assert.match(rebrand, /--ms-coral: #ff5a3d;/);
  assert.match(rebrand, /--ms-violet: #6558f5;/);
  assert.match(rebrand, /\.ms-plan\[data-tier="pro"\] \{[^}]*background: var\(--ms-coral\);/);
  assert.match(rebrand, /\.ms-plan\[data-tier="max"\] \{[^}]*background: var\(--ms-violet\);/);
  assert.match(rebrand, /\.ms-production \.combobox__trigger > svg \{ width: 1rem; height: 1rem;/);
  assert.match(rebrand, /\.ms-production \.button__icon \{ width: 1\.1rem; height: 1\.1rem;/);
  assert.match(rebrand, /\.ms-production \.results-table tr \{[^}]*grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(rebrand, /\.ms-production \.results-table td:first-child \{[^}]*background: var\(--ms-violet\);[^}]*color: var\(--ms-light\);/);
  assert.match(rebrand, /@media\s*\(pointer:\s*coarse\)[\s\S]*?\.ms-production \.results-table tbody \{[^}]*grid-template-columns: minmax\(0, 1fr\);/);
  assert.match(rebrand, /@supports\s*\(animation-timeline:\s*view\(\)\)[\s\S]*?animation-timeline: view\(\);/);
  assert.match(rebrand, /\.ms-production \.action-toast\[data-tone="success"\]\[data-persistent="true"\]/);
  assert.match(consoleView, /notify\("Scan selesai",[^\n]+"success", true\);/);
  assert.match(consoleView, /data-persistent=\{toast\.persistent/);
  assert.match(rebrand, /\.ms-production \.ms-console \{[^}]*display: grid;/);
  assert.match(rebrand, /\.ms-production \.results \{ min-height: 30rem; \}/);
  assert.match(rebrand, /@media\s*\(min-width:\s*64rem\)[\s\S]*?\.ms-production \.ms-console \{ grid-template-columns:/);
  assert.match(rebrand, /@media\s*\(min-width:\s*64rem\)[\s\S]*?\.ms-production \.results \{ grid-column: 2; grid-row: 2;/);
});
