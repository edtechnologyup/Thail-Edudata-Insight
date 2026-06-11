"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import {
  toYearlyChartData,
  useAdminDownloadSourceMonthly,
  useAdminDownloadSourceYearly,
} from "@/hooks/useAdminDownloadStats";
import { toChartData, useAdminStatsYears } from "@/hooks/useAdminMonthlyStats";

const CURRENT_YEAR = new Date().getFullYear();

type Granularity = "month" | "year";

type AdminDownloadSourceChartProps = {
  source: "web" | "api";
};

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
    <div className="rounded-radius-md border border-border-default bg-surface-navy px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-white/70">{label}</p>
      <p className="font-kanit text-label font-semibold text-white">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminDownloadSourceChart({
  source,
}: AdminDownloadSourceChartProps) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const [granularity, setGranularity] = useState<Granularity>("month");

  const { data: availableYears = [] } = useAdminStatsYears();
  const defaultYear = availableYears[0] ?? CURRENT_YEAR;
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? defaultYear;

  const monthlyQuery = useAdminDownloadSourceMonthly(selectedYear);
  const yearlyQuery = useAdminDownloadSourceYearly();

  const isLoading =
    granularity === "month" ? monthlyQuery.isLoading : yearlyQuery.isLoading;
  const isError =
    granularity === "month" ? monthlyQuery.isError : yearlyQuery.isError;

  const emptyMonths = toChartData([], locale).map((p) => ({
    label: p.month,
    count: p.count,
  }));

  const chartData =
    granularity === "month"
      ? monthlyQuery.data
        ? toChartData(
            source === "web"
              ? monthlyQuery.data.web_by_month
              : monthlyQuery.data.api_by_month,
            locale
          ).map((p) => ({ label: p.month, count: p.count }))
        : emptyMonths
      : yearlyQuery.data
        ? toYearlyChartData(
            source === "web"
              ? yearlyQuery.data.web_by_year
              : yearlyQuery.data.api_by_year
          )
        : [];

  const lineColor =
    source === "web" ? CHART_COLORS.downloadWeb : CHART_COLORS.downloadApi;

  const toggleClass = (active: boolean) =>
    `min-h-[36px] rounded-radius-sm px-3 font-sarabun text-caption font-medium transition-colors ${
      active
        ? "bg-primary-dark text-white"
        : "bg-surface-container text-text-secondary hover:text-primary-dark"
    }`;

  return (
    <section className="rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
          {source === "web" ? t("webDownloadChart") : t("apiDownloadChart")}
        </h2>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setGranularity("month")}
            className={toggleClass(granularity === "month")}
          >
            {t("monthlyToggle")}
          </button>
          <button
            type="button"
            onClick={() => setGranularity("year")}
            className={toggleClass(granularity === "year")}
          >
            {t("yearlyToggle")}
          </button>
          {granularity === "month" && (
            <select
              value={selectedYear}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 rounded-radius-sm border border-border-input bg-surface-container px-3 font-sarabun text-label text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
              aria-label={t("yearLabel")}
            >
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {t("yearPrefix")} {y}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {isError && (
        <p className="py-8 text-center font-sarabun text-caption text-status-error">
          {t("chartLoadError")}
        </p>
      )}

      <div
        className={`h-64 w-full min-w-0 transition-opacity ${isLoading ? "opacity-40" : "opacity-100"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="label"
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
              tickFormatter={(value) =>
                value >= 1000 ? `${Math.round(value / 1000)}k` : String(value)
              }
            />
            <Tooltip content={<ChartTooltip />} />
            <Line
              type="monotone"
              dataKey="count"
              stroke={lineColor}
              strokeWidth={3}
              dot={{ r: 4, fill: lineColor }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
