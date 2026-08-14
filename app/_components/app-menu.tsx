"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { TierCheckLink } from "./tier-check-link";

type AppMenuProps = {
  current: "dashboard" | "production";
};

const socialLinks = [
  { label: "Kirim email ke Muh Amin Arsyad", href: "mailto:alienrektz@gmail.com", icon: "/media/social/gmail.svg", name: "Email" },
  { label: "Facebook Muh Amin Arsyad", href: "https://www.facebook.com/share/1C6po4Tj86/", icon: "/media/social/facebook.svg", name: "Facebook" },
  { label: "WhatsApp Muh Amin Arsyad", href: "https://wa.me/6285111349699", icon: "/media/social/whatsapp.svg", name: "WhatsApp" },
  { label: "TikTok Muh Amin Arsyad", href: "https://www.tiktok.com/@rektxkz?_r=1&_t=ZS-98ry9zZuC7Z", icon: "/media/social/tiktok.svg", name: "TikTok" },
];

export function AppMenu({ current }: AppMenuProps) {
  const [open, setOpen] = useState(false);
  const onDashboard = current === "dashboard";
  const destination = onDashboard ? "/produksi" : "/dashboard";
  const destinationLabel = onDashboard ? "Produksi" : "Dashboard";

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
              {onDashboard ? (
                <TierCheckLink className="app-side-menu__nav-link" href={destination}>
                  {destinationLabel} <span aria-hidden="true">↗</span>
                </TierCheckLink>
              ) : (
                <Link className="app-side-menu__nav-link" href={destination} onClick={closeMenu}>
                  {destinationLabel} <span aria-hidden="true">↙</span>
                </Link>
              )}
              <a className="app-side-menu__nav-link" href="#tentang-mscrape">Tentang MScrape</a>
              <a className="app-side-menu__nav-link" href="#syarat-ketentuan">Syarat &amp; Ketentuan</a>
              <a className="app-side-menu__nav-link" href="#developer">Developer</a>
            </nav>

            <section className="app-side-menu__about" id="tentang-mscrape">
              <p className="app-side-menu__label">Tentang MScrape</p>
              <p>Ruang kerja untuk mengubah pencarian bisnis lokal menjadi daftar riset, analisis, dan tindak lanjut yang lebih terarah.</p>
            </section>

            <section className="app-side-menu__terms" id="syarat-ketentuan">
              <p className="app-side-menu__label">Syarat &amp; Ketentuan</p>
              <p>Gunakan data secara bertanggung jawab, patuhi aturan sumber data, dan pastikan setiap tindak lanjut dilakukan dengan izin yang relevan.</p>
            </section>

            <section className="app-side-menu__developer" id="developer" aria-labelledby="developer-name">
              <Image
                className="app-side-menu__developer-photo"
                src="/media/developer/muh-amin-arsyad.jpg"
                alt="Muh Amin Arsyad"
                width={1080}
                height={1083}
                loading="lazy"
                sizes="7rem"
              />
              <div>
                <p className="app-side-menu__label">Developer</p>
                <h2 id="developer-name">MUH AMIN ARSYAD</h2>
                <div className="app-side-menu__socials" aria-label="Kontak developer">
                  {socialLinks.map((social) => (
                    <a key={social.name} href={social.href} target={social.href.startsWith("http") ? "_blank" : undefined} rel={social.href.startsWith("http") ? "noreferrer" : undefined} aria-label={social.label} title={social.name}>
                      <img src={social.icon} alt="" aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </div>
            </section>
          </aside>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
