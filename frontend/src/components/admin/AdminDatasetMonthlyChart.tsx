"use client";

import { useLocale, useTranslations } from "next-intl";
import { useEffect, useRef, useState } from "react";
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
import {
  toChartData,
  useAdminMonthlyStats,
  useAdminStatsYears,
} from "@/hooks/useAdminMonthlyStats";

const CURRENT_YEAR = new Date().getFullYear();

function YearDropdown({
  value,
  options,
  onChange,
  label,
  prefix,
}: {
  value: number;
  options: number[];
  onChange: (v: number) => void;
  label: string;
  prefix: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 items-center gap-1.5 rounded-full border border-gray-200 bg-gray-100 px-4 font-sarabun text-label text-text-primary shadow-sm transition-all hover:border-[#0081A7]/30 hover:shadow-md"
        aria-label={label}
      >
        {prefix} {value}
        <svg className="h-4 w-4 text-gray-500" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
          <path d="M7 10l5 5 5-5z" />
        </svg>
      </button>
      {open && (
        <div className="absolute right-0 top-full z-30 mt-1.5 min-w-[120px] overflow-hidden rounded-2xl border border-gray-200 bg-white py-1 shadow-lg">
          {options.map((y) => (
            <button
              key={y}
              type="button"
              onClick={() => { onChange(y); setOpen(false); }}
              className={`flex w-full px-4 py-2.5 font-sarabun text-label transition-colors ${
                y === value
                  ? "bg-[#053F5C]/10 font-bold text-[#053F5C]"
                  : "text-text-primary hover:bg-gray-50"
              }`}
            >
              {prefix} {y}
            </button>
          ))}
        </div>
      )}
    </div>
  );
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
    <div className="rounded-lg border border-gray-200 bg-[#053F5C] px-3 py-2 shadow-lg">
      <p className="font-sarabun text-caption text-white/70">{label}</p>
      <p className="font-kanit text-label font-semibold text-white">
        {payload[0].value.toLocaleString()}
      </p>
    </div>
  );
}

export default function AdminDatasetMonthlyChart() {
  const t = useTranslations("admin.dashboard");
  const locale = useLocale();

  const { data: availableYears = [] } = useAdminStatsYears();
  const defaultYear = availableYears[0] ?? CURRENT_YEAR;
  const [year, setYear] = useState<number | null>(null);
  const selectedYear = year ?? defaultYear;

  const { data, isLoading, isError } = useAdminMonthlyStats(selectedYear);

  const chartData = data
    ? toChartData(data.datasets_by_month, locale).map((p) => ({
        label: p.month,
        count: p.count,
      }))
    : toChartData([], locale).map((p) => ({ label: p.month, count: p.count }));

  return (
    <section
      className="rounded-2xl p-6 shadow-sm transition-shadow hover:shadow-md"
      style={{
        background: "rgba(255,255,255,0.9)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(0,129,167,0.08)",
      }}
    >
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="font-kanit text-heading-3 font-bold text-[#053F5C]">
          {t("datasetMonthlyChart", { defaultValue: "Dataset รายเดือน" })}
        </h2>
        <YearDropdown
          value={selectedYear}
          options={availableYears}
          onChange={(v) => setYear(v)}
          label={t("yearLabel", { defaultValue: "เลือกปี" })}
          prefix={t("yearPrefix", { defaultValue: "ปี" })}
        />
      </div>

      {isError && (
        <p className="py-8 text-center font-sarabun text-caption text-status-error">
          {t("chartLoadError", { defaultValue: "โหลดข้อมูลไม่สำเร็จ" })}
        </p>
      )}

      <div
        className={`h-64 w-full min-w-0 transition-opacity ${isLoading ? "opacity-40" : "opacity-100"}`}
      >
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id="grad-dataset-bar" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0081A7" stopOpacity={0.9} />
                <stop offset="100%" stopColor="#00AFB9" stopOpacity={0.6} />
              </linearGradient>
            </defs>
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
              width={36}
              allowDecimals={false}
            />
            <Tooltip content={<ChartTooltip />} />
            <Bar
              dataKey="count"
              fill="url(#grad-dataset-bar)"
              radius={[6, 6, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
