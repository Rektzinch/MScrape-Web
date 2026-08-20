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
          <span className="ms-wordmark__mark" aria-hidden="true">M</span>
          <span className="ms-wordmark__name">MScrape</span>
        </Link>
        <nav className="ms-header__nav" aria-label="Navigasi utama">
          <Link href="/#cara-kerja">Cara kerja</Link>
          <Link href="/#data">Data</Link>
          <Link href="/#pricing">Harga</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="ms-header__actions">
          {current === "production" ? (
            <span className="ms-header__current"><span aria-hidden="true" /> Workspace aktif</span>
          ) : (
            <TierCheckLink className="ms-header__production" href="/produksi">Buka Produksi <span aria-hidden="true">↗</span></TierCheckLink>
          )}
        </div>
        <AppMenu current={current} />
      </div>
    </header>
  );
}
