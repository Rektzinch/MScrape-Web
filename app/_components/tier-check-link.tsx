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

type TierLabel = "Free" | "Pro" | "Max" | null;

export function TierCheckLink({ className, href, children }: TierCheckLinkProps) {
  const router = useRouter();
  const [checking, setChecking] = useState(false);
  const [tier, setTier] = useState<TierLabel>(null);
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
    setTier(null);
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    void fetch("/api/config", { cache: "no-store", signal: controller.signal })
      .then(async (response) => response.ok ? response.json() : null)
      .then((data: { access?: { label?: TierLabel } } | null) => setTier(data?.access?.label ?? "Free"))
      .catch(() => setTier("Free"));

    redirectRef.current = window.setTimeout(() => router.push(href), 5_000);
  }

  return (
    <>
      <Link className={className} href={href} onClick={openProduction} aria-busy={checking || undefined}>
        {children}
      </Link>
      {checking && typeof document !== "undefined" ? createPortal(
        <div className="tier-check-overlay" role="status" aria-live="polite" aria-label={`Memeriksa status tier ${tier || "Anda"}`}>
          <Image
            className="tier-check-overlay__visual"
            src="/media/mscrape-tier-check.png"
            alt="Maskot MScrape sedang memeriksa status tier"
            width={1230}
            height={1278}
            priority
          />
        </div>,
        document.body,
      ) : null}
    </>
  );
}
