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

  assert.match(rebrand, /@media\s*\(max-width:\s*39\.99rem\)[\s\S]*?\.ms-header__actions \{ display: none; \}/);
  assert.match(rebrand, /@media\s*\(max-width:\s*39\.99rem\)[\s\S]*?\.ms-plan \{[^}]*grid-template-columns: 1fr;/);
  assert.match(rebrand, /--ms-paper: #f3f2ec;/);
  assert.match(rebrand, /--ms-accent: #70dd70;/);
  assert.match(rebrand, /\.ms-production \.ms-console \{[\s\S]*?grid-template-columns:/);
});
