import Image from "next/image";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="dashboard-footer wb-shell app-footer">
      <div className="app-footer__intro">
        <p className="dashboard-footer__statement">Temukan data yang relevan. Lanjutkan dengan keputusan yang tepat.</p>
        <div className="dashboard-footer__meta">
          <div className="app-footer__brand">
            <Image className="app-footer__logo" src="/media/mscrape-logo.png" alt="MScrape" width={2172} height={724} />
          </div>
          <span>MScrape · data bisnis untuk riset, analisis, dan tindak lanjut</span>
        </div>
      </div>
      <nav className="app-footer__links" aria-label="Jelajahi MScrape">
        <div>
          <p>Pelajari</p>
          <Link href="/google-maps-scraper">Google Maps Scraper</Link>
          <Link href="/cari-data-bisnis">Cari Data Bisnis</Link>
          <Link href="/lead-generation">Lead Generation</Link>
          <Link href="/export-google-maps-csv">Ekspor ke CSV</Link>
          <Link href="/cari-bisnis-tanpa-website">Bisnis Tanpa Website</Link>
        </div>
        <div>
          <p>Informasi</p>
          <Link href="/tentang-mscrape">Tentang MScrape</Link>
          <Link href="/syarat-ketentuan">Syarat &amp; Ketentuan</Link>
          <Link href="/developer">Developer</Link>
        </div>
      </nav>
    </footer>
  );
}
