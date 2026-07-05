"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useStatsByCategory } from "@/hooks/useStatsByCategory";

const CATEGORIES_PER_PAGE = 6;

type HomeCategorySectionProps = {
  locale: string;
};

function CategoryCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border-default bg-surface-card p-5 shadow-level-1">
      <div className="mb-2 h-5 w-2/3 rounded-radius-sm bg-surface-container" />
      <div className="h-4 w-1/3 rounded-radius-sm bg-surface-container" />
    </div>
  );
}

export default function HomeCategorySection({ locale }: HomeCategorySectionProps) {
  const uiLocale = useLocale();
  const isTh = uiLocale === "th";
  const { data, isLoading, isError } = useStatsByCategory(null);
  const [page, setPage] = useState(0);

  const categories = (data?.categories ?? []).filter((c) => c.id !== null);
  const totalPages = Math.ceil(categories.length / CATEGORIES_PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const visibleCategories = categories.slice(
    currentPage * CATEGORIES_PER_PAGE,
    currentPage * CATEGORIES_PER_PAGE + CATEGORIES_PER_PAGE
  );

  if (!isLoading && (isError || categories.length === 0)) {
    return null;
  }

  return (
    <section className="py-12 md:py-16">
      <div className="mx-auto max-w-container-max px-4 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
          <div>
            <h2 className="font-kanit text-heading-2 text-text-primary">
              {isTh ? "หมวดหมู่" : "Categories"}
            </h2>
            <p className="mt-2 font-sarabun text-body-md text-text-secondary">
              {isTh
                ? "เลือกดูชุดข้อมูลตามหมวดหมู่ที่สนใจ"
                : "Browse datasets by category"}
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(currentPage - 1, 0))}
                disabled={currentPage === 0}
                className="flex h-10 w-10 items-center justify-center rounded-radius-full border border-border-default bg-white text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border-default disabled:hover:text-text-secondary"
                aria-label={isTh ? "หมวดหมู่ก่อนหน้า" : "Previous categories"}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-sarabun text-caption text-text-muted">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(currentPage + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="flex h-10 w-10 items-center justify-center rounded-radius-full border border-border-default bg-white text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-border-default disabled:hover:text-text-secondary"
                aria-label={isTh ? "หมวดหมู่ถัดไป" : "Next categories"}
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <CategoryCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {visibleCategories.map((category) => (
              <Link
                key={category.id}
                href={`/${locale}/search?category=${category.id}`}
                className="group relative overflow-hidden rounded-2xl p-7 transition-all hover:-translate-y-1 hover:brightness-110 md:p-8"
                style={{
                  background: "linear-gradient(180deg, #283593 0%, #1a237e 100%)",
                  boxShadow:
                    "inset 0 1px 0 rgba(255,255,255,0.25), 0 6px 16px rgba(26,35,126,0.35)",
                }}
              >
                <div
                  className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/30 blur-xl"
                  aria-hidden
                />
                <div
                  className="pointer-events-none absolute -bottom-10 -left-6 h-28 w-28 rounded-full bg-white/20 blur-lg"
                  aria-hidden
                />
                <div className="relative z-10 flex items-start justify-between gap-2">
                  <h3 className="font-kanit text-heading-3-mobile font-normal text-white md:text-heading-3">
                    {isTh ? category.name_th : category.name_en}
                  </h3>
                  <svg
                    className="h-5 w-5 shrink-0 text-white/70 transition-all group-hover:translate-x-0.5 group-hover:text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <p className="relative z-10 mt-2 font-sarabun text-label font-normal text-white/80">
                  {category.count.toLocaleString(uiLocale)}{" "}
                  {isTh ? "ชุดข้อมูล" : "datasets"}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
