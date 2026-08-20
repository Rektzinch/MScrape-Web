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
      <main className="ms-home">
        <aside className="ms-notice">
          <span>10 scan gratis untuk memulai</span>
          <Link href="/produksi">Coba sekarang <span aria-hidden="true">→</span></Link>
        </aside>

        <section className="ms-hero wb-shell" aria-labelledby="home-title">
          <p className="ms-hero__eyebrow"><span aria-hidden="true" /> MScrape / pencarian bisnis lokal</p>
          <h1 id="home-title">Baca pasar lokal.<br /><em>Baris demi baris.</em></h1>
          <p className="ms-hero__lead">Tentukan niche dan wilayah. MScrape menyusun data bisnis yang tersedia dari Google Maps menjadi daftar yang bisa Anda tinjau dan ekspor.</p>

          <div className="ms-command" aria-label="Contoh pencarian MScrape">
            <span className="ms-command__prompt" aria-hidden="true">QUERY</span>
            <span className="ms-command__text">Klinik gigi di Makassar</span>
            <Link href="/produksi" data-analytics-cta="hero_buka_produksi">Cari bisnis <span aria-hidden="true">↗</span></Link>
          </div>
          <a className="ms-hero__quiet-link" href="#cara-kerja" data-analytics-cta="hero_cara_kerja">Lihat apa yang akan Anda dapatkan ↓</a>

          <div className="ms-records" aria-label="Contoh data bisnis yang tersedia">
            <div className="ms-records__head"><span>Bisnis</span><span>Wilayah</span><span>Website</span><span>Kontak</span></div>
            <div><strong>Ruang Dental Care</strong><span>Panakkukang</span><span className="is-missing">Belum ada</span><span>+62 8•••</span></div>
            <div><strong>Klinik Senyum</strong><span>Rappocini</span><span>kliniks•••.com</span><span>+62 8•••</span></div>
            <div><strong>Dental Point</strong><span>Tamalate</span><span className="is-missing">Belum ada</span><span>+62 4•••</span></div>
          </div>
          <HomeAnalytics />
        </section>

        <HomeDashboardContent />

        <section className="ms-faq wb-shell" id="faq" aria-labelledby="faq-title">
          <div className="ms-faq-head">
            <p>Pertanyaan umum</p>
            <h2 id="faq-title">Sebelum scan pertama.</h2>
          </div>
          <div className="ms-faq__list">
            {faqs.map((faq) => (
              <details key={faq.question}>
                <summary>{faq.question}</summary>
                <p>{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>

        <section className="ms-closing wb-shell" aria-labelledby="home-cta-title">
          <p>Query pertama</p>
          <h2 id="home-cta-title">Niche apa yang<br />ingin Anda petakan?</h2>
          <div><p>Jalankan 10 scan pertama tanpa biaya. Tidak perlu kartu pembayaran.</p>
          <Link className="ms-closing__link" href="/produksi" data-analytics-cta="footer_buka_produksi">Buka Produksi <span aria-hidden="true">↗</span></Link></div>
        </section>
      </main>
      <AppFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </>
  );
}
