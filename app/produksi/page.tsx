import type { Metadata } from "next";
import { AppHeader } from "../_components/app-header";
import { ScrapeConsole } from "../_components/scrape-console";

export const metadata: Metadata = {
  title: "Produksi",
  description: "Jalankan scan Google Maps, periksa hasil, filter lead, dan ekspor CSV.",
};

export default function ProduksiPage() {
  return (
    <>
      <AppHeader current="production" />
      <main className="production-page">
        <section className="production-heading wb-shell" aria-labelledby="production-title">
          <div>
            <p>Workspace langsung</p>
            <h1 id="production-title">Produksi</h1>
          </div>
          <p>
            Tentukan niche dan wilayah, pilih batas hingga 500 hasil sesuai lisensi, lalu periksa
            hanya data yang benar-benar dikembalikan oleh sumber.
          </p>
        </section>
        <section className="production-workspace wb-shell" aria-label="Workspace scraping">
          <ScrapeConsole />
        </section>
      </main>
    </>
  );
}
