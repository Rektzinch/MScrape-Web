import Image from "next/image";
import { TypewriterText } from "./typewriter-text";

const principles = [
  {
    term: "Manfaat",
    detail: "Kumpulkan data bisnis yang relevan agar riset, analisis, dan tindak lanjut dapat dimulai dari konteks yang jelas.",
  },
  {
    term: "Kelebihan",
    detail: "Hasil Google Maps diminta saat scan berjalan, lalu dapat difilter dan diunduh dalam format kerja yang sesuai tanpa data contoh.",
  },
  {
    term: "Cocok untuk",
    detail: "Tim sales, peneliti pasar, agen, freelancer, dan siapa pun yang membutuhkan data bisnis untuk langkah berikutnya.",
  },
];

const specifications = [
  ["Sumber prospek", "Google Maps live", "Data diminta saat scan dijalankan"],
  ["Alur kerja", "Cari · filter · ekspor", "Siap untuk riset dan outreach"],
  ["Cocok untuk", "Layanan digital lokal", "Agen web, freelancer, dan tim sales"],
  ["Akses", "Free, Pro, atau Max", "Pilih kapasitas sesuai ritme pencarian"],
  ["Data", "Kontak sesuai sumber", "Kolom kosong tetap transparan"],
  ["Langkah berikutnya", "Pilih paket lalu mulai scan", "CTA tersedia di setiap paket"],
];

const processSteps = [
  {
    icon: "query",
    coordinate: "01 / TEMUKAN",
    title: "Tentukan pasar lokal",
    detail: "Masukkan niche dan wilayah untuk mengarahkan pencarian kepada bisnis yang relevan dengan layanan Anda.",
  },
  {
    icon: "filter",
    coordinate: "02 / PILAH",
    title: "Fokus pada peluang",
    detail: "Gunakan ketersediaan website, email, dan telepon sebagai konteks untuk memprioritaskan tindak lanjut.",
  },
  {
    icon: "export",
    coordinate: "03 / TINDAK LANJUT",
    title: "Bawa daftar kerja Anda",
    detail: "Ekspor hasil yang dipilih ke CSV untuk riset, penawaran layanan, dan percakapan penjualan berikutnya.",
  },
] as const;

const adminWhatsapp = "https://wa.me/6285111349699";

const pricing = [
  {
    code: "01 / FREE",
    tier: "Free",
    price: "Rp0",
    term: "selamanya",
    badge: null,
    capacity: "10 kredit · 10 hasil / scan",
    cooldown: "Jeda 1 jam / scan",
    cta: "Mulai Free →",
    href: "/produksi",
    external: false,
  },
  {
    code: "02 / PRO",
    tier: "Pro",
    price: "Rp24.999",
    term: "/ 2 bulan",
    badge: "Paling laris",
    capacity: "500 kredit · input manual hingga 250 hasil / scan",
    cooldown: "Tanpa cooldown",
    cta: "Beli Pro via WhatsApp ↗",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Pro 2 bulan seharga Rp24.999.")}`,
    external: true,
  },
  {
    code: "03 / MAX",
    tier: "Max",
    price: "Rp149.000",
    term: "/ 2 bulan",
    badge: null,
    capacity: "1.500 kredit · input manual hingga 500 hasil / scan",
    cooldown: "Tanpa cooldown",
    cta: "Beli Max via WhatsApp ↗",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Max 2 bulan seharga Rp149.000.")}`,
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

export function HomeDashboardContent() {
  return (
    <>
      <section className="dashboard-hero wb-shell" aria-labelledby="home-workflow-title">
          <div className="dashboard-hero__copy wb-reveal" style={{ "--reveal-index": 0 } as React.CSSProperties}>
            <p className="dashboard-kicker">Data bisnis · Google Maps live</p>
            <h2 id="home-workflow-title">Temukan data bisnis yang relevan untuk langkah berikutnya.</h2>
            <p className="dashboard-hero__lede">
              MScrape membantu Anda menemukan, mengumpulkan, dan menata data bisnis sesuai kebutuhan pencarian—
              lalu menyiapkannya untuk riset, analisis, tindak lanjut, atau ekspor.
            </p>
            <p className="dashboard-typewriter" aria-label="Cari kecamatan, saring peluang, mulai percakapan.">
              <span>Ritme kerja:</span> <TypewriterText text="Cari kecamatan. Saring peluang. Mulai percakapan." />
            </p>
            <dl className="hero-facts" aria-label="Manfaat utama MScrape">
              <div><dt>Ruang lingkup</dt><dd>Kata kunci &amp; wilayah</dd></div>
              <div><dt>Data pencarian</dt><dd>Google Maps live</dd></div>
              <div><dt>Hasil kerja</dt><dd>Siap filter &amp; unduh</dd></div>
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
              Lihat bagaimana MScrape membantu mengubah niche dan wilayah menjadi daftar prospek lokal yang bisa ditindaklanjuti.
            </figcaption>
          </figure>

      </section>

        <section className="dashboard-pricing" id="pricing" aria-labelledby="pricing-title">
          <div className="dashboard-pricing__inner wb-shell dashboard-scroll-scene">
            <header className="dashboard-pricing__head dashboard-scroll-copy">
              <div>
                <p className="dashboard-pricing__kicker">Harga akses · Pro/Max aktif 2 bulan</p>
                <h2 id="pricing-title">Pilih akses yang mendukung ritme penjualan Anda.</h2>
              </div>
              <div className="dashboard-pricing__intro">
                <p>
                  Mulai gratis untuk mencoba alur kerja. Pilih Pro atau Max saat Anda membutuhkan kapasitas pencarian
                  yang lebih besar untuk membangun daftar prospek secara konsisten.
                </p>
                <span aria-hidden="true">Geser kartu untuk memilih paket →</span>
              </div>
            </header>

            <div className="pricing-rail" aria-label="Harga lisensi MScrape" tabIndex={0}>
              {pricing.map((plan) => (
                <article className="pricing-card" id={`pricing-${plan.tier.toLowerCase()}`} data-tier={plan.tier.toLowerCase()} key={plan.tier}>
                  <header className="pricing-card__head">
                    <span>{plan.code}</span>
                    {plan.badge ? <span className="pricing-card__badge">{plan.badge}</span> : <span>{plan.term}</span>}
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
              Ingin memilih paket yang tepat? <a href={adminWhatsapp} target="_blank" rel="noreferrer">Chat admin MScrape · 0851 1134 9699 ↗</a>
            </p>
          </div>
        </section>

        <section className="dashboard-essay wb-shell dashboard-scroll-scene" aria-labelledby="essay-title">
          <header className="dashboard-section-head dashboard-scroll-copy">
            <h2 id="essay-title">Satu alat untuk membuka peluang sebelum percakapan dimulai.</h2>
            <p>
              MScrape menyusun titik awal pencarian prospek. Workspace Produksi tetap menjadi tempat Anda menjalankan
              scan, memeriksa hasil, dan menyiapkan daftar untuk ditindaklanjuti.
            </p>
          </header>
          <div className="dashboard-essay__body">
            <p>
              Ketika Anda menjual website, strategi digital, atau layanan pemasaran, bisnis yang belum memiliki website
              dapat menjadi pintu masuk percakapan yang relevan. Masukkan niche dan wilayah untuk mulai memetakan peluang lokal.
            </p>
            <p>
              Data yang ditampilkan mengikuti hasil yang tersedia dari sumber: nama, alamat, telepon, email, website,
              rating, jumlah ulasan, koordinat, dan tautan sumber. Transparansi ini membantu Anda menentukan prioritas outreach dengan konteks yang jelas.
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
                      <header className="dashboard-process__head dashboard-scroll-copy">
            <h2 id="process-title">Dari pencarian lokal ke peluang penjualan.</h2>
              <p>
                Tiga langkah sederhana menjaga fokus Anda: temukan bisnis yang relevan, pilah berdasarkan konteks,
                lalu bawa daftar pilihan ke proses tindak lanjut.
              </p>
            </header>
            <ol className="process-track dashboard-scroll-list">
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
          <header className="dashboard-section-head dashboard-section-head--compact dashboard-scroll-copy">
            <h2 id="capture-title">Workspace yang dibuat untuk mempercepat tindak lanjut.</h2>
            <p>
              Satu tampilan Produksi memperlihatkan alur dari konfigurasi pencarian sampai daftar prospek siap diperiksa.
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
                <li><span>1</span> Tentukan pasar yang ingin Anda jangkau melalui niche dan wilayah.</li>
                <li><span>2</span> Baca status scan serta data yang tersedia pada konteks yang sama.</li>
                <li><span>3</span> Filter hasil dan ekspor daftar pilihan untuk proses outreach.</li>
              </ol>
            </figcaption>
          </figure>
        </section>

        <section className="dashboard-spec wb-shell dashboard-scroll-scene" aria-labelledby="spec-title">
          <header className="dashboard-section-head dashboard-section-head--compact dashboard-scroll-copy">
            <h2 id="spec-title">Nilai yang Anda bawa ke proses penjualan.</h2>
            <p>Setiap bagian dirancang untuk membantu Anda bergerak dari pencarian lokal menuju daftar prospek yang lebih terarah.</p>
          </header>
          <div className="spec-table-wrap">
            <table className="dashboard-spec__table">
              <caption className="sr-only">Manfaat dan perilaku MScrape</caption>
              <thead>
                <tr><th>Bagian</th><th>Manfaat</th><th>Untuk Anda</th></tr>
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

    </>
  );
}
