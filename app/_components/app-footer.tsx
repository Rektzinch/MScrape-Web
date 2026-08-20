import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="app-footer wb-shell">
      <div className="app-footer__line">
        <Link className="app-footer__brand" href="/" aria-label="MScrape — Beranda">
          <span className="app-footer__mark" aria-hidden="true">M</span>
          <span>MScrape</span>
        </Link>
        <p>Business discovery workspace<br />untuk pasar lokal Indonesia.</p>
        <nav className="app-footer__links" aria-label="Informasi MScrape">
          <Link href="/tentang-mscrape">Tentang</Link>
          <Link href="/syarat-ketentuan">Ketentuan</Link>
          <Link href="/developer">Developer</Link>
        </nav>
        <p className="app-footer__edition">MS / 26</p>
      </div>
    </footer>
  );
}
