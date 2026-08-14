"use client";

import { useEffect, useState } from "react";

type TypewriterTextProps = {
  text: string;
  delay?: number;
  className?: string;
};

export function TypewriterText({ text, delay = 34, className }: TypewriterTextProps) {
  const [visible, setVisible] = useState("");

  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let timer: number | undefined;
    let index = 0;

    const showText = () => {
      window.clearTimeout(timer);
      setVisible(text);
    };

    const typeNext = () => {
      index += 1;
      setVisible(text.slice(0, index));
      if (index < text.length) timer = window.setTimeout(typeNext, delay);
    };

    if (preference.matches) {
      showText();
      return;
    }

    setVisible("");
    timer = window.setTimeout(typeNext, delay);
    preference.addEventListener("change", showText, { once: true });
    return () => {
      window.clearTimeout(timer);
      preference.removeEventListener("change", showText);
    };
  }, [delay, text]);

  return <span className={className}>{visible}<span className="dashboard-typewriter__caret" aria-hidden="true" /></span>;
}
