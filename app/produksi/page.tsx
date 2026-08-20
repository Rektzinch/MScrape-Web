import type { Metadata } from "next";
import { AppFooter } from "../_components/app-footer";
import { AppHeader } from "../_components/app-header";
import { ScrapeConsole } from "../_components/scrape-console";

export const metadata: Metadata = {
  title: "Produksi",
  description: "Jalankan scan Google Maps, periksa hasil, filter lead, dan ekspor CSV.",
  alternates: {
    canonical: "/produksi",
  },
  openGraph: {
    url: "/produksi",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function ProduksiPage() {
  return (
    <>
      <AppHeader current="production" />
      <main className="ms-production">
        <section className="ms-production-intro" aria-labelledby="production-title">
          <div className="ms-production-heading wb-shell">
            <p className="ms-production-heading__index">Workspace / Produksi</p>
            <h1 id="production-title">Rancang query.<br />Periksa datanya.</h1>
            <p>Tentukan niche dan wilayah di panel pencarian. MScrape menyusun data sumber di panel hasil agar siap ditinjau, disaring, dan diekspor.</p>
          </div>
        </section>
        <section className="ms-production-workspace wb-shell" aria-label="Workspace scraping">
          <ScrapeConsole />
        </section>
        <AppFooter />
      </main>
    </>
  );
}
