const promises = [
  {
    code: "01",
    title: "Query yang terarah",
    detail: "Gabungkan niche dan wilayah dalam satu instruksi yang jelas—dari tingkat kota sampai kecamatan pada paket yang mendukung.",
  },
  {
    code: "02",
    title: "Field yang berguna",
    detail: "Nama, alamat, telepon, website, rating, ulasan, koordinat, dan email ditampilkan ketika tersedia pada sumber.",
  },
  {
    code: "03",
    title: "Tanpa data karangan",
    detail: "MScrape tidak menebak kontak atau website. Field yang tidak ditemukan tetap jujur ditandai sebagai tidak tersedia.",
  },
  {
    code: "04",
    title: "Siap ditindaklanjuti",
    detail: "Saring hasil lalu ekspor ke CSV, TXT, JSON, atau format yang siap dibuka di Google Sheets.",
  },
] as const;

const audiences = ["Sales dan agen", "Freelancer digital", "Peneliti pasar", "Pemilik usaha"] as const;

const adminWhatsapp = "https://wa.me/6285111349699";

const pricing = [
  {
    tier: "Free",
    price: "Rp0",
    term: "selamanya",
    scans: "10 scan",
    results: "10 bisnis / scan",
    cooldown: "Jeda 1 jam",
    cta: "Mulai Free",
    href: "/produksi",
    external: false,
    badge: null,
  },
  {
    tier: "Pro",
    price: "Rp24.999",
    term: "2 bulan",
    scans: "500 scan",
    results: "250 bisnis / scan",
    cooldown: "Tanpa jeda",
    cta: "Pilih Pro",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Pro 2 bulan seharga Rp24.999.")}`,
    external: true,
    badge: "Pilihan populer",
  },
  {
    tier: "Max",
    price: "Rp149.000",
    term: "2 bulan",
    scans: "1.500 scan",
    results: "500 bisnis / scan",
    cooldown: "Tanpa jeda",
    cta: "Pilih Max",
    href: `${adminWhatsapp}?text=${encodeURIComponent("Halo admin MScrape, saya ingin membeli lisensi Max 2 bulan seharga Rp149.000.")}`,
    external: true,
    badge: null,
  },
] as const;

export function HomeDashboardContent() {
  return (
    <>
      <section className="ms-promises wb-shell" id="cara-kerja" aria-labelledby="promises-title">
        <header className="ms-section-intro">
          <p>01 / Prinsip kerja</p>
          <h2 id="promises-title">Pencarian lokal yang<br />berakhir sebagai data.</h2>
          <span>Empat prinsip yang menjaga setiap scan tetap berguna dan bisa dipercaya.</span>
        </header>
        <ol className="ms-promise-list">
          {promises.map((item) => (
            <li key={item.code}>
              <span>{item.code}</span>
              <h3>{item.title}</h3>
              <p>{item.detail}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="ms-pricing wb-shell" id="pricing" aria-labelledby="pricing-title">
        <header className="ms-section-intro">
          <p>02 / Pilih kapasitas</p>
          <h2 id="pricing-title">Harga yang terbaca.<br />Batas yang transparan.</h2>
          <span>Satu pencarian memakai satu scan. Tidak ada perhitungan tersembunyi.</span>
        </header>

        <nav className="ms-plan-nav" aria-label="Pilih kartu paket">
          <div>
            {pricing.map((plan, index) => (
              <a href={`#pricing-${plan.tier.toLowerCase()}`} key={plan.tier}><span>0{index + 1}</span>{plan.tier}</a>
            ))}
          </div>
          <p><span>Swipe</span>Geser kartu <b aria-hidden="true">→</b></p>
        </nav>

        <div
          className="ms-plan-list"
          role="region"
          aria-roledescription="carousel"
          aria-label="Harga lisensi MScrape"
          tabIndex={0}
        >
          {pricing.map((plan) => (
            <article className="ms-plan" id={`pricing-${plan.tier.toLowerCase()}`} data-tier={plan.tier.toLowerCase()} key={plan.tier}>
              <header className="ms-plan__head">
                <span>{plan.tier}</span>
                {plan.badge ? <span className="ms-plan__badge">{plan.badge}</span> : null}
              </header>
              <div className="ms-plan__title"><h3>{plan.price}</h3><p>{plan.term}</p></div>
              <dl className="ms-plan__facts">
                <div><dt>Total</dt><dd>{plan.scans}</dd></div>
                <div><dt>Kapasitas</dt><dd>{plan.results}</dd></div>
                <div><dt>Tempo</dt><dd>{plan.cooldown}</dd></div>
              </dl>
              <a
                className="ms-plan__cta"
                href={plan.href}
                data-analytics-cta={`pricing_${plan.tier.toLowerCase()}`}
                {...(plan.external ? { target: "_blank", rel: "noreferrer" } : {})}
              >
                {plan.cta} <span aria-hidden="true">↗</span>
              </a>
            </article>
          ))}
        </div>
      </section>

      <section className="ms-audience wb-shell" aria-labelledby="audience-title">
        <p>03 / Dibangun untuk pekerjaan nyata</p>
        <h2 id="audience-title">Temukan bahannya.<br />Tentukan langkah berikutnya.</h2>
        <div className="ms-audience__roles" aria-label="Pengguna MScrape">
          {audiences.map((audience, index) => <span key={audience}><i>0{index + 1}</i>{audience}</span>)}
        </div>
      </section>
    </>
  );
}
