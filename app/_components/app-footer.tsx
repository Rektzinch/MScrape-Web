import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="ms-footer wb-shell">
      <div className="ms-footer__line">
        <Link className="ms-footer__brand" href="/" aria-label="MScrape — Beranda">
          <span className="ms-footer__mark" aria-hidden="true">M</span>
          <span>MScrape</span>
        </Link>
        <p>Business discovery workspace<br />untuk pasar lokal Indonesia.</p>
        <nav className="ms-footer__links" aria-label="Informasi MScrape">
          <Link href="/tentang-mscrape">Tentang</Link>
          <Link href="/syarat-ketentuan">Ketentuan</Link>
          <Link href="/developer">Developer</Link>
        </nav>
      </div>
    </footer>
  );
}
