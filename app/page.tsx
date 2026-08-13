import { ScrapeConsole } from "./_components/scrape-console";

const decisions = [
  ["Target", "Filter bawaan menampilkan bisnis yang belum memiliki website."],
  ["Kontak", "Telepon dan email ditampilkan hanya ketika sumber mengembalikannya."],
  ["Ekspor", "CSV mengikuti filter aktif, memakai kolom tetap, dan aman dibuka di spreadsheet."],
];

export default function Home() {
  return (
    <main>
      <header className="nav shell" aria-label="Navigasi utama">
        <div className="nav__inner">
          <a className="wordmark" href="#top" aria-label="MScrape, kembali ke awal">
            M/SC
          </a>
          <a className="nav__action" href="#scanner">Mulai scan <span aria-hidden="true">↓</span></a>
        </div>
      </header>

      <section className="scanner-stage shell" id="top">
        <ScrapeConsole />
      </section>

      <section className="decision-band shell" aria-labelledby="decision-title">
        <div className="decision-band__intro">
          <h2 id="decision-title">Dari hasil mentah menjadi daftar tindak lanjut.</h2>
          <p>
            Tidak ada skor prospek buatan. Urutan hanya mendahulukan baris yang memiliki email,
            lalu nama bisnis agar pemeriksaan berikutnya lebih cepat.
          </p>
        </div>
        <dl className="decision-list">
          {decisions.map(([title, copy]) => (
            <div key={title}>
              <dt>{title}</dt>
              <p>{copy}</p>
            </div>
          ))}
        </dl>
      </section>

      <section className="api-band shell" id="api" aria-labelledby="api-title">
        <div className="api-band__copy">
          <h2 id="api-title">Request baru. Data yang dikembalikan saat itu.</h2>
          <p>
            Route server meminta Google Maps tanpa cache. Bila sumber tidak memberi website,
            telepon, atau email, kolom dibiarkan kosong—tidak diisi dari data contoh.
          </p>
          <a className="text-link" href="https://github.com/Rektzinch/MScrape-Web">
            Periksa source frontend <span aria-hidden="true">↗</span>
          </a>
        </div>
        <dl className="api-spec">
          <div><dt>Sumber</dt><dd>Google Maps live</dd></div>
          <div><dt>Cache</dt><dd>no-store</dd></div>
          <div><dt>Kapasitas</dt><dd>hingga 100 hasil per request</dd></div>
          <div><dt>Data buatan</dt><dd>tidak digunakan</dd></div>
        </dl>
      </section>

      <footer className="footer shell">
        <a className="wordmark" href="#top">M/SC</a>
        <p>Google Maps live · tanpa data demo · open source</p>
        <a href="https://github.com/Rektzinch/MScrape-Web">GitHub ↗</a>
      </footer>
    </main>
  );
}
