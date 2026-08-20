import type { Locale } from "@/lib/locale";
import { localeHref } from "@/lib/locale";

const promisesId = [
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

const promisesEn = [
  { code: "01", title: "Focused queries", detail: "Combine a niche and region in one clear instruction—from city to subdistrict on supported plans." },
  { code: "02", title: "Useful fields", detail: "Name, address, phone, website, rating, reviews, coordinates, and email are shown when available at the source." },
  { code: "03", title: "No invented data", detail: "MScrape does not guess contacts or websites. Fields that cannot be found remain clearly marked as unavailable." },
  { code: "04", title: "Ready for follow-up", detail: "Filter results, then export to CSV, TXT, JSON, or a format ready to open in Google Sheets." },
] as const;

const audiencesId = ["Sales dan agen", "Freelancer digital", "Peneliti pasar", "Pemilik usaha"] as const;
const audiencesEn = ["Sales teams and agents", "Digital freelancers", "Market researchers", "Business owners"] as const;

const adminWhatsapp = "https://wa.me/6285111349699";

function pricing(locale: Locale) {
  const en = locale === "en";
  return [
  {
    tier: "Free",
    price: "Rp0",
    term: en ? "forever" : "selamanya",
    scans: en ? "10 scans" : "10 scan",
    results: en ? "10 businesses / scan" : "10 bisnis / scan",
    cooldown: en ? "1 hour cooldown" : "Jeda 1 jam",
    cta: en ? "Start Free" : "Mulai Free",
    href: localeHref(locale, "/produksi"),
    external: false,
    badge: null,
  },
  {
    tier: "Pro",
    price: "Rp24.999",
    term: en ? "2 months" : "2 bulan",
    scans: en ? "500 scans" : "500 scan",
    results: en ? "250 businesses / scan" : "250 bisnis / scan",
    cooldown: en ? "No cooldown" : "Tanpa jeda",
    cta: en ? "Choose Pro" : "Pilih Pro",
    href: `${adminWhatsapp}?text=${encodeURIComponent(en ? "Hello MScrape admin, I would like to purchase a 2-month Pro license for Rp24,999." : "Halo admin MScrape, saya ingin membeli lisensi Pro 2 bulan seharga Rp24.999.")}`,
    external: true,
    badge: en ? "Popular choice" : "Pilihan populer",
  },
  {
    tier: "Max",
    price: "Rp149.000",
    term: en ? "2 months" : "2 bulan",
    scans: en ? "1,500 scans" : "1.500 scan",
    results: en ? "500 businesses / scan" : "500 bisnis / scan",
    cooldown: en ? "No cooldown" : "Tanpa jeda",
    cta: en ? "Choose Max" : "Pilih Max",
    href: `${adminWhatsapp}?text=${encodeURIComponent(en ? "Hello MScrape admin, I would like to purchase a 2-month Max license for Rp149,000." : "Halo admin MScrape, saya ingin membeli lisensi Max 2 bulan seharga Rp149.000.")}`,
    external: true,
    badge: null,
  },
] as const;
}

export function HomeDashboardContent({ locale = "id" }: { locale?: Locale }) {
  const en = locale === "en";
  const promises = en ? promisesEn : promisesId;
  const audiences = en ? audiencesEn : audiencesId;
  const plans = pricing(locale);
  return (
    <>
      <section className="ms-promises wb-shell" id="cara-kerja" aria-labelledby="promises-title">
        <header className="ms-section-intro">
          <p>{en ? "01 / Working principles" : "01 / Prinsip kerja"}</p>
          <h2 id="promises-title">{en ? <>Local searches that<br />end as data.</> : <>Pencarian lokal yang<br />berakhir sebagai data.</>}</h2>
          <span>{en ? "Four principles that keep every scan useful and trustworthy." : "Empat prinsip yang menjaga setiap scan tetap berguna dan bisa dipercaya."}</span>
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
          <p>{en ? "02 / Choose capacity" : "02 / Pilih kapasitas"}</p>
          <h2 id="pricing-title">{en ? <>Pricing you can read.<br />Limits you can see.</> : <>Harga yang terbaca.<br />Batas yang transparan.</>}</h2>
          <span>{en ? "One search uses one scan. No hidden calculations." : "Satu pencarian memakai satu scan. Tidak ada perhitungan tersembunyi."}</span>
        </header>

        <nav className="ms-plan-nav" aria-label={en ? "Choose a plan card" : "Pilih kartu paket"}>
          <div>
            {plans.map((plan, index) => (
              <a href={`#pricing-${plan.tier.toLowerCase()}`} key={plan.tier}><span>0{index + 1}</span>{plan.tier}</a>
            ))}
          </div>
          <p><span>Swipe</span>{en ? "Slide cards" : "Geser kartu"} <b aria-hidden="true">→</b></p>
        </nav>

        <div
          className="ms-plan-list"
          role="region"
          aria-roledescription="carousel"
          aria-label={en ? "MScrape license pricing" : "Harga lisensi MScrape"}
          tabIndex={0}
        >
          {plans.map((plan) => (
            <article className="ms-plan" id={`pricing-${plan.tier.toLowerCase()}`} data-tier={plan.tier.toLowerCase()} key={plan.tier}>
              <header className="ms-plan__head">
                <span>{plan.tier}</span>
                {plan.badge ? <span className="ms-plan__badge">{plan.badge}</span> : null}
              </header>
              <div className="ms-plan__title"><h3>{plan.price}</h3><p>{plan.term}</p></div>
              <dl className="ms-plan__facts">
                <div><dt>Total</dt><dd>{plan.scans}</dd></div>
                <div><dt>{en ? "Capacity" : "Kapasitas"}</dt><dd>{plan.results}</dd></div>
                <div><dt>{en ? "Pace" : "Tempo"}</dt><dd>{plan.cooldown}</dd></div>
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
        <p>{en ? "03 / Built for real work" : "03 / Dibangun untuk pekerjaan nyata"}</p>
        <h2 id="audience-title">{en ? <>Find the material.<br />Choose the next move.</> : <>Temukan bahannya.<br />Tentukan langkah berikutnya.</>}</h2>
        <div className="ms-audience__roles" aria-label={en ? "MScrape users" : "Pengguna MScrape"}>
          {audiences.map((audience, index) => <span key={audience}><i>0{index + 1}</i>{audience}</span>)}
        </div>
      </section>
    </>
  );
}
