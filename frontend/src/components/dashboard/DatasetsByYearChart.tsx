"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import { useStatsOverview } from "@/hooks/useStatsOverview";

const DATASET_YEAR_COLOR = "#00a896";

function toDisplayYear(year: number, locale: string): string {
  if (locale === "th") {
    return String(year + 543);
  }
  return String(year);
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-text-muted">{label}</p>
      <p className="font-kanit text-label font-semibold text-text-primary">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <div className="mb-6 h-7 w-48 rounded-radius-sm bg-surface-container" />
      <div className="h-[280px] rounded-radius-md bg-surface-container" />
    </div>
  );
}

export default function DatasetsByYearChart() {
  const t = useTranslations("stats");
  const locale = useLocale();
  const { data: stats, isLoading, isError } = useStatsOverview();

  const chartData = useMemo(() => {
    const rows = stats?.datasets_by_year ?? [];
    return [...rows]
      .sort((a, b) => a.year - b.year)
      .map((row) => ({
        year: toDisplayYear(row.year, locale),
        count: row.count,
      }));
  }, [stats?.datasets_by_year, locale]);

  if (isLoading) {
    return <ChartSkeleton />;
  }

  if (isError) {
    return (
      <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {t("loadError")}
        </p>
      </div>
    );
  }

  const isEmpty = chartData.length === 0;

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
      <h2 className="mb-6 font-kanit text-heading-3-mobile font-semibold text-text-primary md:text-heading-3">
        {t("datasetsByYear")}
      </h2>
      {isEmpty ? (
        <p className="flex min-h-[240px] items-center justify-center font-sarabun text-body-md text-text-muted">
          {t("noChartData")}
        </p>
      ) : (
        <div className="h-[280px] w-full min-w-0 md:h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid
                stroke={CHART_COLORS.grid}
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                dataKey="year"
                tick={{ fill: "#6c7a76", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fill: "#6c7a76", fontSize: 11 }}
                axisLine={false}
                tickLine={false}
                width={48}
                allowDecimals={false}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar
                dataKey="count"
                fill={DATASET_YEAR_COLOR}
                radius={[2, 2, 0, 0]}
                maxBarSize={56}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
