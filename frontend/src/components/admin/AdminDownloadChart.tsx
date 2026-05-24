"use client";

import { useLocale, useTranslations } from "next-intl";
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
import type { AdminMonthlyCount } from "@/data/mockData";

type AdminDownloadChartProps = {
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
    <div className="rounded-radius-md border border-border-default bg-surface-navy px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-caption text-white/70">{label}</p>
      <p className="font-kanit text-label font-semibold text-white">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminDownloadChart({ data }: AdminDownloadChartProps) {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();

  const chartData = data.map((point) => ({
    month: locale === "th" ? point.month : point.monthEn,
    count: point.count,
  }));

  return (
    <section className="rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3 font-semibold text-text-primary">
          {t("downloadChart")}
        </h2>
        <div className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-radius-full bg-primary-action" />
          <span className="font-sarabun text-caption text-text-muted">
            {t("downloadLegend")}
          </span>
        </div>
      </div>
      <div className="h-64 w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
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
              stroke={CHART_COLORS.student}
              strokeWidth={3}
              dot={{ r: 4, fill: CHART_COLORS.student }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
