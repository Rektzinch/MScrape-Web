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
        <section className="production-masthead" aria-labelledby="production-title">
          <div className="production-heading wb-shell">
            <div>
              <p>Workspace langsung · Google Maps live</p>
              <h1 id="production-title">Produksi</h1>
            </div>
            <p>
              Tentukan niche dan wilayah. Pro menerima jumlah manual hingga 250; Max menerima
              hingga 500 hasil per scan. Status hasil selalu menjelaskan bila sumber atau batas proses menghentikan pengambilan.
            </p>
          </div>
        </section>
        <section className="production-workspace wb-shell" aria-label="Workspace scraping">
          <ScrapeConsole />
        </section>
      </main>
    </>
  );
}
