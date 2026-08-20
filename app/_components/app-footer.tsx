import Link from "next/link";
import type { Locale } from "@/lib/locale";
import { localeHref } from "@/lib/locale";

export function AppFooter({ locale = "id" }: { locale?: Locale }) {
  const en = locale === "en";
  return (
    <footer className="ms-footer wb-shell">
      <div className="ms-footer__line">
        <Link className="ms-footer__brand" href={localeHref(locale, "/")} aria-label={en ? "MScrape — Home" : "MScrape — Beranda"}>
          <span>MSCRAPE</span><i aria-hidden="true" />
        </Link>
        <p>Local business intelligence<br />{en ? "for the Indonesian market." : "untuk pasar Indonesia."}</p>
        <nav className="ms-footer__links" aria-label={en ? "MScrape information" : "Informasi MScrape"}>
          <Link href={localeHref(locale, "/tentang-mscrape")}>{en ? "About" : "Tentang"}</Link>
          <Link href={localeHref(locale, "/syarat-ketentuan")}>{en ? "Terms" : "Ketentuan"}</Link>
          <Link href={localeHref(locale, "/developer")}>Developer</Link>
        </nav>
      </div>
    </footer>
  );
}
