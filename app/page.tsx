import type { Metadata } from "next";
import Link from "next/link";
import { AppFooter } from "./_components/app-footer";
import { AppHeader } from "./_components/app-header";
import { HeroBannerCarousel } from "./_components/hero-banner-carousel";
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

const capabilities = [
  ["Pencarian", "Kata kunci, kota, hingga kecamatan untuk akses Pro dan Max."],
  ["Data", "Nama bisnis, alamat, telepon, website, rating, jumlah ulasan, tautan Google Maps, serta email bila tersedia pada sumber."],
  ["Tindak lanjut", "Filter hasil dan ekspor daftar yang dipilih ke CSV untuk riset atau proses kerja tim."],
] as const;

const audiences = [
  ["Sales & agen", "Susun daftar bisnis lokal sebagai titik awal riset dan percakapan yang lebih relevan."],
  ["Freelancer", "Petakan bisnis di wilayah target saat menawarkan website, pemasaran, atau layanan digital."],
  ["Riset pasar", "Lihat lanskap bisnis suatu niche dan lokasi sebelum menentukan peluang yang akan diprioritaskan."],
] as const;

const relatedPages = [
  ["/google-maps-scraper", "Google Maps Scraper", "Pelajari cara mencari dan menyusun data bisnis dari Google Maps."],
  ["/cari-data-bisnis", "Cari Data Bisnis", "Gunakan niche dan lokasi untuk menemukan bisnis yang relevan."],
  ["/lead-generation", "Lead Generation Indonesia", "Bangun proses prospek lokal yang dimulai dari data yang terarah."],
  ["/export-google-maps-csv", "Ekspor Google Maps ke CSV", "Siapkan daftar hasil scan dalam format CSV untuk dikerjakan lebih lanjut."],
  ["/cari-bisnis-tanpa-website", "Cari Bisnis Tanpa Website", "Fokuskan riset pada bisnis yang belum menampilkan website pada hasil sumber."],
] as const;

const faqs = [
  {
    question: "Apa itu MScrape?",
    answer:
      "MScrape adalah aplikasi untuk mencari dan mengumpulkan data bisnis yang tersedia dari hasil Google Maps berdasarkan kata kunci dan wilayah.",
  },
  {
    question: "Data apa saja yang bisa ditemukan?",
    answer:
      "Hasil scan dapat memuat nama bisnis, alamat, telepon, website, rating, jumlah ulasan, tautan Google Maps, dan email apabila informasi tersebut tersedia pada sumber hasil.",
  },
  {
    question: "Apakah MScrape dapat mencari bisnis sampai tingkat kecamatan?",
    answer:
      "Ya. Opsi cakupan kecamatan tersedia pada paket Pro dan Max, sedangkan kapasitas hasil mengikuti batas paket yang dipilih.",
  },
  {
    question: "Bagaimana cara mengunduh hasil pencarian?",
    answer:
      "Setelah scan selesai, gunakan filter yang dibutuhkan lalu unduh hasil yang dipilih ke format CSV dari workspace Produksi.",
  },
  {
    question: "Bisakah saya mencari bisnis yang belum memiliki website?",
    answer:
      "Ya. Setelah hasil tersedia, gunakan konteks ketersediaan website untuk membantu memprioritaskan bisnis yang belum menampilkan website pada hasil sumber.",
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
      <HeroBannerCarousel />
      <main className="seo-page seo-page--home dashboard-page">
        <section className="seo-hero seo-hero--home wb-shell" aria-labelledby="home-title">
          <p className="seo-hero__kicker">MSCRAPE / DATA BISNIS INDONESIA</p>
          <h1 id="home-title">Cari Data Bisnis dari Google Maps</h1>
          <p className="seo-hero__lead">
            Temukan bisnis berdasarkan niche dan wilayah, kumpulkan informasi yang tersedia, lalu jadikan hasilnya daftar kerja untuk riset pasar, penawaran layanan, dan tindak lanjut yang lebih terarah.
          </p>
          <div className="seo-hero__actions">
            <Link className="seo-button seo-button--primary" href="/produksi">Mulai Cari Data Bisnis</Link>
            <Link className="seo-button seo-button--quiet" href="/google-maps-scraper">Cara kerja MScrape</Link>
          </div>
          <dl className="seo-fact-row" aria-label="Ringkasan layanan MScrape">
            <div><dt>Sumber</dt><dd>Google Maps live</dd></div>
            <div><dt>Ruang lingkup</dt><dd>Niche, kota &amp; kecamatan</dd></div>
            <div><dt>Output</dt><dd>Filter &amp; ekspor CSV</dd></div>
          </dl>
        </section>

        <section className="seo-body wb-shell" aria-label="Informasi utama MScrape">
          <article className="seo-article">
            <p className="seo-article__eyebrow">Informasi yang tersedia</p>
            <h2>Data apa yang bisa dicari dari Google Maps?</h2>
            <p>
              MScrape menata informasi yang tersedia pada hasil Google Maps agar lebih mudah ditinjau dalam satu workspace. Bergantung pada hasil sumber, daftar dapat mencakup nama bisnis, alamat, nomor telepon, website, rating, jumlah ulasan, tautan Google Maps, dan email bila tersedia.
            </p>
            <p>
              Pencarian dimulai dari kata kunci dan wilayah. Anda dapat memakainya untuk menyusun gambaran bisnis lokal sebelum membuat keputusan riset atau proses penawaran berikutnya.
            </p>
          </article>

          <article className="seo-article seo-article--ledger">
            <p className="seo-article__eyebrow">Untuk pekerjaan yang lebih terarah</p>
            <h2>Siapa yang cocok menggunakan MScrape?</h2>
            <div className="seo-ledger">
              {audiences.map(([title, detail]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="seo-article">
            <p className="seo-article__eyebrow">Dari lokasi ke daftar kerja</p>
            <h2>Temukan calon pelanggan dengan konteks yang lebih jelas</h2>
            <p>
              Daftar hasil bukan pengganti penilaian Anda. Namun, data lokasi dan informasi kontak yang tersedia membantu menempatkan bisnis dalam konteks yang benar sebelum Anda melakukan riset lebih lanjut atau menghubungi mereka melalui kanal yang sesuai.
            </p>
            <p>
              Untuk agensi, freelancer, dan tim sales, pencarian bisnis lokal dapat menjadi cara praktis untuk memulai pemetaan pasar tanpa mengandalkan daftar contoh yang tidak lagi relevan.
            </p>
          </article>

          <article className="seo-article seo-article--ledger">
            <p className="seo-article__eyebrow">Bekerja dengan hasil yang dipilih</p>
            <h2>Ekspor data Google Maps ke CSV</h2>
            <p>
              Setelah scan selesai, gunakan filter untuk memeriksa hasil yang paling relevan. Daftar pilihan kemudian dapat diunduh sebagai CSV, sehingga dapat dilanjutkan dalam spreadsheet atau alur kerja internal Anda.
            </p>
            <div className="seo-ledger">
              {capabilities.map(([title, detail]) => (
                <div key={title}>
                  <h3>{title}</h3>
                  <p>{detail}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="seo-article">
            <p className="seo-article__eyebrow">Peluang layanan digital</p>
            <h2>Cari bisnis tanpa website dengan lebih fokus</h2>
            <p>
              Saat menawarkan website atau layanan digital, status ketersediaan website dapat membantu Anda memprioritaskan hasil yang perlu ditinjau. MScrape memungkinkan Anda menggunakan informasi tersebut sebagai salah satu konteks filter, bukan sebagai asumsi akhir mengenai kondisi digital sebuah bisnis.
            </p>
            <Link className="seo-text-link" href="/cari-bisnis-tanpa-website">Pelajari pencarian bisnis tanpa website →</Link>
          </article>
        </section>

        <HomeDashboardContent />

        <section className="seo-related" aria-labelledby="home-related-title">
          <div className="wb-shell">
            <div className="seo-section-heading">
              <p>Pilih halaman sesuai tujuan</p>
              <h2 id="home-related-title">Mulai dari kebutuhan Anda</h2>
            </div>
            <div className="seo-related__grid">
              {relatedPages.map(([href, label, description]) => (
                <Link className="seo-related__card" href={href} key={href}>
                  <h3>{label}</h3>
                  <p>{description}</p>
                  <span aria-hidden="true">Buka panduan →</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="seo-faq wb-shell" aria-labelledby="faq-title">
          <div className="seo-section-heading">
            <p>Jawaban singkat</p>
            <h2 id="faq-title">Pertanyaan umum tentang MScrape</h2>
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
            <p>Mulai dengan pencarian yang spesifik</p>
            <h2 id="home-cta-title">Ubah niche dan wilayah menjadi titik awal riset Anda.</h2>
          </div>
          <div>
            <p>Gunakan paket Free untuk mencoba alur kerja atau pilih Pro dan Max saat membutuhkan kapasitas pencarian yang lebih luas.</p>
            <Link className="seo-button seo-button--dark" href="/produksi">Buka Produksi</Link>
          </div>
        </section>
      </main>
      <AppFooter />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }} />
    </>
  );
}
