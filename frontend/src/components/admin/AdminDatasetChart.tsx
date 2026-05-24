"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import type { AdminMonthlyCount } from "@/data/mockData";

type AdminDatasetChartProps = {
  data: AdminMonthlyCount[];
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
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-text-muted">{label}</p>
      <p className="font-kanit text-label font-semibold text-text-primary">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminDatasetChart({ data }: AdminDatasetChartProps) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();
  const [year, setYear] = useState("2024");

  const chartData = data.map((point) => ({
    month: locale === "th" ? point.month : point.monthEn,
    count: point.count,
  }));

  const maxCount = Math.max(...chartData.map((item) => item.count));

  return (
    <section className="rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
          {t("datasetChart")}
        </h2>
        <select
          value={year}
          onChange={(event) => setYear(event.target.value)}
          className="h-9 rounded-radius-sm border border-border-input bg-surface-container px-3 font-sarabun text-label text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          aria-label={t("yearLabel")}
        >
          <option value="2023">{t("year2023")}</option>
          <option value="2024">{t("year2024")}</option>
        </select>
      </div>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis hide />
            <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(0,168,150,0.08)" }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]} maxBarSize={48}>
              {chartData.map((entry) => (
                <Cell
                  key={entry.month}
                  fill={
                    entry.count === maxCount
                      ? CHART_COLORS.student
                      : `${CHART_COLORS.student}33`
                  }
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
