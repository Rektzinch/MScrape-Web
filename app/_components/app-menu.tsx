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
        className="ms-menu-trigger"
        type="button"
        aria-label="Buka menu"
        aria-expanded={open}
        aria-controls="ms-drawer"
        onClick={() => setOpen(true)}
      >
        <span aria-hidden="true" />
        <span aria-hidden="true" />
        <span aria-hidden="true" />
      </button>
      {open && typeof document !== "undefined" ? createPortal(
        <div className="ms-menu-layer" onClick={closeMenu}>
          <aside id="ms-drawer" className="ms-drawer" aria-label="Menu MScrape" onClick={(event) => event.stopPropagation()}>
            <div className="ms-drawer__top">
              <p>MScrape</p>
              <button className="ms-drawer__close" type="button" onClick={closeMenu} aria-label="Tutup menu">×</button>
            </div>

            <nav className="ms-drawer__nav" aria-label="Navigasi utama">
              <Link className="ms-drawer__nav-link" href="/" onClick={closeMenu}>
                Beranda
              </Link>
              {current === "production" ? (
                <span className="ms-drawer__nav-link ms-drawer__nav-link--current" aria-current="page">
                  Produksi
                </span>
              ) : (
                <TierCheckLink className="ms-drawer__nav-link" href="/produksi">
                  Produksi
                </TierCheckLink>
              )}
              <Link className="ms-drawer__nav-link" href="/#cara-kerja" onClick={closeMenu}>Cara kerja</Link>
              <Link className="ms-drawer__nav-link" href="/#pricing" onClick={closeMenu}>Harga</Link>
              <Link className="ms-drawer__nav-link" href="/tentang-mscrape" onClick={closeMenu}>Tentang</Link>
              <Link className="ms-drawer__nav-link" href="/developer" onClick={closeMenu}>Developer</Link>
            </nav>
          </aside>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
