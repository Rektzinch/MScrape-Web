import Link from "next/link";
import { AppMenu } from "./app-menu";
import { TierCheckLink } from "./tier-check-link";

type AppHeaderProps = {
  current: "production" | "info";
};

export function AppHeader({ current }: AppHeaderProps) {
  return (
    <header className="ms-header">
      <div className="ms-header__inner wb-shell">
        <Link className="ms-wordmark" href="/" aria-label="MScrape — kembali ke Beranda">
          <span className="ms-wordmark__name">MSCRAPE</span>
          <span className="ms-wordmark__signal" aria-hidden="true" />
        </Link>
        <nav className="ms-header__nav" aria-label="Navigasi utama">
          <Link href="/#cara-kerja"><span>01</span>Cara kerja</Link>
          <Link href="/#pricing"><span>02</span>Harga</Link>
          <Link href="/#faq"><span>03</span>FAQ</Link>
        </nav>
        <div className="ms-header__actions">
          {current === "production" ? (
            <span className="ms-header__current"><span aria-hidden="true" /> Workspace aktif</span>
          ) : (
            <TierCheckLink className="ms-header__production" href="/produksi">Buka workspace <span aria-hidden="true">↗</span></TierCheckLink>
          )}
        </div>
        <AppMenu current={current} />
      </div>
    </header>
  );
}
