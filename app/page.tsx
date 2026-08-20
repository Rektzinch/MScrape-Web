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
          <div className="ms-hero-map" aria-hidden="true">
            <svg viewBox="0 0 1440 860" preserveAspectRatio="xMidYMid slice">
              <g className="ms-hero-map__blocks">
                <path d="M-20 126 154 73l93 84-35 120-183 29Z" />
                <path d="m280 20 182 25 54 96-86 84-166-39Z" />
                <path d="m535 61 167-47 111 95-38 137-209-11Z" />
                <path d="m840 25 202 11 56 129-107 67-167-76Z" />
                <path d="m1127 14 205 55 56 131-197 46-68-93Z" />
                <path d="m94 352 165-55 115 96-27 129-226 12Z" />
                <path d="m420 286 210 23 44 143-169 83-126-112Z" />
                <path d="m755 293 173-68 126 106-58 160-223 28-63-113Z" />
                <path d="m1092 291 217-42 98 121-79 160-216-16-57-112Z" />
                <path d="m-35 621 238-42 99 123-68 150-232-7Z" />
                <path d="m350 598 183-66 142 102-31 182-221 34-96-126Z" />
                <path d="m744 584 202-50 118 117-68 181-221 9-76-139Z" />
                <path d="m1095 599 209-41 148 132-72 169-236-22-79-129Z" />
              </g>
              <g className="ms-hero-map__routes">
                <path d="M-50 520C185 463 276 528 474 407S779 166 982 248s280 60 508-43" />
                <path d="M231-20c66 190 204 278 146 446S323 712 431 900" />
                <path d="M1038-40c-76 164-34 282 65 399s117 280 31 541" />
                <path d="M-40 198c240 102 410 33 597 74s348 139 523 103 253-4 410 108" />
                <path d="M-30 744c215-87 369-26 543-12s332-89 497-45 292 57 481-4" />
              </g>
              <g className="ms-hero-map__minor">
                <path d="M14 408 337 93M126 812 611 285M502 856 847 280M800 863l517-517M953 754l435-282M97 63l438 392M538 20l-80 811M705 0l148 860M1189 0l-104 860M0 666l1440-94M0 344l1440 311" />
              </g>
              <g className="ms-hero-map__points">
                <circle cx="278" cy="454" r="4" /><circle cx="491" cy="316" r="4" />
                <circle cx="823" cy="274" r="4" /><circle cx="1096" cy="363" r="4" />
                <circle cx="1007" cy="686" r="4" /><circle cx="427" cy="735" r="4" />
              </g>
            </svg>
            <span className="ms-map-coordinate ms-map-coordinate--north">05°08′ S</span>
            <span className="ms-map-coordinate ms-map-coordinate--east">119°25′ E</span>
            <span className="ms-map-district ms-map-district--one">PANAKKUKANG / 37</span>
            <span className="ms-map-district ms-map-district--two">RAPPOCINI / 24</span>
            <div className="ms-map-scan"><i /><i /><i /><b /></div>
          </div>
          <div className="ms-hero__copy">
            <p className="ms-hero__eyebrow"><span aria-hidden="true" /> MScrape / pencarian bisnis lokal</p>
            <h1 id="home-title">Baca pasar lokal.<br /><em>Baris demi baris.</em></h1>
            <p className="ms-hero__lead">Tentukan niche dan wilayah. MScrape menyusun data bisnis yang tersedia dari Google Maps menjadi daftar yang bisa Anda tinjau dan ekspor.</p>

            <div className="ms-command" aria-label="Contoh pencarian MScrape">
              <span className="ms-command__prompt" aria-hidden="true">QUERY</span>
              <span className="ms-command__text">Klinik gigi di Makassar</span>
              <Link href="/produksi" data-analytics-cta="hero_buka_produksi">Cari bisnis <span aria-hidden="true">↗</span></Link>
            </div>
            <a className="ms-hero__quiet-link" href="#cara-kerja" data-analytics-cta="hero_cara_kerja">Lihat alur dan data yang tersedia ↓</a>
          </div>

          <div className="ms-hero-product" aria-label="Pratinjau workspace MScrape">
            <div className="ms-hero-product__bar">
              <span><i /> Produksi / scan baru</span>
              <span>Google Maps <b>aktif</b></span>
            </div>
            <div className="ms-hero-product__body">
              <div className="ms-hero-product__query">
                <span className="ms-product-label">Pencarian</span>
                <strong>Klinik gigi</strong>
                <p>
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 18s6-5.3 6-10A6 6 0 1 0 4 8c0 4.7 6 10 6 10Z"/><circle cx="10" cy="8" r="2"/></svg>
                  Makassar · Kota
                </p>
                <div><span>Target</span><b>100 bisnis</b></div>
                <div><span>Biaya</span><b>1 scan</b></div>
                <span className="ms-product-run">Jalankan pencarian <b>↗</b></span>
              </div>
              <div className="ms-hero-product__results">
                <div className="ms-product-results__head">
                  <div><span className="ms-product-label">Hasil</span><strong>Dataset bisnis</strong></div>
                  <span>37 tanpa website</span>
                </div>
                <div className="ms-product-stats"><span><b>100</b>Ditemukan</span><span><b>28</b>Punya nomor</span><span><b>12</b>Punya email</span></div>
                <div className="ms-records">
                  <div className="ms-records__head"><span>Bisnis</span><span>Wilayah</span><span>Website</span></div>
                  <div><strong>Ruang Dental Care</strong><span>Panakkukang</span><span className="is-missing">Belum ada</span></div>
                  <div><strong>Klinik Senyum</strong><span>Rappocini</span><span>kliniks•••.com</span></div>
                  <div><strong>Dental Point</strong><span>Tamalate</span><span className="is-missing">Belum ada</span></div>
                </div>
                <div className="ms-product-export"><span>CSV</span><span>JSON</span><span>Sheets</span><b>Ekspor ↗</b></div>
              </div>
            </div>
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
