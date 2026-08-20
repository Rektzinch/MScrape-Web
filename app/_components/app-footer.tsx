import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="ms-footer wb-shell">
      <div className="ms-footer__line">
        <Link className="ms-footer__brand" href="/" aria-label="MScrape — Beranda">
          <span>MSCRAPE</span><i aria-hidden="true" />
        </Link>
        <p>Local business intelligence<br />untuk pasar Indonesia.</p>
        <nav className="ms-footer__links" aria-label="Informasi MScrape">
          <Link href="/tentang-mscrape">Tentang</Link>
          <Link href="/syarat-ketentuan">Ketentuan</Link>
          <Link href="/developer">Developer</Link>
        </nav>
      </div>
    </footer>
  );
}
