"use client";

import { useTranslations } from "next-intl";
import CategoryPieChart from "@/components/dashboard/CategoryPieChart";
import { useStatsByCategory } from "@/hooks/useStatsByCategory";

function SectionSkeleton() {
  return (
    <div className="h-full min-h-[360px] animate-pulse rounded-radius-lg border border-border-default bg-surface-container md:min-h-[420px]" />
  );
}

export default function StatsChartsSection() {
  const t = useTranslations("stats");
  const { data, isLoading, isError } = useStatsByCategory(null);

  if (isLoading && !data) {
    return <SectionSkeleton />;
  }

  if (isError) {
    return (
      <p className="font-sarabun text-body-md text-status-error" role="alert">
        {t("categoryLoadError")}
      </p>
    );
  }

  return (
    <div className="h-full w-full">
      <CategoryPieChart data={data?.categories ?? []} />
    </div>
  );
}
