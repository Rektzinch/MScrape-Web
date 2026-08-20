import type { Metadata } from "next";
import { AppFooter } from "../_components/app-footer";
import { AppHeader } from "../_components/app-header";
import { ScrapeConsole } from "../_components/scrape-console";
import { DocumentLanguage } from "../_components/document-language";
import type { Locale } from "@/lib/locale";

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

export function ProductionPage({ locale = "id" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <>
      <DocumentLanguage locale={locale} />
      <AppHeader current="production" locale={locale} currentPath={en ? "/en/produksi" : "/produksi"} />
      <main className="ms-production">
        <section className="ms-production-intro" aria-labelledby="production-title">
          <div className="ms-production-heading wb-shell">
            <p className="ms-production-heading__index">Session 01 / Google Maps</p>
            <h1 id="production-title">{en ? <>Build the search.<br />Own the data.</> : <>Rakit pencarian.<br />Pegang datanya.</>}</h1>
            <p>{en ? "Set the niche and region in the left panel. The source dataset grows on the right, ready to review, filter, and export." : "Atur niche dan wilayah di panel kiri. Dataset sumber tumbuh di panel kanan, siap diperiksa, disaring, dan diekspor."}</p>
            <div className="ms-production-heading__meta" aria-label={en ? "Session information" : "Informasi sesi"}>
              <span><b>Mode</b> Live scan</span>
              <span><b>Output</b> Business records</span>
            </div>
          </div>
        </section>
        <section className="ms-production-workspace wb-shell" aria-label={en ? "Scraping workspace" : "Workspace scraping"}>
          <ScrapeConsole locale={locale} />
        </section>
        <AppFooter locale={locale} />
      </main>
    </>
  );
}

export default function ProduksiPage() {
  return <ProductionPage />;
}
