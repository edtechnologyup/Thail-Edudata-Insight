"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { MOCK_FILTER_CATEGORIES } from "@/data/mockData";
import { useSearchParamsUpdate } from "./useSearchParamsUpdate";

type FilterTreeProps = {
  selectedCategory: string | null;
};

export default function FilterTree({ selectedCategory }: FilterTreeProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const updateParams = useSearchParamsUpdate();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    primary: true,
    secondary: false,
  });

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectCategory(id: string) {
    if (selectedCategory === id) {
      updateParams({ category: null });
    } else {
      updateParams({ category: id });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between font-sarabun text-label font-medium text-text-secondary">
        <span>{t("categories")}</span>
      </div>
      <div className="flex flex-col gap-1">
        {MOCK_FILTER_CATEGORIES.map((parent) => {
          const isExpanded = expanded[parent.id] ?? false;
          const parentLabel = locale === "th" ? parent.labelTh : parent.labelEn;
          const isParentSelected = selectedCategory === parent.id;

          return (
            <div key={parent.id}>
              <div
                className={`flex w-full items-center gap-2 rounded-radius-md px-2 py-1.5 font-sarabun text-label transition-colors hover:bg-surface-container ${
                  isParentSelected
                    ? "border-l-[3px] border-primary-dark bg-primary-light text-primary-dark"
                    : ""
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleExpand(parent.id)}
                  className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-text-muted"
                  aria-expanded={isExpanded}
                  aria-label={parentLabel}
                >
                  {isExpanded ? (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => selectCategory(parent.id)}
                  className="flex-1 text-left font-medium"
                >
                  {parentLabel}
                </button>
              </div>
              {isExpanded && parent.children && (
                <div className="ml-4 flex flex-col gap-1">
                  {parent.children.map((child) => {
                    const childLabel =
                      locale === "th" ? child.labelTh : child.labelEn;
                    const isActive = selectedCategory === child.id;

                    return (
                      <button
                        key={child.id}
                        type="button"
                        onClick={() => selectCategory(child.id)}
                        className={`flex items-center justify-between rounded-radius-md px-3 py-1.5 font-sarabun text-label transition-colors hover:bg-surface-container ${
                          isActive
                            ? "border-l-[3px] border-primary-dark bg-primary-light text-primary-dark"
                            : ""
                        }`}
                      >
                        <span>{childLabel}</span>
                        {isActive && (
                          <svg
                            className="h-4 w-4 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            aria-hidden
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
