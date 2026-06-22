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
      className="rounded-full px-4 py-1.5 font-sarabun text-label font-bold transition-all"
      style={
        active
          ? { backgroundColor: "#1a3a2a", color: "#ffffff" }
          : { backgroundColor: "transparent", color: "#6b7280" }
      }
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
    <div className="rounded-xl border border-border-default/60 bg-white px-4 py-2.5 shadow-level-2">
      <p className="font-sarabun text-caption font-medium text-text-muted">{label}</p>
      <p className="font-kanit text-label font-bold" style={{ color: "#1a3a2a" }}>
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
    <div className="rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 md:p-6">
      <div className="mb-5 flex items-center gap-2">
        <svg className="h-5 w-5" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <h2 className="font-kanit text-heading-3-mobile font-bold md:text-heading-3" style={{ color: "#1a3a2a" }}>
          {t("analysisTitle")}
        </h2>
      </div>

      {/* ตัวกรอง */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-1 rounded-full border border-border-default/60 bg-gray-50 p-1">
          {(["datasets", "downloads", "views"] as Metric[]).map((m) => (
            <FilterButton key={m} active={metric === m} onClick={() => setMetric(m)}>
              {metricLabels[m]}
            </FilterButton>
          ))}
        </div>

        <select
          value={selectedCategoryId ?? ""}
          onChange={(e) => setSelectedCategoryId(e.target.value || null)}
          className="rounded-full border border-border-default/60 bg-gray-50 px-4 py-2 font-sarabun text-label text-text-primary transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">{t("allCategories")}</option>
          {categories.map((cat) => (
            <option key={cat.id ?? "uncategorized"} value={cat.id ?? ""}>
              {isTh ? cat.name_th : cat.name_en}
            </option>
          ))}
        </select>

        <div className="flex items-center gap-1 rounded-full border border-border-default/60 bg-gray-50 p-1">
          <FilterButton active={chartType === "bar"} onClick={() => setChartType("bar")}>
            {t("chartBar")}
          </FilterButton>
          <FilterButton active={chartType === "line"} onClick={() => setChartType("line")}>
            {t("chartLine")}
          </FilterButton>
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
