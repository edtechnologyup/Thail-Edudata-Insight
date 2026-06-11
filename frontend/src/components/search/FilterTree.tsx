"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import { useSearchParamsUpdate } from "./useSearchParamsUpdate";

type FilterTreeProps = {
  selectedCategory: string | null;
};

export default function FilterTree({ selectedCategory }: FilterTreeProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const updateParams = useSearchParamsUpdate();
  const { data: filterOptions } = useSearchFilters();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const tree = useMemo(() => {
    const categories = filterOptions?.categories ?? [];
    const l1List = categories.filter((c) => c.level === 1);
    const l2List = categories.filter((c) => c.level === 2);

    return l1List.map((parent) => ({
      parent,
      children: l2List.filter((c) => c.parent_id === parent.id),
    }));
  }, [filterOptions?.categories]);

  if (tree.length === 0) {
    return null;
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectCategory(id: string) {
    if (selectedCategory === id) {
      updateParams({ category: null, page: null });
    } else {
      updateParams({ category: id, page: null });
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between font-sarabun text-label font-medium text-text-secondary">
        <span>{t("categories")}</span>
      </div>
      <div className="flex flex-col gap-1">
        {tree.map(({ parent, children }) => {
          const isExpanded = expanded[parent.id] ?? children.length > 0;
          const parentLabel =
            locale === "th" ? parent.name_th : parent.name_en;
          const isParentSelected = selectedCategory === parent.id;
          const hasChildren = children.length > 0;

          return (
            <div key={parent.id}>
              <div
                className={`flex w-full items-center gap-2 rounded-radius-md px-2 py-1.5 font-sarabun text-label transition-colors hover:bg-surface-container ${
                  isParentSelected
                    ? "border-l-[3px] border-primary-dark bg-primary-light text-primary-dark"
                    : ""
                }`}
              >
                {hasChildren ? (
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
                ) : (
                  <span className="inline-block h-5 w-5 shrink-0" aria-hidden />
                )}
                <button
                  type="button"
                  onClick={() => selectCategory(parent.id)}
                  className="flex-1 text-left font-medium"
                >
                  {parentLabel}
                </button>
              </div>
              {hasChildren && isExpanded && (
                <div className="ml-4 flex flex-col gap-1">
                  {children.map((child) => {
                    const childLabel =
                      locale === "th" ? child.name_th : child.name_en;
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
