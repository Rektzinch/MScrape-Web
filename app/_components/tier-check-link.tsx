"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

type TierCheckLinkProps = {
  className: string;
  href: string;
  children: React.ReactNode;
};

export function TierCheckLink({ className, href, children }: TierCheckLinkProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const redirectRef = useRef<number | null>(null);

  useEffect(() => () => {
    abortRef.current?.abort();
    if (redirectRef.current) window.clearTimeout(redirectRef.current);
  }, []);

  function openProduction(event: React.MouseEvent<HTMLAnchorElement>) {
    event.preventDefault();
    if (checking) return;

    setChecking(true);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void fetch("/api/config", { cache: "no-store", signal: controller.signal })
      .catch(() => undefined);

    redirectRef.current = window.setTimeout(() => router.push(href), 5_000);
  }

  return (
    <>
      <Link className={className} href={href} onClick={openProduction} aria-busy={checking || undefined}>
        {children}
      </Link>
      {checking && typeof document !== "undefined" ? createPortal(
        <div className="tier-check-overlay" role="status" aria-live="polite" aria-label="Menyiapkan workspace Produksi">
          <div className="tier-check-overlay__content">
            <Image
              className="tier-check-overlay__logo"
              src="/media/mscrape-logo-light.png"
              alt="MScrape"
              width={2172}
              height={724}
              priority
            />
            <div className="tier-check-overlay__notice">
              <p>Menyiapkan workspace Produksi</p>
              <span>Memeriksa status akses dan menyiapkan ruang kerja Anda.</span>
            </div>
            <span className="tier-check-overlay__progress" aria-hidden="true" />
          </div>
        </div>,
        document.body,
      ) : null}
    </>
  );
}
