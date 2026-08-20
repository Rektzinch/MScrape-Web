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
            <p className="ms-production-heading__index">Session 01 / Google Maps</p>
            <h1 id="production-title">Rakit pencarian.<br />Pegang datanya.</h1>
            <p>Atur niche dan wilayah di panel kiri. Dataset sumber tumbuh di panel kanan, siap diperiksa, disaring, dan diekspor.</p>
            <div className="ms-production-heading__meta" aria-label="Informasi sesi">
              <span><b>Mode</b> Live scan</span>
              <span><b>Output</b> Business records</span>
            </div>
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
