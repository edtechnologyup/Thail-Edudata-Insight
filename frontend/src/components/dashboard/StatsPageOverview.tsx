"use client";

import { useLocale, useTranslations } from "next-intl";
import StatsCard from "@/components/dashboard/StatsCard";
import { formatCompactCount } from "@/components/dashboard/chartUtils";
import { useStatsOverview } from "@/hooks/useStatsOverview";
import { getStatsOverviewFooters } from "@/utils/statsOverviewFooters";

function StatsCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
      <div className="mb-2 h-4 w-24 rounded bg-surface-container" />
      <div className="h-12 w-20 rounded bg-surface-container" />
    </div>
  );
}

function DatasetIcon() {
  return (
    <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
    </svg>
  );
}

function AgencyIcon() {
  return (
    <svg className="h-7 w-7" style={{ color: "#7c4dff" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
    </svg>
  );
}

function DownloadIcon() {
  return (
    <svg className="h-7 w-7" style={{ color: "#00897b" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-7 w-7" style={{ color: "#ff8f00" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  );
}

export default function StatsPageOverview() {
  const t = useTranslations("stats");
  const locale = useLocale();
  const { data: overview, isLoading, isError } = useStatsOverview();

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatsCardSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <p className="font-sarabun text-body-md text-status-error" role="alert">
        {t("loadError")}
      </p>
    );
  }

  const footers = getStatsOverviewFooters(overview, t);
  const totalDatasets = overview.total_datasets.toLocaleString(locale);
  const totalAgencies = overview.total_agencies.toLocaleString(locale);
  const totalDownloads = formatCompactCount(overview.total_downloads, locale);
  const totalCategories = (
    overview.total_categories ?? overview.total_categories_level1
  ).toLocaleString(locale);

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
      <StatsCard
        label={t("totalDatasets")}
        value={totalDatasets}
        footer={footers.datasetsFooter}
        icon={<DatasetIcon />}
        solid
      />
      <StatsCard
        label={t("totalAgencies")}
        value={totalAgencies}
        valueClassName="text-primary"
        footer={footers.agenciesFooter}
        icon={<AgencyIcon />}
        accentColor="#5e35b1"
      />
      <StatsCard
        label={t("totalDownloads")}
        value={totalDownloads}
        valueClassName="text-primary"
        footer={footers.downloadsFooter}
        icon={<DownloadIcon />}
        accentColor="#00695c"
      />
      <StatsCard
        label={t("totalCategories")}
        value={totalCategories}
        valueClassName="text-primary"
        footer={footers.categoriesFooter}
        icon={<CategoryIcon />}
        accentColor="#ff8f00"
        decoration={
          <svg
            className="pointer-events-none absolute inset-x-0 bottom-0 h-14 w-full"
            viewBox="0 0 200 40"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              d="M0 30 Q 20 12 45 22 T 95 18 T 145 26 T 200 12 V 40 H 0 Z"
              fill="#ff8f00"
              opacity="0.12"
            />
            <path
              d="M0 30 Q 20 12 45 22 T 95 18 T 145 26 T 200 12"
              fill="none"
              stroke="#ff8f00"
              strokeOpacity="0.4"
              strokeWidth="1.5"
            />
          </svg>
        }
      />
    </div>
  );
}
