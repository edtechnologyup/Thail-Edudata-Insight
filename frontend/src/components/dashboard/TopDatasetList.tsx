"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { formatCompactCount } from "./chartUtils";
import { useTrendingDatasets } from "@/hooks/useTrendingDatasets";

const STATS_TOP_LIMIT = 10;

function ListSkeleton() {
  return (
    <div className="rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 md:p-6">
      <div className="mb-6 h-7 w-48 animate-pulse rounded bg-surface-container" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="h-16 animate-pulse rounded-xl bg-surface-container" />
        ))}
      </div>
    </div>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-3.5 w-3.5 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
    </svg>
  );
}

export default function TopDatasetList() {
  const t = useTranslations("stats");
  const locale = useLocale();
  const base = `/${locale}`;
  const isTh = locale === "th";
  const { data, isLoading, isError } = useTrendingDatasets(STATS_TOP_LIMIT);

  const items = (data?.datasets ?? [])
    .slice()
    .sort((a, b) => (b.download_count ?? 0) - (a.download_count ?? 0) || (b.view_count ?? 0) - (a.view_count ?? 0));

  if (isLoading && !data) {
    return <ListSkeleton />;
  }

  if (isError) {
    return (
      <div className="h-full w-full rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 md:p-6">
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {t("topDatasetsLoadError")}
        </p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 md:p-6">
      <svg
        className="pointer-events-none absolute inset-x-0 bottom-0 h-16 w-full"
        viewBox="0 0 200 40"
        preserveAspectRatio="none"
        aria-hidden
      >
        <path
          d="M0 30 Q 20 12 45 22 T 95 18 T 145 26 T 200 12 V 40 H 0 Z"
          fill="#1a237e"
          opacity="0.06"
        />
        <path
          d="M0 30 Q 20 12 45 22 T 95 18 T 145 26 T 200 12"
          fill="none"
          stroke="#1a237e"
          strokeOpacity="0.18"
          strokeWidth="1.5"
        />
      </svg>
      <div className="mb-5 flex items-center gap-2">
        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        <h2 className="font-kanit text-heading-3-mobile font-bold text-primary md:text-heading-3">
          {t("topDatasets")}
        </h2>
      </div>
      {items.length === 0 ? (
        <p className="font-sarabun text-body-md text-text-muted">{t("noChartData")}</p>
      ) : (
        <>
          <div className="flex flex-col">
            {items.slice(0, 10).map((item, index) => {
              const category = isTh
                ? item.category_name_th ?? item.agency_name ?? "-"
                : item.category_name_en ?? item.agency_name ?? "-";
              const opacity = 1 - index * 0.08;

              return (
                <Link
                  key={item.id}
                  href={`${base}/datasets/${item.id}`}
                  className="group flex items-center gap-4 border-b border-border-default/40 py-4 transition-colors last:border-b-0 hover:bg-gray-50/50"
                >
                  <span
                    className="w-7 shrink-0 text-center font-kanit text-[1.5rem] font-bold text-primary"
                    style={{ opacity }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-kanit text-label font-bold text-text-primary transition-colors group-hover:text-primary-dark">
                      {item.title}
                    </p>
                    <span className="mt-0.5 flex items-center gap-1 font-sarabun text-caption text-text-muted">
                      <CategoryIcon />
                      {category}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="font-kanit text-body-md font-bold text-primary">
                      {formatCompactCount(item.download_count ?? 0, locale)}
                    </span>
                    <p className="font-sarabun text-[10px] text-text-muted">
                      {isTh ? "ดาวน์โหลด" : "downloads"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
          <div className="mt-5 flex justify-center">
            <Link
              href={`${base}/search?sort=downloads`}
              className="inline-flex items-center gap-1.5 rounded-radius-full border-2 border-primary px-8 py-2.5 font-sarabun text-label font-bold text-primary transition-all hover:bg-primary hover:text-white"
            >
              {isTh ? "ดูทั้งหมด" : "View all"}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
