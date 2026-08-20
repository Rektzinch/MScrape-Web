const promises = [
  {
    code: "01",
    title: "Cari yang Anda maksud",
    detail: "Gabungkan niche dan wilayah dalam satu pencarian yang jelas—dari kota sampai kecamatan untuk paket yang mendukung.",
  },
  {
    code: "02",
    title: "Baca data sumber",
    detail: "Nama, alamat, telepon, website, rating, ulasan, koordinat, dan email ditampilkan saat memang tersedia.",
  },
  {
    code: "03",
    title: "Kosong berarti kosong",
    detail: "MScrape tidak menebak kontak atau website. Data yang tidak ditemukan tetap ditandai sebagai tidak tersedia.",
  },
  {
    code: "04",
    title: "Bawa ke alur kerja Anda",
    detail: "Saring hasil lalu ekspor ke CSV, TXT, JSON, atau format yang siap dibuka di Google Sheets.",
  },
] as const;

const workflow = [
  ["Query", "Klinik gigi", "Niche bisnis"],
  ["Lokasi", "Makassar", "Kota / kabupaten"],
  ["Cakupan", "Kota", "Bisa sampai kecamatan"],
  ["Target", "100 bisnis", "Satu scan"],
] as const;

const dataFields = [
  ["01", "Identitas", "Nama bisnis · kategori"],
  ["02", "Lokasi", "Alamat · koordinat · Maps"],
  ["03", "Kontak", "Telepon · email bila tersedia"],
  ["04", "Digital", "Website · domain"],
  ["05", "Reputasi", "Rating · jumlah ulasan"],
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
          <p>Yang Anda dapat</p>
          <h2 id="promises-title">Dari pencarian lokal<br />menjadi data yang siap dipakai.</h2>
          <span>Empat hal yang kami jaga di setiap scan.</span>
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

      <section className="ms-workflow" id="data" aria-labelledby="workflow-title">
        <div className="ms-workflow__inner wb-shell">
          <header className="ms-section-intro ms-section-intro--inverse">
            <p>Alur produk</p>
            <h2 id="workflow-title">Satu query masuk.<br />Dataset yang jujur keluar.</h2>
            <span>Permukaan kerja dibuat untuk pencarian, bukan untuk pajangan.</span>
          </header>

          <div className="ms-workflow__surface">
            <div className="ms-workflow__query">
              <div className="ms-surface-label"><span>Query / 001</span><i>Siap</i></div>
              <div className="ms-query-line"><span aria-hidden="true">›</span><strong>Klinik gigi di Makassar</strong></div>
              <dl>
                {workflow.map(([term, value, note]) => (
                  <div key={term}><dt>{term}</dt><dd>{value}</dd><span>{note}</span></div>
                ))}
              </dl>
              <div className="ms-run-line"><span>Gunakan 1 scan</span><b>Jalankan pencarian ↗</b></div>
            </div>

            <div className="ms-workflow__schema">
              <div className="ms-surface-label"><span>Dataset / tersedia</span><i>5 kelompok data</i></div>
              <div className="ms-schema-head"><span>Field</span><span>Isi</span></div>
              {dataFields.map(([code, name, detail]) => (
                <div className="ms-schema-row" key={code}><span>{code}</span><strong>{name}</strong><p>{detail}</p></div>
              ))}
              <p className="ms-schema-note"><span aria-hidden="true">*</span> Kolom kosong tidak diisi dengan perkiraan.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="ms-pricing wb-shell" id="pricing" aria-labelledby="pricing-title">
        <header className="ms-section-intro">
          <p>Harga</p>
          <h2 id="pricing-title">Kapasitas yang bisa<br />dibaca dalam sekali lihat.</h2>
          <span>Satu pencarian memakai satu scan.</span>
        </header>

        <div className="ms-plan-list" aria-label="Harga lisensi MScrape">
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
        <p>Untuk kerja yang dimulai dari pasar lokal</p>
        <h2 id="audience-title">Temukan bahannya.<br />Anda yang menentukan langkah berikutnya.</h2>
        <div className="ms-audience__roles" aria-label="Pengguna MScrape">
          {audiences.map((audience, index) => <span key={audience}><i>0{index + 1}</i>{audience}</span>)}
        </div>
      </section>
    </>
  );
}
