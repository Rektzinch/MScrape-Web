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
      <main className="production-page">
        <section className="production-masthead" aria-labelledby="production-title">
          <div className="production-heading wb-shell">
            <div>
              <h1 id="production-title">Produksi</h1>
            </div>
            <p>
              Cari bisnis berdasarkan niche dan wilayah. Atur jumlah hasil, jalankan scan,
              lalu tinjau dan ekspor data yang tersedia.
            </p>
          </div>
        </section>
        <section className="production-workspace wb-shell" aria-label="Workspace scraping">
          <ScrapeConsole />
        </section>
        <AppFooter />
      </main>
    </>
  );
}
