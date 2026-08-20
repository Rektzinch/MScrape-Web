import Link from "next/link";
import { AppMenu } from "./app-menu";
import { TierCheckLink } from "./tier-check-link";

type AppHeaderProps = {
  current: "production" | "info";
};

export function AppHeader({ current }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__inner wb-shell">
        <Link className="app-brand" href="/" aria-label="MScrape — kembali ke Beranda">
          <span className="app-brand__mark" aria-hidden="true">M</span>
          <span className="app-brand__name">MScrape</span>
        </Link>
        <nav className="app-header__nav" aria-label="Navigasi utama">
          <Link href="/#cara-kerja">Cara kerja</Link>
          <Link href="/#data">Data</Link>
          <Link href="/#pricing">Harga</Link>
          <Link href="/#faq">FAQ</Link>
        </nav>
        <div className="app-header__actions">
          {current === "production" ? (
            <span className="app-header__current"><span aria-hidden="true" /> Workspace aktif</span>
          ) : (
            <TierCheckLink className="app-header__production" href="/produksi">Buka Produksi <span aria-hidden="true">↗</span></TierCheckLink>
          )}
        </div>
        <AppMenu current={current} />
      </div>
    </header>
  );
}
