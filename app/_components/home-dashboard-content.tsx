const processSteps = [
  {
    number: "01",
    title: "Masukkan niche",
    detail: "Tulis jenis bisnis yang ingin dicari, misalnya klinik gigi, toko bangunan, atau bengkel motor.",
  },
  {
    number: "02",
    title: "Pilih wilayah",
    detail: "Tentukan kota atau kabupaten. Paket Pro dan Max dapat mempersempit pencarian sampai kecamatan.",
  },
  {
    number: "03",
    title: "Tinjau dan ekspor",
    detail: "Periksa hasil, filter bisnis berdasarkan website atau kontak, lalu unduh daftar yang dipilih.",
  },
] as const;

const dataFields = [
  ["Identitas", "Nama bisnis dan kategori"],
  ["Lokasi", "Alamat, koordinat, dan tautan Maps"],
  ["Kontak", "Telepon dan email bila tersedia"],
  ["Kehadiran digital", "Website dan domain"],
  ["Reputasi", "Rating dan jumlah ulasan"],
  ["Transparansi", "Kolom kosong tidak diisi perkiraan"],
] as const;

const audiences = [
  ["Sales dan agen", "Menyusun daftar bisnis lokal sebelum riset dan percakapan penawaran."],
  ["Freelancer digital", "Mencari bisnis di wilayah target untuk layanan website, desain, atau pemasaran."],
  ["Peneliti pasar", "Melihat lanskap niche dan lokasi sebelum menentukan segmen yang perlu ditinjau."],
  ["Pemilik usaha", "Memetakan calon mitra, pemasok, kompetitor, atau cabang bisnis di area tertentu."],
] as const;

const adminWhatsapp = "https://wa.me/6285111349699";

const pricing = [
  {
    tier: "Free",
    price: "Rp0",
    term: "selamanya",
    scans: "10 scan",
    results: "Maks. 10 bisnis / scan",
    cooldown: "Cooldown 1 jam",
    cta: "Mulai Free →",
    href: "/produksi",
    external: false,
    badge: null,
  },
  {
    tier: "Pro",
    price: "Rp24.999",
    term: "/ 2 bulan",
    scans: "500 scan",
    results: "Maks. 250 bisnis / scan",
    cooldown: "Tanpa cooldown",
    cta: "Pilih Pro ↗",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Pro 2 bulan seharga Rp24.999.")}`,
    external: true,
    badge: "Paling laris",
  },
  {
    tier: "Max",
    price: "Rp149.000",
    term: "/ 2 bulan",
    scans: "1.500 scan",
    results: "Maks. 500 bisnis / scan",
    cooldown: "Tanpa cooldown",
    cta: "Pilih Max ↗",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Max 2 bulan seharga Rp149.000.")}`,
    external: true,
    badge: null,
  },
] as const;

export function HomeDashboardContent() {
  return (
    <>
      <section className="dashboard-process" id="cara-kerja" aria-labelledby="process-title">
        <div className="dashboard-process__inner wb-shell">
          <header className="dashboard-process__head">
            <h2 id="process-title">Tiga langkah dari pencarian ke daftar kerja.</h2>
            <p>Alurnya tetap pendek: tentukan bisnis, pilih area, lalu periksa hasil yang benar-benar dikembalikan sumber.</p>
          </header>
          <ol className="process-track">
            {processSteps.map((step) => (
              <li key={step.number}>
                <span className="process-track__number" aria-hidden="true">{step.number}</span>
                <div>
                  <h3>{step.title}</h3>
                  <p>{step.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="dashboard-data wb-shell" aria-labelledby="data-title">
        <header className="dashboard-section-head">
          <h2 id="data-title">Data yang tersedia, tanpa menebak kolom kosong.</h2>
          <p>Setiap scan menyusun informasi bisnis yang benar-benar tersedia pada sumber ke dalam format yang mudah ditinjau.</p>
        </header>
        <dl className="data-ledger">
          {dataFields.map(([term, detail]) => (
            <div key={term}>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="dashboard-pricing" id="pricing" aria-labelledby="pricing-title">
        <div className="dashboard-pricing__inner wb-shell">
          <header className="dashboard-pricing__head">
            <div>
              <h2 id="pricing-title">Pilih jumlah scan, lalu lihat batas hasil per scan.</h2>
            </div>
            <div className="dashboard-pricing__intro">
              <p>Dua angka ini berbeda. Jumlah scan adalah jatah pencarian; batas hasil adalah jumlah maksimal bisnis dalam satu pencarian.</p>
              <span aria-hidden="true">Geser untuk melihat paket →</span>
            </div>
          </header>

          <div className="pricing-rail" aria-label="Harga lisensi MScrape" tabIndex={0}>
            {pricing.map((plan) => (
              <article className="pricing-card" id={`pricing-${plan.tier.toLowerCase()}`} data-tier={plan.tier.toLowerCase()} key={plan.tier}>
                <header className="pricing-card__head">
                  <span>{plan.tier}</span>
                  {plan.badge ? <span className="pricing-card__badge">{plan.badge}</span> : <span>{plan.term}</span>}
                </header>
                <div className="pricing-card__title">
                  <h3>{plan.price}</h3>
                  <p>{plan.term}</p>
                </div>
                <dl className="pricing-card__facts">
                  <div><dt>Jatah pencarian</dt><dd>{plan.scans}</dd></div>
                  <div><dt>Per pencarian</dt><dd>{plan.results}</dd></div>
                  <div><dt>Jeda</dt><dd>{plan.cooldown}</dd></div>
                </dl>
                <a
                  className="pricing-card__cta"
                  href={plan.href}
                  data-analytics-cta={`pricing_${plan.tier.toLowerCase()}`}
                  {...(plan.external ? { target: "_blank", rel: "noreferrer" } : {})}
                >
                  {plan.cta}
                </a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="dashboard-audience wb-shell" aria-labelledby="audience-title">
        <header className="dashboard-section-head">
          <h2 id="audience-title">Untuk orang yang perlu memulai dari data lokal.</h2>
          <p>MScrape membantu menyiapkan bahan riset. Penilaian dan cara menghubungi bisnis tetap berada di tangan Anda.</p>
        </header>
        <div className="audience-ledger">
          {audiences.map(([title, detail]) => (
            <article key={title}>
              <h3>{title}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
