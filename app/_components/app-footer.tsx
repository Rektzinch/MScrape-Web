import Image from "next/image";
import Link from "next/link";

export function AppFooter() {
  return (
    <footer className="app-footer wb-shell">
      <div className="app-footer__line">
        <Link className="app-footer__brand" href="/" aria-label="MScrape — Beranda">
          <Image className="app-footer__logo" src="/media/mscrape-logo.png" alt="MScrape" width={2172} height={724} />
        </Link>
        <p>Data bisnis untuk riset dan tindak lanjut.</p>
        <nav className="app-footer__links" aria-label="Informasi MScrape">
          <Link href="/tentang-mscrape">Tentang</Link>
          <Link href="/syarat-ketentuan">Ketentuan</Link>
          <Link href="/developer">Developer</Link>
        </nav>
      </div>
    </footer>
  );
}
