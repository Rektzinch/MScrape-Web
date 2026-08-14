import Image from "next/image";
import Link from "next/link";
import { TierCheckLink } from "./tier-check-link";

type AppHeaderProps = {
  current: "dashboard" | "production";
};

export function AppHeader({ current }: AppHeaderProps) {
  const onDashboard = current === "dashboard";
  const destination = onDashboard ? "/produksi" : "/dashboard";
  const label = onDashboard ? "Buka halaman Produksi" : "Kembali ke Dashboard";

  return (
    <header className="app-header">
      <div className="app-header__inner wb-shell">
        <Link className="app-brand" href="/dashboard" aria-label="MScrape — kembali ke Dashboard">
          <Image className="app-brand__logo" src="/media/mscrape-logo.png" alt="MScrape" width={2172} height={724} priority />
        </Link>
        {onDashboard ? (
          <TierCheckLink className="page-switch" href={destination}>
            Buka Produksi <span aria-hidden="true">↗</span>
          </TierCheckLink>
        ) : (
          <Link className="page-switch" href={destination} aria-label={label}>
            Lihat Dashboard <span aria-hidden="true">↙</span>
          </Link>
        )}
      </div>
    </header>
  );
}
