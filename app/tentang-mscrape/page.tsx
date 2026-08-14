import type { Metadata } from "next";
import { AppFooter } from "../_components/app-footer";
import { AppHeader } from "../_components/app-header";

export const metadata: Metadata = {
  title: "Tentang MScrape",
  description: "Kenali MScrape, workspace untuk riset bisnis lokal, analisis, dan tindak lanjut yang lebih terarah.",
  alternates: { canonical: "/tentang-mscrape" },
  openGraph: { url: "/tentang-mscrape" },
};

export default function TentangMScrapePage() {
  return (
    <>
      <AppHeader current="info" />
      <main className="info-page">
        <section className="info-masthead" aria-labelledby="about-title">
          <div className="info-masthead__inner wb-shell">
            <p>01 / TENTANG</p>
            <h1 id="about-title">MScrape membantu pencarian lokal menjadi titik awal kerja yang lebih terarah.</h1>
          </div>
        </section>
        <section className="info-essay wb-shell" aria-label="Tentang MScrape">
          <div className="info-essay__lead">
            <p className="info-kicker">Dari pencarian menjadi konteks</p>
            <p>MScrape adalah workspace untuk menemukan, mengumpulkan, dan menata data bisnis lokal sesuai kebutuhan pencarian Anda. Hasilnya dapat digunakan sebagai dasar riset, analisis, prioritas tindak lanjut, atau ekspor daftar kerja.</p>
          </div>
          <div className="info-essay__detail">
            <article>
              <span>01</span>
              <h2>Temukan konteks</h2>
              <p>Tentukan niche dan wilayah agar pencarian dimulai dari pasar lokal yang relevan dengan tujuan Anda.</p>
            </article>
            <article>
              <span>02</span>
              <h2>Periksa data</h2>
              <p>Baca ketersediaan website, kontak, rating, dan sumber untuk memilih data yang paling layak ditinjau lebih lanjut.</p>
            </article>
            <article>
              <span>03</span>
              <h2>Siapkan tindak lanjut</h2>
              <p>Saring dan ekspor hasil sebagai daftar kerja yang dapat dibawa ke proses riset atau komunikasi berikutnya.</p>
            </article>
          </div>
        </section>
        <AppFooter />
      </main>
    </>
  );
}
