import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { localeAlternateHref, localeHref } from "@/lib/locale";
import { AppMenu } from "./app-menu";
import { TierCheckLink } from "./tier-check-link";

type AppHeaderProps = {
  current: "production" | "info";
  locale?: Locale;
  currentPath?: string;
};

export function AppHeader({ current, locale = "id", currentPath = "/" }: AppHeaderProps) {
  const en = locale === "en";
  const alternateHref = localeAlternateHref(locale, currentPath);

  return (
    <header className="ms-header">
      <div className="ms-header__inner wb-shell">
        <Link className="ms-wordmark" href={localeHref(locale, "/")} aria-label={en ? "MScrape — back to Home" : "MScrape — kembali ke Beranda"}>
          <span className="ms-wordmark__name">MSCRAPE</span>
          <span className="ms-wordmark__signal" aria-hidden="true" />
        </Link>
        <nav className="ms-header__nav" aria-label={en ? "Primary navigation" : "Navigasi utama"}>
          <Link href={localeHref(locale, "/#cara-kerja")}><span>01</span>{en ? "How it works" : "Cara kerja"}</Link>
          <Link href={localeHref(locale, "/#pricing")}><span>02</span>{en ? "Pricing" : "Harga"}</Link>
          <Link href={localeHref(locale, "/#faq")}><span>03</span>FAQ</Link>
        </nav>
        <div className="ms-header__actions">
          {current === "production" ? (
            <span className="ms-header__current"><span aria-hidden="true" /> {en ? "Workspace active" : "Workspace aktif"}</span>
          ) : (
            <TierCheckLink className="ms-header__production" href={localeHref(locale, "/produksi")}>{en ? "Open workspace" : "Buka workspace"} <span aria-hidden="true">↗</span></TierCheckLink>
          )}
        </div>
        <nav className="ms-locale-switch" aria-label={en ? "Language" : "Bahasa"}>
          <Link href={en ? alternateHref : currentPath} hrefLang="id" aria-current={!en ? "page" : undefined}>ID</Link>
          <Link href={en ? currentPath : alternateHref} hrefLang="en" aria-current={en ? "page" : undefined}>EN</Link>
        </nav>
        <AppMenu current={current} locale={locale} />
      </div>
    </header>
  );
}
