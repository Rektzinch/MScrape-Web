import type { Metadata } from "next";
import Image from "next/image";
import { AppHeader } from "../_components/app-header";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Cara MScrape mengambil, menyaring, dan mengekspor data bisnis dari Google Maps.",
};

const principles = [
  {
    term: "Sumber",
    detail: "Google Maps diminta ketika scan dijalankan; respons tidak diambil dari seed atau data demo.",
  },
  {
    term: "Prioritas",
    detail: "Filter awal mendahulukan bisnis tanpa website yang memiliki nomor untuk ditindaklanjuti.",
  },
  {
    term: "Ekspor",
    detail: "CSV mengikuti filter aktif dan menetralkan awalan formula sebelum file diunduh.",
  },
];

const specifications = [
  ["Pengambilan", "Live request", "Cache-Control: no-store"],
  ["Cakupan", "Hingga 100 tempat", "Per request"],
  ["Kolom kosong", "Dipertahankan kosong", "Tidak ditebak"],
  ["Mode backend", "Google live / web / queue", "Bergantung konfigurasi"],
];

export default function DashboardPage() {
  return (
    <>
      <AppHeader current="dashboard" />
      <main className="dashboard-page">
        <section className="dashboard-hero wb-shell" aria-labelledby="dashboard-title">
          <div className="dashboard-hero__copy wb-reveal" style={{ "--reveal-index": 0 } as React.CSSProperties}>
            <p className="dashboard-kicker">Google Maps live · no-store</p>
            <h1 id="dashboard-title">Cari bisnis yang belum punya website.</h1>
            <p className="dashboard-hero__lede">
              MScrape mengubah satu niche dan satu wilayah menjadi daftar bisnis yang dapat
              diperiksa, difilter, lalu dibawa ke CSV tanpa mengisi celah data dengan tebakan.
            </p>
            <dl className="hero-facts" aria-label="Karakteristik utama">
              <div><dt>Data contoh</dt><dd>Tidak digunakan</dd></div>
              <div><dt>Cache pencarian</dt><dd>Dimatikan</dd></div>
              <div><dt>Hasil maksimum</dt><dd>100 / request</dd></div>
            </dl>
          </div>

          <figure className="dashboard-hero__media wb-reveal" style={{ "--reveal-index": 1 } as React.CSSProperties}>
            <video
              {...{ fetchpriority: "high" }}
              autoPlay
              muted
              loop
              playsInline
              controls
              preload="metadata"
              poster="/media/mscrape-tour.webp"
              aria-describedby="tour-caption"
            >
              <source src="/media/mscrape-tour.webm" type="video/webm" />
              <source src="/media/mscrape-tour.mp4" type="video/mp4" />
              <track
                default
                kind="captions"
                src="/media/mscrape-tour.vtt"
                srcLang="id"
                label="Bahasa Indonesia"
              />
            </video>
            <Image
              className="dashboard-hero__poster"
              src="/media/mscrape-tour.webp"
              alt="Tampilan halaman Produksi MScrape dengan formulir scan dan panel hasil"
              width={1600}
              height={1000}
              sizes="(min-width: 60rem) 62vw, 100vw"
              priority
            />
            <figcaption id="tour-caption">
              Tur singkat workspace Produksi—mulai dari konfigurasi hingga hasil siap difilter.
            </figcaption>
          </figure>
        </section>

        <section className="dashboard-essay wb-shell" aria-labelledby="essay-title">
          <header className="dashboard-section-head">
            <h2 id="essay-title">Satu request, jejak yang dapat diperiksa.</h2>
            <p>
              Dashboard ini menjelaskan perilaku produk. Pekerjaan sebenarnya tetap berada di
              Produksi agar konteks membaca dan konteks menjalankan scan tidak bercampur.
            </p>
          </header>
          <div className="dashboard-essay__body">
            <p>
              Ketika form dikirim, route server membentuk kueri dari niche, kota, negara, bahasa,
              dan batas hasil. Mode Google live mengembalikan hasil dalam request yang sama;
              backend web atau queue dapat melanjutkannya sebagai job yang dipantau berkala.
            </p>
            <p>
              Data yang diterima tetap apa adanya. Nama, alamat, telepon, email, website, rating,
              koordinat, dan tautan sumber hanya ditampilkan bila sumber menyediakannya. Tidak
              ada skor prospek, testimoni, atau statistik keberhasilan yang dibuat untuk mengisi UI.
            </p>
          </div>
          <dl className="principle-ledger">
            {principles.map((item) => (
              <div key={item.term}>
                <dt>{item.term}</dt>
                <dd>{item.detail}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="dashboard-capture wb-shell" aria-labelledby="capture-title">
          <header className="dashboard-section-head dashboard-section-head--compact">
            <h2 id="capture-title">UI yang menunjukkan sumber keputusan.</h2>
            <p>
              Satu tangkapan nyata dari Produksi menjadi dokumentasi visual, bukan dekorasi.
            </p>
          </header>
          <figure className="product-capture">
            <div className="product-capture__image">
              <Image
                src="/media/production-console.webp"
                alt="Workspace Produksi MScrape menampilkan konfigurasi, status API, dan hasil scan"
                width={1600}
                height={1000}
                sizes="(min-width: 60rem) 72rem, 100vw"
                loading="lazy"
              />
              <span className="capture-pin capture-pin--one" aria-hidden="true">1</span>
              <span className="capture-pin capture-pin--two" aria-hidden="true">2</span>
              <span className="capture-pin capture-pin--three" aria-hidden="true">3</span>
            </div>
            <figcaption>
              <ol className="capture-legend">
                <li><span>1</span> Konfigurasi pencarian tetap ringkas dan berlabel jelas.</li>
                <li><span>2</span> Status API dan request dibaca pada konteks yang sama.</li>
                <li><span>3</span> Filter serta ekspor bekerja pada hasil yang benar-benar diterima.</li>
              </ol>
            </figcaption>
          </figure>
        </section>

        <section className="dashboard-spec wb-shell" aria-labelledby="spec-title">
          <header className="dashboard-section-head dashboard-section-head--compact">
            <h2 id="spec-title">Batas produk dibuat terlihat.</h2>
            <p>Setiap baris menyatakan perilaku yang sudah ada di source, bukan janji pemasaran.</p>
          </header>
          <div className="spec-table-wrap">
            <table className="dashboard-spec__table">
              <caption className="sr-only">Spesifikasi perilaku MScrape</caption>
              <thead>
                <tr><th>Bagian</th><th>Perilaku</th><th>Catatan</th></tr>
              </thead>
              <tbody>
                {specifications.map(([part, behavior, note]) => (
                  <tr key={part}>
                    <th scope="row">{part}</th><td>{behavior}</td><td>{note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <footer className="dashboard-footer wb-shell">
          <p className="dashboard-footer__statement">Data yang tidak ada tetap kosong.</p>
          <div className="dashboard-footer__meta">
            <span className="app-wordmark">MSCRAPE/</span>
            <span>Google Maps live · open source</span>
            <a href="https://github.com/Rektzinch/MScrape-Web">Periksa source ↗</a>
          </div>
        </footer>
      </main>
    </>
  );
}
