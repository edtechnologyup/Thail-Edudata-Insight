"use client";

import { useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
import { useSearchParamsUpdate } from "./useSearchParamsUpdate";

export type SortOption = "newest" | "popular" | "name";

type SortDropdownProps = {
  value: SortOption;
};

const SORT_OPTIONS: SortOption[] = ["newest", "popular", "name"];

export default function SortDropdown({ value }: SortDropdownProps) {
  const t = useTranslations("search");
  const updateParams = useSearchParamsUpdate();
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const labelFor = (option: SortOption) =>
    option === "newest"
      ? t("sortNewest")
      : option === "popular"
        ? t("sortPopular")
        : t("sortName");

  return (
    <div className="flex items-center gap-3">
      <span className="hidden font-sarabun text-label text-text-muted sm:inline">
        {t("sortBy")}:
      </span>
      <div ref={wrapperRef} className="relative">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex items-center gap-2 rounded-radius-full border border-border-input bg-surface-card px-4 py-1.5 font-sarabun text-label font-normal text-text-primary transition-colors hover:border-primary focus:border-primary focus:outline-none"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={t("sortBy")}
        >
          {labelFor(value)}
          <svg
            className={`h-4 w-4 text-text-muted transition-transform ${open ? "rotate-180" : ""}`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        {open && (
          <ul
            role="listbox"
            className="absolute right-0 z-20 mt-2 w-max min-w-full overflow-hidden rounded-2xl border border-border-default/60 bg-white p-1.5 shadow-level-2"
          >
            {SORT_OPTIONS.map((option) => (
              <li key={option} role="option" aria-selected={value === option}>
                <button
                  type="button"
                  onClick={() => {
                    updateParams({ sort: option }, { resetPage: true });
                    setOpen(false);
                  }}
                  className={`block w-full rounded-xl px-4 py-2 text-left font-sarabun text-label font-normal transition-colors ${
                    value === option
                      ? "bg-primary text-white"
                      : "text-text-primary hover:bg-primary-light"
                  }`}
                >
                  {labelFor(option)}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
