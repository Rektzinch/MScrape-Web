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
  ["Cakupan", "10 hingga 500 tempat", "Bergantung tier"],
  ["Akses", "Kode aktivasi", "Tanpa login · aktif 3 bulan sejak redeem"],
  ["Jeda", "5 menit / 15 detik / tanpa cooldown", "Free / Pro / Max"],
  ["Kolom kosong", "Dipertahankan kosong", "Tidak ditebak"],
  ["Mode backend", "Google live / web / queue", "Bergantung konfigurasi"],
];

const processSteps = [
  {
    icon: "query",
    coordinate: "01 / INPUT",
    title: "Kueri dibentuk",
    detail: "Niche, kota, negara, bahasa, dan batas hasil dipadatkan menjadi satu permintaan yang dapat dilacak.",
  },
  {
    icon: "filter",
    coordinate: "02 / FILTER",
    title: "Celah dipertahankan",
    detail: "Website, email, atau telepon yang tidak tersedia tetap kosong—bukan ditebak agar tabel terlihat penuh.",
  },
  {
    icon: "export",
    coordinate: "03 / OUTPUT",
    title: "Antrean siap dibawa",
    detail: "Filter aktif menentukan baris CSV; awalan formula dinetralkan sebelum file meninggalkan browser.",
  },
] as const;

const adminWhatsapp = "https://wa.me/6285111349699";

const pricing = [
  {
    code: "01 / FREE",
    tier: "Free",
    price: "Rp0",
    term: "selamanya",
    capacity: "10 hasil",
    cooldown: "Jeda 5 menit / request",
    cta: "Mulai Free →",
    href: "/produksi",
    external: false,
  },
  {
    code: "02 / PRO",
    tier: "Pro",
    price: "Rp27.000",
    term: "/ 3 bulan",
    capacity: "Hingga 100 hasil",
    cooldown: "Jeda 15 detik / request",
    cta: "Beli Pro via WhatsApp ↗",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Pro 3 bulan seharga Rp27.000.")}`,
    external: true,
  },
  {
    code: "03 / MAX",
    tier: "Max",
    price: "Rp55.000",
    term: "/ 3 bulan",
    capacity: "Hingga 500 hasil",
    cooldown: "Tanpa cooldown",
    cta: "Beli Max via WhatsApp ↗",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Max 3 bulan seharga Rp55.000.")}`,
    external: true,
  },
] as const;

function ProcessIcon({ name }: { name: (typeof processSteps)[number]["icon"] }) {
  if (name === "query") {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><circle cx="21" cy="21" r="11" /><path d="m29 29 9 9M21 15v12M15 21h12" /></svg>;
  }
  if (name === "filter") {
    return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M8 12h32L28 25v10l-8 4V25L8 12Z" /><path d="M14 18h20" /></svg>;
  }
  return <svg viewBox="0 0 48 48" aria-hidden="true"><path d="M10 30v8h28v-8M24 8v22M16 22l8 8 8-8" /></svg>;
}

export default function DashboardPage() {
  return (
    <>
      <AppHeader current="dashboard" />
      <main className="dashboard-page">
        <section className="dashboard-hero wb-shell" aria-labelledby="dashboard-title">
          <div className="dashboard-hero__copy wb-reveal" style={{ "--reveal-index": 0 } as React.CSSProperties}>
            <p className="dashboard-kicker">Google Maps live · no-store</p>
            <h1 id="dashboard-title">Dari pencarian lokal ke data siap kerja.</h1>
            <p className="dashboard-hero__lede">
              MScrape mengubah satu niche dan satu wilayah menjadi daftar bisnis yang dapat
              diperiksa, difilter, lalu dibawa ke CSV tanpa mengisi celah data dengan tebakan.
            </p>
            <dl className="hero-facts" aria-label="Karakteristik utama">
              <div><dt>Data contoh</dt><dd>Tidak digunakan</dd></div>
              <div><dt>Cache pencarian</dt><dd>Dimatikan</dd></div>
              <div><dt>Rentang hasil</dt><dd>10—500 / request</dd></div>
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

        <section className="dashboard-pricing" aria-labelledby="pricing-title">
          <div className="dashboard-pricing__inner wb-shell dashboard-scroll-scene">
            <header className="dashboard-pricing__head">
              <div>
                <p className="dashboard-pricing__kicker">Harga akses · Pro/Max aktif 3 bulan</p>
                <h2 id="pricing-title">Pilih kapasitas sebelum mulai scan.</h2>
              </div>
              <div className="dashboard-pricing__intro">
                <p>
                  Free langsung aktif. Pro dan Max dibeli dari admin, lalu masa aktif dihitung
                  sejak kode berhasil diredeem di Produksi.
                </p>
                <span aria-hidden="true">Geser kartu untuk membandingkan →</span>
              </div>
            </header>

            <div className="pricing-rail" aria-label="Harga lisensi MScrape" tabIndex={0}>
              {pricing.map((plan) => (
                <article className="pricing-card" data-tier={plan.tier.toLowerCase()} key={plan.tier}>
                  <header className="pricing-card__head">
                    <span>{plan.code}</span>
                    <span>{plan.term}</span>
                  </header>
                  <div className="pricing-card__title">
                    <h3>{plan.tier}</h3>
                    <p>{plan.price}</p>
                  </div>
                  <dl className="pricing-card__facts">
                    <div><dt>Batas hasil</dt><dd>{plan.capacity}</dd></div>
                    <div><dt>Kecepatan</dt><dd>{plan.cooldown}</dd></div>
                  </dl>
                  <a
                    className="pricing-card__cta"
                    href={plan.href}
                    {...(plan.external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {plan.cta}
                  </a>
                </article>
              ))}
            </div>

            <p className="dashboard-pricing__note">
              Butuh bantuan memilih? <a href={adminWhatsapp} target="_blank" rel="noreferrer">Chat admin · 0851 1134 9699 ↗</a>
            </p>
          </div>
        </section>

        <section className="dashboard-essay wb-shell dashboard-scroll-scene" aria-labelledby="essay-title">
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

        <section className="dashboard-process" aria-labelledby="process-title">
          <div className="dashboard-process__inner wb-shell dashboard-scroll-scene">
            <header className="dashboard-process__head">
              <h2 id="process-title">Dari titik peta ke antrean kerja.</h2>
              <p>
                Pola koordinat bukan tempelan dekoratif. Ia menandai tiga perubahan bentuk data
                yang benar-benar terjadi sebelum hasil bisa diunduh.
              </p>
            </header>
            <ol className="process-track">
              {processSteps.map((step) => (
                <li key={step.coordinate}>
                  <span className="process-track__icon"><ProcessIcon name={step.icon} /></span>
                  <div>
                    <span className="process-track__coordinate">{step.coordinate}</span>
                    <h3>{step.title}</h3>
                    <p>{step.detail}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section className="dashboard-capture wb-shell dashboard-scroll-scene" aria-labelledby="capture-title">
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

        <section className="dashboard-spec wb-shell dashboard-scroll-scene" aria-labelledby="spec-title">
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

        <footer className="dashboard-footer wb-shell dashboard-scroll-scene">
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
