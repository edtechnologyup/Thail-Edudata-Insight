"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { formatCompactCount } from "./chartUtils";
import { useTrendingDatasets } from "@/hooks/useTrendingDatasets";

const STATS_TOP_LIMIT = 10;

function ListSkeleton() {
  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <div className="mb-6 h-7 w-48 animate-pulse rounded-radius-sm bg-surface-container" />
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="h-14 animate-pulse rounded-radius-md bg-surface-container"
          />
        ))}
      </div>
    </div>
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
    .sort((a, b) => (b.view_count ?? 0) - (a.view_count ?? 0));

  if (isLoading && !data) {
    return <ListSkeleton />;
  }

  if (isError) {
    return (
      <div className="h-full w-full rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {t("topDatasetsLoadError")}
        </p>
      </div>
    );
  }

  return (
    <div className="h-full w-full rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <h2 className="mb-6 font-kanit text-heading-3-mobile font-semibold text-text-primary md:text-heading-3">
        {t("topDatasets")}
      </h2>
      {items.length === 0 ? (
        <p className="font-sarabun text-body-md text-text-muted">{t("noChartData")}</p>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item, index) => {
            const category = isTh
              ? item.category_name_th ?? item.agency_name ?? "-"
              : item.category_name_en ?? item.agency_name ?? "-";
            const rankOpacity = 1 - index * 0.15;

            return (
              <li key={item.id}>
                <Link
                  href={`${base}/datasets/${item.id}`}
                  className="group flex items-center gap-4 rounded-radius-md p-3 transition-colors hover:bg-surface-container"
                >
                  <span
                    className="w-8 shrink-0 font-kanit text-2xl font-bold text-primary-dark"
                    style={{ opacity: rankOpacity }}
                  >
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-sarabun text-label font-medium text-text-primary transition-colors group-hover:text-primary-dark">
                      {item.title}
                    </p>
                    <span className="font-sarabun text-caption text-text-muted">
                      {t("categoryLabel")}: {category}
                    </span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="block font-kanit text-label font-bold text-primary-dark">
                      {formatCompactCount(item.view_count ?? 0, locale)}
                    </span>
                    <span className="font-sarabun text-caption uppercase text-text-muted">
                      {t("views")}
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
