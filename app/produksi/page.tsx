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
            <p className="production-heading__index">WORKSPACE / 01</p>
            <h1 id="production-title">Cari bisnis lokal.</h1>
            <p>Rancang pencarian di panel kiri. Data yang tersedia akan tersusun di panel hasil tanpa mengubah informasi sumber.</p>
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
