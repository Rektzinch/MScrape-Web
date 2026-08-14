import Image from "next/image";
import Link from "next/link";
import { AppMenu } from "./app-menu";

type AppHeaderProps = {
  current: "dashboard" | "production";
};

export function AppHeader({ current }: AppHeaderProps) {
  return (
    <header className="app-header">
      <div className="app-header__inner wb-shell">
        <Link className="app-brand" href="/dashboard" aria-label="MScrape — kembali ke Dashboard">
          <Image className="app-brand__logo" src="/media/mscrape-logo.png" alt="MScrape" width={2172} height={724} priority />
        </Link>
        <AppMenu current={current} />
      </div>
    </header>
  );
}
