"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/locale";

export function DocumentLanguage({ locale }: { locale: Locale }) {
  useEffect(() => {
    const previous = document.documentElement.lang;
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = previous;
    };
  }, [locale]);

  return null;
}
