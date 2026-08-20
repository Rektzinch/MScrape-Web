"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import type { Locale } from "@/lib/locale";
import { localeHref } from "@/lib/locale";
import { TierCheckLink } from "./tier-check-link";

type AppMenuProps = {
  current: "production" | "info";
  locale?: Locale;
};

export function AppMenu({ current, locale = "id" }: AppMenuProps) {
  const [open, setOpen] = useState(false);
  const en = locale === "en";

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [open]);

  const closeMenu = () => setOpen(false);

  return (
    <>
      <button
        className="ms-menu-trigger"
        type="button"
        aria-label={en ? "Open menu" : "Buka menu"}
        aria-expanded={open}
        aria-controls="ms-drawer"
        onClick={() => setOpen(true)}
      >
        <span>{en ? "Menu" : "Menu"}</span>
        <b aria-hidden="true">+</b>
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div className="ms-menu-layer" onClick={closeMenu}>
          <aside id="ms-drawer" className="ms-drawer" aria-label="MScrape menu" onClick={(event) => event.stopPropagation()}>
            <div className="ms-drawer__top">
              <p>mscrape</p>
              <button className="ms-drawer__close" type="button" onClick={closeMenu} aria-label={en ? "Close menu" : "Tutup menu"}>×</button>
            </div>

            <nav className="ms-drawer__nav" aria-label={en ? "Primary navigation" : "Navigasi utama"}>
              <Link className="ms-drawer__nav-link" href={localeHref(locale, "/")} onClick={closeMenu}>
                {en ? "Home" : "Beranda"}
              </Link>
              {current === "production" ? (
                <span className="ms-drawer__nav-link ms-drawer__nav-link--current" aria-current="page">
                  {en ? "Production" : "Produksi"}
                </span>
              ) : (
                <TierCheckLink className="ms-drawer__nav-link" href={localeHref(locale, "/produksi")}>
                  {en ? "Production" : "Produksi"}
                </TierCheckLink>
              )}
              <Link className="ms-drawer__nav-link" href={localeHref(locale, "/#cara-kerja")} onClick={closeMenu}>{en ? "How it works" : "Cara kerja"}</Link>
              <Link className="ms-drawer__nav-link" href={localeHref(locale, "/#pricing")} onClick={closeMenu}>{en ? "Pricing" : "Harga"}</Link>
              <Link className="ms-drawer__nav-link" href={localeHref(locale, "/tentang-mscrape")} onClick={closeMenu}>{en ? "About" : "Tentang"}</Link>
              <Link className="ms-drawer__nav-link" href={localeHref(locale, "/developer")} onClick={closeMenu}>Developer</Link>
            </nav>
          </aside>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
