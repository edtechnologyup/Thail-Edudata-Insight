"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import { useStatsByCategory } from "@/hooks/useStatsByCategory";
import type { CategoryStatItem } from "@/hooks/useStatsByCategory";

type Metric = "datasets" | "downloads" | "views";
type ChartType = "bar" | "line";

function FilterButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-radius-full px-4 py-1.5 font-sarabun text-label font-medium transition-all ${
        active
          ? "bg-primary text-white shadow-level-1"
          : "bg-surface-container text-text-secondary hover:bg-primary-light hover:text-primary-dark"
      }`}
    >
      {children}
    </button>
  );
}

function ChartTooltipContent({
  active,
  payload,
  label,
  metricLabel,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  metricLabel: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-card px-4 py-2.5 shadow-level-2">
      <p className="font-sarabun text-caption font-medium text-text-muted">{label}</p>
      <p className="font-kanit text-label font-bold text-primary-dark">
        {payload[0].value.toLocaleString()} {metricLabel}
      </p>
    </div>
  );
}

export default function StatsAnalysisChart() {
  const t = useTranslations("stats");
  const locale = useLocale();
  const isTh = locale === "th";

  const [metric, setMetric] = useState<Metric>("datasets");
  const [chartType, setChartType] = useState<ChartType>("bar");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  const { data, isLoading } = useStatsByCategory(selectedCategoryId);

  const categories: CategoryStatItem[] = useMemo(() => {
    if (!data) return [];
    return data.categories.filter((c) => c.count > 0);
  }, [data]);

  const chartData = useMemo(() => {
    if (!data?.metrics_by_year) return [];
    return data.metrics_by_year.map((item) => ({
      year: locale === "th" ? `${item.year + 543}` : `${item.year}`,
      value: item[metric],
    }));
  }, [data, metric, locale]);

  const metricLabels: Record<Metric, string> = {
    datasets: t("metricDatasets"),
    downloads: t("metricDownloads"),
    views: t("metricViews"),
  };

  const chartColor = CHART_COLORS.pie[0];

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-5 shadow-level-1 md:p-6">
      <h2 className="mb-5 font-kanit text-heading-3-mobile font-semibold text-text-primary md:text-heading-3">
        {t("analysisTitle")}
      </h2>

      {/* ตัวกรอง */}
      <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:gap-6">
        {/* ข้อมูลที่แสดง */}
        <div className="flex flex-col gap-2">
          <span className="font-sarabun text-caption font-medium text-text-muted">
            {t("filterMetric")}
          </span>
          <div className="flex flex-wrap gap-2">
            {(["datasets", "downloads", "views"] as Metric[]).map((m) => (
              <FilterButton key={m} active={metric === m} onClick={() => setMetric(m)}>
                {metricLabels[m]}
              </FilterButton>
            ))}
          </div>
        </div>

        {/* หมวดหมู่ */}
        <div className="flex flex-col gap-2">
          <span className="font-sarabun text-caption font-medium text-text-muted">
            {t("filterCategory")}
          </span>
          <select
            value={selectedCategoryId ?? ""}
            onChange={(e) => setSelectedCategoryId(e.target.value || null)}
            className="min-w-[180px] rounded-radius-md border border-border-input bg-surface-card px-3 py-2 font-sarabun text-label text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">{t("allCategories")}</option>
            {categories.map((cat) => (
              <option key={cat.id ?? "uncategorized"} value={cat.id ?? ""}>
                {isTh ? cat.name_th : cat.name_en}
              </option>
            ))}
          </select>
        </div>

        {/* แบบกราฟ */}
        <div className="flex flex-col gap-2">
          <span className="font-sarabun text-caption font-medium text-text-muted">
            {t("filterChartType")}
          </span>
          <div className="flex gap-2">
            <FilterButton active={chartType === "bar"} onClick={() => setChartType("bar")}>
              {t("chartBar")}
            </FilterButton>
            <FilterButton active={chartType === "line"} onClick={() => setChartType("line")}>
              {t("chartLine")}
            </FilterButton>
          </div>
        </div>
      </div>

      {/* กราฟ */}
      <div className="h-72 w-full md:h-80">
        {isLoading ? (
          <div className="flex h-full items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary/30 border-t-primary" />
          </div>
        ) : chartData.length === 0 ? (
          <p className="flex h-full items-center justify-center font-sarabun text-body-md text-text-muted">
            {t("noChartData")}
          </p>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {chartType === "bar" ? (
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default, #e5e7eb)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 13, fill: "var(--color-text-muted, #6b7280)" }}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "var(--color-text-muted, #6b7280)" }}
                  width={50}
                />
                <Tooltip content={<ChartTooltipContent metricLabel={metricLabels[metric]} />} />
                <Bar dataKey="value" fill={chartColor} radius={[6, 6, 0, 0]} maxBarSize={56} />
              </BarChart>
            ) : (
              <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-default, #e5e7eb)" />
                <XAxis
                  dataKey="year"
                  tick={{ fontSize: 13, fill: "var(--color-text-muted, #6b7280)" }}
                />
                <YAxis
                  tick={{ fontSize: 13, fill: "var(--color-text-muted, #6b7280)" }}
                  width={50}
                />
                <Tooltip content={<ChartTooltipContent metricLabel={metricLabels[metric]} />} />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke={chartColor}
                  strokeWidth={3}
                  dot={{ r: 5, fill: chartColor, strokeWidth: 2, stroke: "#fff" }}
                  activeDot={{ r: 7, strokeWidth: 2 }}
                />
              </LineChart>
            )}
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
