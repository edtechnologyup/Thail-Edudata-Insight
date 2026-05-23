"use client";

import { useLocale, useTranslations } from "next-intl";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import type { AgencyMonthlyDownload } from "@/data/mockData";

type DownloadChartProps = {
  data: AgencyMonthlyDownload[];
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

export default function DownloadChart({ data }: DownloadChartProps) {
  const t = useTranslations("agency.dashboard");
  const locale = useLocale();

  const chartData = data.map((point) => ({
    month: locale === "th" ? point.month : point.monthEn,
    count: point.count,
  }));

  return (
    <section className="overflow-hidden rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3-mobile font-semibold text-text-primary">
          {t("downloadChart")}
        </h2>
        <button
          type="button"
          className="rounded-radius-lg border border-surface-navy px-4 py-2 font-sarabun text-label font-medium text-surface-navy transition-colors hover:bg-surface-container"
        >
          {t("viewDetails")}
        </button>
      </div>
      <div className="h-[250px] w-full min-w-0">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="agencyDownloadFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={CHART_COLORS.student} stopOpacity={0.2} />
                <stop offset="100%" stopColor={CHART_COLORS.student} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke={CHART_COLORS.grid} strokeDasharray="3 3" />
            <XAxis
              dataKey="month"
              tick={{ fill: "#6c7a76", fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6c7a76", fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip content={<ChartTooltip />} />
            <Area
              type="monotone"
              dataKey="count"
              stroke={CHART_COLORS.student}
              strokeWidth={3}
              fill="url(#agencyDownloadFill)"
              dot={{ r: 4, fill: CHART_COLORS.student }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
