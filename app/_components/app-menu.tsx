"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TierCheckLink } from "./tier-check-link";

type AppMenuProps = {
  current: "production" | "info";
};

export function AppMenu({ current }: AppMenuProps) {
  const [open, setOpen] = useState(false);

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
        className="app-menu-trigger"
        type="button"
        aria-label="Buka menu"
        aria-expanded={open}
        aria-controls="app-side-menu"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div className="app-menu-layer" onClick={closeMenu}>
          <aside id="app-side-menu" className="app-side-menu" aria-label="Menu MScrape" onClick={(event) => event.stopPropagation()}>
            <div className="app-side-menu__top">
              <p>NAVIGASI / MSCRAPE</p>
              <button className="app-side-menu__close" type="button" onClick={closeMenu} aria-label="Tutup menu">×</button>
            </div>

            <nav className="app-side-menu__nav" aria-label="Navigasi utama">
              <Link className="app-side-menu__nav-link" href="/" onClick={closeMenu}>
                Beranda <span aria-hidden="true">01</span>
              </Link>
              {current === "production" ? (
                <span className="app-side-menu__nav-link app-side-menu__nav-link--current" aria-current="page">
                  Produksi <span aria-hidden="true">02</span>
                </span>
              ) : (
                <TierCheckLink className="app-side-menu__nav-link" href="/produksi">
                  Produksi <span aria-hidden="true">02</span>
                </TierCheckLink>
              )}
              <Link className="app-side-menu__nav-link" href="/#cara-kerja" onClick={closeMenu}>Cara kerja <span aria-hidden="true">03</span></Link>
              <Link className="app-side-menu__nav-link" href="/#pricing" onClick={closeMenu}>Harga <span aria-hidden="true">04</span></Link>
              <Link className="app-side-menu__nav-link" href="/tentang-mscrape" onClick={closeMenu}>Tentang <span aria-hidden="true">05</span></Link>
              <Link className="app-side-menu__nav-link" href="/developer" onClick={closeMenu}>Developer <span aria-hidden="true">06</span></Link>
            </nav>
          </aside>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
