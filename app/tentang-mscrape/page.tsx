import type { Metadata } from "next";
import { AppFooter } from "../_components/app-footer";
import { AppHeader } from "../_components/app-header";
import { DocumentLanguage } from "../_components/document-language";
import type { Locale } from "@/lib/locale";

export const metadata: Metadata = {
  title: "Tentang MScrape",
  description: "Kenali MScrape, workspace untuk riset bisnis lokal, analisis, dan tindak lanjut yang lebih terarah.",
  alternates: { canonical: "/tentang-mscrape" },
  openGraph: { url: "/tentang-mscrape" },
};

export function AboutPage({ locale = "id" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <>
      <DocumentLanguage locale={locale} />
      <AppHeader current="info" locale={locale} currentPath={en ? "/en/tentang-mscrape" : "/tentang-mscrape"} />
      <main className="info-page">
        <section className="info-masthead" aria-labelledby="about-title">
          <div className="info-masthead__inner wb-shell">
            <p>01 / {en ? "ABOUT" : "TENTANG"}</p>
            <h1 id="about-title">{en ? "MScrape turns local search into a more focused starting point for real work." : "MScrape membantu pencarian lokal menjadi titik awal kerja yang lebih terarah."}</h1>
          </div>
        </section>
        <section className="info-essay wb-shell" aria-label="Tentang MScrape">
          <div className="info-essay__lead">
            <p className="info-kicker">{en ? "From search to context" : "Dari pencarian menjadi konteks"}</p>
            <p>{en ? "MScrape is a workspace for finding, collecting, and organizing local business data around your search needs. Use the results as a foundation for research, analysis, follow-up priorities, or exported worklists." : "MScrape adalah workspace untuk menemukan, mengumpulkan, dan menata data bisnis lokal sesuai kebutuhan pencarian Anda. Hasilnya dapat digunakan sebagai dasar riset, analisis, prioritas tindak lanjut, atau ekspor daftar kerja."}</p>
          </div>
          <div className="info-essay__detail">
            <article>
              <span>01</span>
              <h2>{en ? "Find the context" : "Temukan konteks"}</h2>
              <p>{en ? "Choose a niche and region so the search starts from a local market relevant to your goal." : "Tentukan niche dan wilayah agar pencarian dimulai dari pasar lokal yang relevan dengan tujuan Anda."}</p>
            </article>
            <article>
              <span>02</span>
              <h2>{en ? "Review the data" : "Periksa data"}</h2>
              <p>{en ? "Review website, contact, rating, and source availability to choose which records deserve a closer look." : "Baca ketersediaan website, kontak, rating, dan sumber untuk memilih data yang paling layak ditinjau lebih lanjut."}</p>
            </article>
            <article>
              <span>03</span>
              <h2>{en ? "Prepare follow-up" : "Siapkan tindak lanjut"}</h2>
              <p>{en ? "Filter and export results as a worklist for your next research or communication step." : "Saring dan ekspor hasil sebagai daftar kerja yang dapat dibawa ke proses riset atau komunikasi berikutnya."}</p>
            </article>
          </div>
        </section>
        <AppFooter locale={locale} />
      </main>
    </>
  );
}

export default function TentangMScrapePage() {
  return <AboutPage />;
}
