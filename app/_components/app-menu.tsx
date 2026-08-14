"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TierCheckLink } from "./tier-check-link";

type AppMenuProps = {
  current: "dashboard" | "production" | "info";
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
              <p>MSCRAPE / MENU</p>
              <button className="app-side-menu__close" type="button" onClick={closeMenu} aria-label="Tutup menu">×</button>
            </div>

            <nav className="app-side-menu__nav" aria-label="Navigasi utama">
              <Link className="app-side-menu__nav-link" href="/" onClick={closeMenu}>
                Homepage <span aria-hidden="true">↖</span>
              </Link>
              <Link className="app-side-menu__nav-link" href="/dashboard" onClick={closeMenu} aria-current={current === "dashboard" ? "page" : undefined}>
                Dashboard <span aria-hidden="true">↗</span>
              </Link>
              {current === "production" ? (
                <span className="app-side-menu__nav-link app-side-menu__nav-link--current" aria-current="page">
                  Produksi <span aria-hidden="true">●</span>
                </span>
              ) : (
                <TierCheckLink className="app-side-menu__nav-link" href="/produksi">
                  Produksi <span aria-hidden="true">↗</span>
                </TierCheckLink>
              )}
              <Link className="app-side-menu__nav-link" href="/tentang-mscrape" onClick={closeMenu}>Tentang MScrape</Link>
              <Link className="app-side-menu__nav-link" href="/syarat-ketentuan" onClick={closeMenu}>Syarat &amp; Ketentuan</Link>
              <Link className="app-side-menu__nav-link" href="/developer" onClick={closeMenu}>Developer</Link>
            </nav>
          </aside>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
