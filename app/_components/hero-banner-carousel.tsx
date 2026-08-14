"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const slides = [
  {
    src: "/media/mscrape-hero-banner.png",
    alt: "Ilustrasi MScrape menampilkan peta lokasi bisnis, hasil scan, ekspor data, dan indikator keberhasilan.",
    caption: "Peta pencarian, hasil scan, dan data siap ekspor dalam satu alur kerja.",
  },
  {
    src: "/media/mscrape-hero-banner-2.png",
    alt: "Ilustrasi MScrape untuk menemukan bisnis lokal, memindai data, melihat hasil, dan mengekspor prospek.",
    caption: "Dari bisnis lokal menjadi peluang nyata untuk proses outreach Anda.",
  },
] as const;

export function HeroBannerCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;

    const start = () => {
      window.clearInterval(timer);
      if (!preference.matches) {
        timer = window.setInterval(() => setActiveIndex((index) => (index + 1) % slides.length), 5_800);
      }
    };

    const handlePreferenceChange = () => {
      if (preference.matches) setActiveIndex(0);
      start();
    };

    start();
    preference.addEventListener("change", handlePreferenceChange);
    return () => {
      window.clearInterval(timer);
      preference.removeEventListener("change", handlePreferenceChange);
    };
  }, []);

  return (
    <section className="hero-banner-carousel" aria-label="Sorotan produk MScrape">
      <div className="hero-banner-carousel__viewport">
        <div className="hero-banner-carousel__track" style={{ transform: `translateX(-${activeIndex * 100}%)` }}>
          {slides.map((slide, index) => (
            <figure className="hero-banner-carousel__slide" key={slide.src} aria-hidden={index !== activeIndex}>
              <Image
                src={slide.src}
                alt={slide.alt}
                width={1672}
                height={941}
                sizes="100vw"
                priority={index === 0}
                loading={index === 0 ? undefined : "lazy"}
              />
              <figcaption>{slide.caption}</figcaption>
            </figure>
          ))}
        </div>
      </div>
      <div className="hero-banner-carousel__progress" aria-hidden="true">
        {slides.map((slide, index) => <span key={slide.src} data-active={index === activeIndex} />)}
      </div>
    </section>
  );
}
