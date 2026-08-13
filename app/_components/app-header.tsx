import Link from "next/link";

type AppHeaderProps = {
  current: "dashboard" | "production";
};

export function AppHeader({ current }: AppHeaderProps) {
  const onDashboard = current === "dashboard";

  return (
    <header className="app-header">
      <div className="app-header__inner wb-shell">
        <span className="app-wordmark" aria-label="MScrape">
          MSCRAPE<span aria-hidden="true">/</span>
        </span>
        <Link
          className="page-switch"
          href={onDashboard ? "/produksi" : "/dashboard"}
          aria-label={onDashboard ? "Buka halaman Produksi" : "Kembali ke Dashboard"}
        >
          {onDashboard ? "Buka Produksi" : "Lihat Dashboard"}
          <span aria-hidden="true">{onDashboard ? "↗" : "↙"}</span>
        </Link>
      </div>
    </header>
  );
}
