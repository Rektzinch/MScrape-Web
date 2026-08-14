"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";

export type ComboboxOption = {
  value: string;
  label: string;
  description?: string;
  locked?: boolean;
};

type SearchableComboboxProps = {
  label: string;
  value: string;
  options: ComboboxOption[];
  onChange: (value: string) => void;
  onLockedOption?: (option: ComboboxOption) => void;
  name?: string;
  helper?: string;
  searchPlaceholder?: string;
  className?: string;
};

export function SearchableCombobox({
  label,
  value,
  options,
  onChange,
  onLockedOption,
  name,
  helper,
  searchPlaceholder = "Cari pilihan",
  className,
}: SearchableComboboxProps) {
  const generatedId = useId().replaceAll(":", "");
  const listboxId = `combobox-${generatedId}`;
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const selected = options.find((option) => option.value === value) ?? options[0];
  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase("id");
    if (!normalized) return options;
    return options.filter((option) =>
      `${option.label} ${option.description || ""}`
        .toLocaleLowerCase("id")
        .includes(normalized),
    );
  }, [options, query]);

  useEffect(() => {
    if (!open) return;
    searchRef.current?.focus({ preventScroll: true });
    const closeOnOutsidePress = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    window.addEventListener("pointerdown", closeOnOutsidePress);
    return () => window.removeEventListener("pointerdown", closeOnOutsidePress);
  }, [open]);

  useEffect(() => setActiveIndex(0), [options, query]);

  useEffect(() => {
    if (!open) return;
    listRef.current
      ?.querySelector<HTMLElement>('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [activeIndex, open]);

  function choose(option: ComboboxOption) {
    if (option.locked) onLockedOption?.(option);
    else onChange(option.value);
    setOpen(false);
    setQuery("");
  }

  function moveActive(delta: number) {
    if (!filtered.length) return;
    setActiveIndex((current) => (current + delta + filtered.length) % filtered.length);
  }

  function handleListKeys(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      moveActive(1);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      moveActive(-1);
    } else if (event.key === "Enter" && filtered[activeIndex]) {
      event.preventDefault();
      choose(filtered[activeIndex]);
    } else if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
    }
  }

  return (
    <div className={`combobox${className ? ` ${className}` : ""}`} ref={rootRef}>
      <span className="combobox__label" id={`${listboxId}-label`}>{label}</span>
      {name ? <input type="hidden" name={name} value={value} /> : null}
      <button
        className="combobox__trigger"
        type="button"
        role="combobox"
        aria-controls={listboxId}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-labelledby={`${listboxId}-label ${listboxId}-value`}
        onClick={() => setOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "ArrowUp") {
            event.preventDefault();
            setOpen(true);
          }
          if (event.key === "Escape") setOpen(false);
        }}
      >
        <span id={`${listboxId}-value`}>
          <strong>{selected?.label}</strong>
          {selected?.description ? <small>{selected.description}</small> : null}
        </span>
        <svg viewBox="0 0 20 20" aria-hidden="true"><path d="m5 7 5 5 5-5" /></svg>
      </button>

      {open ? (
        <div className="combobox__popover">
          <div className="combobox__search">
            <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="4.5" /><path d="m12 12 4 4" /></svg>
            <input
              ref={searchRef}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={handleListKeys}
              placeholder={searchPlaceholder}
              aria-label={`${searchPlaceholder} untuk ${label}`}
              aria-controls={listboxId}
              aria-activedescendant={filtered[activeIndex] ? `${listboxId}-${filtered[activeIndex].value}` : undefined}
            />
          </div>
          <div ref={listRef} className="combobox__options" id={listboxId} role="listbox" aria-labelledby={`${listboxId}-label`}>
            {filtered.length ? filtered.map((option, index) => (
              <button
                className="combobox__option"
                id={`${listboxId}-${option.value}`}
                key={option.value}
                type="button"
                role="option"
                aria-selected={option.value === value}
                data-active={index === activeIndex}
                data-locked={option.locked || undefined}
                onPointerMove={() => setActiveIndex(index)}
                onClick={() => choose(option)}
              >
                <span><strong>{option.label}</strong>{option.description ? <small>{option.description}</small> : null}</span>
                {option.locked ? (
                  <svg className="combobox__lock" viewBox="0 0 20 20" aria-label="Terkunci"><rect x="4.5" y="8.5" width="11" height="8" rx="1" /><path d="M7 8.5V6.7a3 3 0 0 1 6 0v1.8" /></svg>
                ) : option.value === value ? <span className="combobox__check" aria-hidden="true">✓</span> : null}
              </button>
            )) : <p className="combobox__empty">Pilihan tidak ditemukan.</p>}
          </div>
        </div>
      ) : null}
      {helper ? <small className="field__hint">{helper}</small> : null}
    </div>
  );
}
