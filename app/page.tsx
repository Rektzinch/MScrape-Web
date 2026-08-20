import type { Metadata } from "next";
import Image from "next/image";
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
          <div className="home-hero__copy">
            <p className="home-hero__signal">Google Maps live · Indonesia</p>
            <h1 id="home-title">Cari data bisnis.<br />Mulai percakapan yang lebih tepat.</h1>
            <p className="home-hero__lead">
              Cari bisnis berdasarkan niche dan wilayah, lalu dapatkan nama, alamat, telepon,
              website, rating, serta data kontak yang tersedia dalam satu workspace.
            </p>
            <div className="home-hero__actions">
              <Link className="seo-button seo-button--primary" href="/produksi" data-analytics-cta="hero_buka_produksi">Mulai scan</Link>
              <a className="home-hero__text-link" href="#cara-kerja" data-analytics-cta="hero_cara_kerja">Lihat cara kerja ↓</a>
            </div>
            <dl className="home-hero__facts" aria-label="Ringkasan layanan MScrape">
              <div><dt>Sumber</dt><dd>Google Maps live</dd></div>
              <div><dt>Cakupan</dt><dd>Kota &amp; kecamatan</dd></div>
              <div><dt>Output</dt><dd>CSV · TXT · JSON</dd></div>
            </dl>
          </div>

          <figure className="home-hero__visual">
            <div className="home-hero__visual-frame">
              <Image
                src="/media/production-console.webp"
                alt="Workspace Produksi MScrape untuk mengatur pencarian dan meninjau hasil bisnis"
                width={1600}
                height={1000}
                sizes="(min-width: 60rem) 54vw, 100vw"
                priority
              />
              <span className="home-hero__pin home-hero__pin--one" aria-hidden="true">1</span>
              <span className="home-hero__pin home-hero__pin--two" aria-hidden="true">2</span>
              <span className="home-hero__pin home-hero__pin--three" aria-hidden="true">3</span>
            </div>
            <figcaption>
              <span><b>1</b> Masukkan niche</span>
              <span><b>2</b> Pilih wilayah</span>
              <span><b>3</b> Ekspor hasil</span>
            </figcaption>
          </figure>
          <HomeAnalytics />
        </section>

        <HomeDashboardContent />

        <section className="seo-faq wb-shell" aria-labelledby="faq-title">
          <div className="seo-section-heading">
            <h2 id="faq-title">Pertanyaan yang sering muncul.</h2>
            <p>Jawaban singkat sebelum Anda menjalankan scan pertama.</p>
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
          <div>
            <h2 id="home-cta-title">Mulai dari niche dan wilayah yang Anda pahami.</h2>
          </div>
          <div>
            <p>Jalankan scan Free pertama, tinjau data yang tersedia, lalu ekspor daftar yang ingin Anda tindak lanjuti.</p>
            <Link className="seo-button seo-button--dark" href="/produksi" data-analytics-cta="footer_buka_produksi">Buka Produksi →</Link>
          </div>
        </section>
      </main>
      <AppFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </>
  );
}
