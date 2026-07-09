"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useStatsByCategory } from "@/hooks/useStatsByCategory";

const CATEGORIES_PER_PAGE = 6;

const CATEGORY_STYLES: Record<string, { icon: React.ReactNode; gradient: string; shadow: string }> = {
  "สถิตินักเรียน": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>,
    gradient: "linear-gradient(135deg, #1565c0 0%, #0d47a1 100%)",
    shadow: "0 6px 16px rgba(13,71,161,0.35)",
  },
  "สถิติครูและบุคลากร": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" /></svg>,
    gradient: "linear-gradient(135deg, #00897b 0%, #00695c 100%)",
    shadow: "0 6px 16px rgba(0,105,92,0.35)",
  },
  "สถิติสถานศึกษา": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21v-8.25M15.75 21v-8.25M8.25 21v-8.25M3 9l9-6 9 6m-1.5 12V10.332A48.36 48.36 0 0012 9.75c-2.551 0-5.056.2-7.5.582V21M3 21h18M12 6.75h.008v.008H12V6.75z" /></svg>,
    gradient: "linear-gradient(135deg, #5e35b1 0%, #4527a0 100%)",
    shadow: "0 6px 16px rgba(69,39,160,0.35)",
  },
  "งบประมาณ": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" /></svg>,
    gradient: "linear-gradient(135deg, #ef6c00 0%, #e65100 100%)",
    shadow: "0 6px 16px rgba(230,81,0,0.35)",
  },
  "ผลสัมฤทธิ์": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>,
    gradient: "linear-gradient(135deg, #c62828 0%, #b71c1c 100%)",
    shadow: "0 6px 16px rgba(183,28,28,0.35)",
  },
  "ทุนการศึกษา": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>,
    gradient: "linear-gradient(135deg, #f9a825 0%, #f57f17 100%)",
    shadow: "0 6px 16px rgba(245,127,23,0.35)",
  },
  "การศึกษาพิเศษ": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" /></svg>,
    gradient: "linear-gradient(135deg, #ec407a 0%, #c2185b 100%)",
    shadow: "0 6px 16px rgba(194,24,91,0.35)",
  },
  "อาชีวศึกษา": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.76-3.35a.75.75 0 010-1.3l5.76-3.35a1.5 1.5 0 011.5 0l5.76 3.35a.75.75 0 010 1.3l-5.76 3.35a1.5 1.5 0 01-1.5 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.76-3.35V15a2.25 2.25 0 002.25 2.25h6.75A2.25 2.25 0 0017.1 15v-3.18l-5.76 3.35a1.5 1.5 0 01-1.5 0z" /></svg>,
    gradient: "linear-gradient(135deg, #0277bd 0%, #01579b 100%)",
    shadow: "0 6px 16px rgba(1,87,155,0.35)",
  },
  "การศึกษานอกระบบ": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>,
    gradient: "linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)",
    shadow: "0 6px 16px rgba(27,94,32,0.35)",
  },
  "วิจัยและนวัตกรรม": {
    icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>,
    gradient: "linear-gradient(135deg, #6a1b9a 0%, #4a148c 100%)",
    shadow: "0 6px 16px rgba(74,20,140,0.35)",
  },
};

const DEFAULT_STYLE = {
  icon: <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M3.75 9.776c.112-.017.227-.026.344-.026h15.812c.117 0 .232.009.344.026m-16.5 0a2.25 2.25 0 00-1.883 2.542l.857 6a2.25 2.25 0 002.227 1.932H19.05a2.25 2.25 0 002.227-1.932l.857-6a2.25 2.25 0 00-1.883-2.542m-16.5 0V6A2.25 2.25 0 016 3.75h3.879a1.5 1.5 0 011.06.44l2.122 2.12a1.5 1.5 0 001.06.44H18A2.25 2.25 0 0120.25 9v.776" /></svg>,
  gradient: "linear-gradient(135deg, #546e7a 0%, #37474f 100%)",
  shadow: "0 6px 16px rgba(55,71,79,0.35)",
};

function getCategoryStyle(nameTh: string) {
  for (const [key, style] of Object.entries(CATEGORY_STYLES)) {
    if (nameTh.includes(key)) return style;
  }
  return DEFAULT_STYLE;
}

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
            {visibleCategories.map((category) => {
              const style = getCategoryStyle(category.name_th ?? "");
              return (
                <Link
                  key={category.id}
                  href={`/${locale}/search?category=${category.id}`}
                  className="group relative overflow-hidden rounded-2xl p-7 transition-all hover:-translate-y-1 hover:brightness-110 md:p-8"
                  style={{
                    background: style.gradient,
                    boxShadow: `inset 0 1px 0 rgba(255,255,255,0.25), ${style.shadow}`,
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
                  <div className="relative z-10 mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-white/20 text-white" aria-hidden>
                    {style.icon}
                  </div>
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
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
