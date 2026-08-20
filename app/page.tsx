import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "./_components/app-footer";
import { AppHeader } from "./_components/app-header";
import { HomeAnalytics } from "./_components/home-analytics";
import { HomeDashboardContent } from "./_components/home-dashboard-content";

export const metadata: Metadata = {
  title: {
    absolute: "MScrape — Google Maps Scraper & Pencari Data Bisnis Indonesia",
  },
  description:
    "Cari dan kumpulkan data bisnis dari Google Maps dengan MScrape. Temukan nama bisnis, alamat, telepon, website, rating, jumlah ulasan, dan email bila tersedia, lalu ekspor hasil ke CSV.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    url: "/",
  },
};

const faqs = [
  {
    question: "Apa itu MScrape?",
    answer:
      "MScrape adalah workspace untuk mencari dan menyusun data bisnis yang tersedia dari hasil Google Maps berdasarkan niche dan wilayah.",
  },
  {
    question: "Data apa saja yang bisa ditemukan?",
    answer:
      "Hasil scan dapat memuat nama bisnis, kategori, alamat, telepon, website, rating, jumlah ulasan, tautan Google Maps, koordinat, dan email apabila tersedia pada sumber.",
  },
  {
    question: "Apa beda jumlah scan dan batas hasil?",
    answer:
      "Jumlah scan menunjukkan berapa kali pencarian dapat dijalankan. Batas hasil menunjukkan jumlah maksimal bisnis yang diminta dalam satu scan.",
  },
  {
    question: "Apakah pencarian bisa sampai tingkat kecamatan?",
    answer:
      "Ya. Opsi cakupan kecamatan tersedia pada paket Pro dan Max, sedangkan kapasitas hasil mengikuti paket yang aktif.",
  },
  {
    question: "Bagaimana cara mengunduh hasil?",
    answer:
      "Setelah scan selesai, pilih filter yang dibutuhkan lalu unduh daftar sebagai CSV, TXT, JSON, atau file yang siap diimpor ke Google Sheets.",
  },
] as const;

const faqStructuredData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

export default function Home() {
  return (
    <>
      <AppHeader current="info" />
      <main className="seo-page seo-page--home dashboard-page">
        <section className="home-hero wb-shell" aria-labelledby="home-title">
          <div className="home-hero__index" aria-hidden="true">
            <span>BUSINESS DISCOVERY</span><span>INDONESIA / 2026</span>
          </div>
          <div className="home-hero__copy">
            <p className="home-hero__signal"><span aria-hidden="true" /> Google Maps live · siap digunakan</p>
            <h1 id="home-title">Cari data bisnis.<br /><em>Temukan peluang lokal.</em></h1>
            <div className="home-hero__lower">
              <p className="home-hero__lead">
                Cari bisnis berdasarkan niche dan wilayah. Susun nama, alamat, telepon,
                website, rating, dan data kontak yang tersedia dalam satu workspace.
              </p>
              <div className="home-hero__actions">
                <Link className="seo-button seo-button--primary" href="/produksi" data-analytics-cta="hero_buka_produksi">Mulai scan <span aria-hidden="true">↗</span></Link>
                <a className="home-hero__text-link" href="#cara-kerja" data-analytics-cta="hero_cara_kerja">Pelajari alur <span aria-hidden="true">↓</span></a>
              </div>
            </div>
          </div>

          <div className="product-stage" aria-label="Contoh workspace pencarian MScrape">
            <div className="product-stage__rail">
              <span className="product-stage__brand"><i aria-hidden="true">M</i> MScrape / Produksi</span>
              <span className="product-stage__live"><i aria-hidden="true" /> Live source</span>
            </div>
            <div className="product-stage__canvas">
              <div className="product-stage__query">
                <div className="product-stage__panel-head"><span>01 / QUERY</span><strong>Rancang scan</strong></div>
                <div className="product-stage__field"><span>Cari apa?</span><b>Klinik gigi</b></div>
                <div className="product-stage__field"><span>Di mana?</span><b>Makassar</b></div>
                <div className="product-stage__query-row"><div className="product-stage__field"><span>Cakupan</span><b>Kota / Kabupaten</b></div><div className="product-stage__field"><span>Jumlah</span><b>100 bisnis</b></div></div>
                <span className="product-stage__button">Mulai scan <b aria-hidden="true">↗</b></span>
              </div>
              <div className="product-stage__dataset">
                <div className="product-stage__panel-head"><span>02 / DATASET</span><strong>Hasil pencarian</strong></div>
                <div className="product-stage__stats"><span><b>100</b> Diterima</span><span><b>37</b> Tanpa website</span><span><b>28</b> Punya nomor</span></div>
                <div className="product-stage__table" role="presentation">
                  <div><span>Bisnis</span><span>Area</span><span>Kontak</span></div>
                  <div><strong>Ruang Dental Care</strong><span>Panakkukang</span><span>+62 8•••</span></div>
                  <div><strong>Klinik Senyum</strong><span>Rappocini</span><span>+62 8•••</span></div>
                  <div><strong>Dental Point</strong><span>Tamalate</span><span>+62 4•••</span></div>
                </div>
              </div>
            </div>
            <ol className="product-stage__notes">
              <li><span>01</span> Tentukan niche</li><li><span>02</span> Pilih wilayah</li><li><span>03</span> Ekspor dataset</li>
            </ol>
          </div>

          <dl className="home-hero__facts" aria-label="Ringkasan layanan MScrape">
            <div><dt>01 / Sumber</dt><dd>Google Maps live</dd></div>
            <div><dt>02 / Cakupan</dt><dd>Kota &amp; kecamatan</dd></div>
            <div><dt>03 / Output</dt><dd>CSV · TXT · JSON</dd></div>
            <div><dt>04 / Mulai</dt><dd>10 scan gratis</dd></div>
          </dl>
          <HomeAnalytics />
        </section>

        <HomeDashboardContent />

        <section className="seo-faq wb-shell" id="faq" aria-labelledby="faq-title">
          <div className="seo-section-heading">
            <p>06 / FAQ</p>
            <h2 id="faq-title">Sebelum scan pertama.</h2>
          </div>
          <div className="seo-faq__list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="seo-cta wb-shell" aria-labelledby="home-cta-title">
          <p>READY WHEN YOU ARE</p>
          <h2 id="home-cta-title">Mulai dari pasar<br />yang Anda pahami.</h2>
          <div><p>Jalankan 10 scan pertama tanpa biaya. Tinjau data yang tersedia, lalu pilih daftar yang layak ditindaklanjuti.</p>
          <Link className="seo-button seo-button--dark" href="/produksi" data-analytics-cta="footer_buka_produksi">Buka Produksi <span aria-hidden="true">↗</span></Link></div>
        </section>
      </main>
      <AppFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </>
  );
}
