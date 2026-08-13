import { ScrapeConsole } from "./_components/scrape-console";

const workflow = [
  ["Atur", "Masukkan niche, kota, negara, bahasa, dan kedalaman pencarian."],
  ["Kirim", "Frontend membuat job pada backend scraper yang kamu host sendiri."],
  ["Pantau", "Status dibaca langsung dari API sampai job selesai atau gagal."],
  ["Ekspor", "Unduh hasil asli sebagai CSV; tidak ada baris yang dibuat di browser."],
];

export default function Home() {
  return (
    <main>
      <header className="nav" aria-label="Navigasi utama">
        <div className="nav__inner">
          <a className="wordmark" href="#top" aria-label="MScrape, kembali ke awal">
            m/scrape<span className="period" aria-hidden="true" />
          </a>
          <nav className="nav__center" aria-label="Bagian halaman">
            <a href="#console">Konsol</a>
            <a href="#workflow">Alur</a>
            <a href="#api">API</a>
          </nav>
          <a className="nav__action" href="#console">Buka konsol <span aria-hidden="true">↘</span></a>
        </div>
      </header>

      <section className="hero shell" id="top">
        <div className="rails" aria-hidden="true" />
        <div className="hero__content">
          <p className="hero__meta">Google Maps lead workspace · open source</p>
          <h1>temukan lead lokal<span className="period" aria-hidden="true" /></h1>
          <p className="hero__lede">
            Masukkan niche dan wilayah. MScrape mengirim job ke backend yang kamu host,
            lalu menampilkan hanya data yang benar-benar dikembalikan API.
          </p>
          <div className="hero__actions">
            <a className="button button--primary" href="#console">Mulai pencarian <span aria-hidden="true">↘</span></a>
            <a className="text-link" href="https://github.com/Rektzinch/MScrape-Web">Lihat kode <span aria-hidden="true">↗</span></a>
          </div>
        </div>
        <div className="hero__object" aria-label="Status alur MScrape">
          <div className="object-row"><span>Input</span><strong>menunggu</strong></div>
          <div className="object-row"><span>Backend</span><strong>env server</strong></div>
          <div className="object-row"><span>Output</span><strong>API asli</strong></div>
        </div>
      </section>

      <div className="shell shell--section">
        <div className="rails" aria-hidden="true" />
        <ScrapeConsole />
      </div>

      <section className="workflow shell shell--section" id="workflow" aria-labelledby="workflow-title">
        <div className="rails" aria-hidden="true" />
        <div className="section-head">
          <h2 id="workflow-title">empat langkah. satu sumber data.</h2>
          <p>Alur sengaja transparan agar data asli dan status backend tidak tertutup animasi atau angka pemasaran.</p>
        </div>
        <ol className="workflow-list">
          {workflow.map(([title, copy], index) => (
            <li key={title}>
              <span className="workflow-list__index">{String(index + 1).padStart(2, "0")}</span>
              <h3>{title}</h3>
              <p>{copy}</p>
              <span className="border-arrow" aria-hidden="true" />
            </li>
          ))}
        </ol>
      </section>

      <section className="api-band shell shell--section" id="api" aria-labelledby="api-title">
        <div className="rails" aria-hidden="true" />
        <div className="api-band__copy">
          <h2 id="api-title">REST API, bukan simulasi.</h2>
          <p>
            Frontend ini memakai kontrak API dari <code>gosom/google-maps-scraper</code>:
            buat job, baca status, ambil hasil. URL dan API key tinggal di server Vercel.
          </p>
          <a className="text-link" href="https://github.com/gosom/google-maps-scraper">
            Buka repositori API <span aria-hidden="true">↗</span>
          </a>
        </div>
        <dl className="api-spec">
          <div><dt>Base URL</dt><dd>MAPS_API_BASE_URL</dd></div>
          <div><dt>Mode</dt><dd>web / queue</dd></div>
          <div><dt>Credential</dt><dd>server-only</dd></div>
          <div><dt>Fallback data</dt><dd>tidak ada</dd></div>
        </dl>
      </section>

      <section className="plate" aria-labelledby="plate-title">
        <div className="plate__inner shell">
          <h2 id="plate-title">mesin mencari. kamu memilih.</h2>
          <a className="plate__link" href="#console">Buka konsol <span aria-hidden="true">↗</span></a>
        </div>
      </section>

      <footer className="footer shell">
        <p className="footer__statement">prospek nyata, tanpa spreadsheet berantakan.</p>
        <div className="footer__meta">
          <a className="wordmark" href="#top">m/scrape<span className="period" aria-hidden="true" /></a>
          <div className="footer__links">
            <a href="https://github.com/Indra-cahya/MScrape">Repo sumber</a>
            <a href="https://github.com/Rektzinch/MScrape-Web">Frontend</a>
            <a href="https://github.com/gosom/google-maps-scraper">API</a>
          </div>
          <span>Open source · 2026</span>
        </div>
      </footer>
    </main>
  );
}
