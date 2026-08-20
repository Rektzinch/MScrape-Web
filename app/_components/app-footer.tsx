import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="ms-footer wb-shell">
      <div className="ms-footer__line">
        <Link className="ms-footer__brand" href="/" aria-label="MScrape — Beranda">
          <span>mscrape</span><i aria-hidden="true" />
        </Link>
        <p>Data bisnis lokal untuk riset<br />dan tindak lanjut yang lebih tepat.</p>
        <nav className="ms-footer__links" aria-label="Informasi MScrape">
          <Link href="/tentang-mscrape">Tentang</Link>
          <Link href="/syarat-ketentuan">Ketentuan</Link>
          <Link href="/developer">Developer</Link>
        </nav>
      </div>
    </footer>
  );
}
