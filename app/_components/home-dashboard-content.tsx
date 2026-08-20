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
      <section className="ms-process" id="cara-kerja" aria-labelledby="process-title">
        <div className="ms-process__inner wb-shell">
          <header className="ms-process__head">
            <p>Cara kerja</p>
            <h2 id="process-title">Dari pertanyaan<br />menjadi dataset.</h2>
          </header>
          <ol className="ms-steps">
            {processSteps.map((step) => (
              <li key={step.number}>
                <span className="ms-steps__number" aria-hidden="true">{step.number}</span>
                <h3>{step.title}</h3>
                <p>{step.detail}</p>
                <span className="ms-steps__arrow" aria-hidden="true">↘</span>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="ms-data wb-shell" id="data" aria-labelledby="data-title">
        <header className="ms-section-head">
          <p>Data yang tersedia</p>
          <h2 id="data-title">Yang ditemukan.<br /><em>Bukan yang diperkirakan.</em></h2>
          <p className="ms-section-head__aside">Setiap kolom mengikuti data yang tersedia di sumber. Informasi yang tidak ditemukan dibiarkan kosong—tanpa asumsi buatan.</p>
        </header>
        <dl className="ms-data-list">
          {dataFields.map(([term, detail], index) => (
            <div key={term}>
              <span aria-hidden="true">{String(index + 1).padStart(2, "0")}</span>
              <dt>{term}</dt>
              <dd>{detail}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section className="ms-pricing" id="pricing" aria-labelledby="pricing-title">
        <div className="ms-pricing__inner wb-shell">
          <header className="ms-pricing__head">
            <div><p>Harga</p><h2 id="pricing-title">Kapasitas yang jelas.<br />Tanpa hitungan samar.</h2></div>
            <div className="ms-pricing__intro">
              <p>Jumlah scan adalah jatah pencarian. Batas hasil adalah jumlah maksimal bisnis yang diminta dalam satu scan.</p>
            </div>
          </header>

          <div className="ms-plan-list" aria-label="Harga lisensi MScrape">
            {pricing.map((plan) => (
              <article className="ms-plan" id={`pricing-${plan.tier.toLowerCase()}`} data-tier={plan.tier.toLowerCase()} key={plan.tier}>
                <header className="ms-plan__head">
                  <span>{plan.tier}</span>{plan.badge ? <span className="ms-plan__badge">{plan.badge}</span> : null}
                </header>
                <div className="ms-plan__title">
                  <h3>{plan.price}</h3>
                  <p>{plan.term}</p>
                </div>
                <dl className="ms-plan__facts">
                  <div><dt>Total pencarian</dt><dd>{plan.scans}</dd></div>
                  <div><dt>Kapasitas</dt><dd>{plan.results}</dd></div>
                  <div><dt>Jeda</dt><dd>{plan.cooldown}</dd></div>
                </dl>
                <a
                  className="ms-plan__cta"
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

      <section className="ms-audience wb-shell" aria-labelledby="audience-title">
        <header className="ms-section-head">
          <p>Untuk siapa</p>
          <h2 id="audience-title">Dibuat untuk kerja<br />yang dimulai dari lokal.</h2>
          <p className="ms-section-head__aside">MScrape menyiapkan bahan riset. Penilaian dan cara menghubungi bisnis tetap berada di tangan Anda.</p>
        </header>
        <div className="ms-use-list">
          {audiences.map(([title, detail], index) => (
            <article key={title}>
              <span aria-hidden="true">0{index + 1}</span>
              <h3>{title}</h3>
              <p>{detail}</p>
              <b aria-hidden="true">↗</b>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}
