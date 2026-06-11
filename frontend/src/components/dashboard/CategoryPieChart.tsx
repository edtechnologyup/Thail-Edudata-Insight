"use client";

import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import type { CategoryStatItem } from "@/hooks/useStatsByCategory";

type CategoryPieChartProps = {
  data: CategoryStatItem[];
  selectedCategoryId?: string | null;
};

function ChartTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: { name: string; value: number }[];
}) {
  if (!active || !payload?.length) return null;
  const item = payload[0];
  return (
    <div className="rounded-radius-md border border-border-default bg-surface-card px-3 py-2 shadow-level-2">
      <p className="font-sarabun text-label font-medium text-text-primary">
        {item.name}
      </p>
      <p className="font-kanit text-label font-semibold text-primary-dark">
        {item.value}
      </p>
    </div>
  );
}

export default function CategoryPieChart({
  data,
  selectedCategoryId = null,
}: CategoryPieChartProps) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const isTh = locale === "th";

  const chartData = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      id: item.id,
      name: isTh ? item.name_th : item.name_en,
      value: item.count,
    }))
    .sort((a, b) => b.value - a.value);

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="flex h-full flex-col rounded-radius-lg border border-border-default bg-surface-card p-5 shadow-level-1 md:p-6">
      <h2 className="mb-4 font-kanit text-heading-3-mobile font-semibold text-text-primary md:mb-5 md:text-heading-3">
        {t("datasetByCategory")}
      </h2>
      {total === 0 ? (
        <p className="flex flex-1 items-center justify-center py-12 font-sarabun text-body-md text-text-muted">
          {t("noChartData")}
        </p>
      ) : (
        <div className="flex flex-1 flex-col items-center gap-6 md:flex-row md:items-center md:gap-8">
          <div className="relative mx-auto h-56 w-56 shrink-0 sm:h-64 sm:w-64 md:mx-0 md:h-72 md:w-72 lg:h-80 lg:w-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="58%"
                  outerRadius="82%"
                  paddingAngle={2}
                >
                  {chartData.map((item, index) => {
                    const color =
                      CHART_COLORS.pie[index % CHART_COLORS.pie.length];
                    const isSelected =
                      selectedCategoryId && item.id === selectedCategoryId;
                    return (
                      <Cell
                        key={item.name}
                        fill={color}
                        stroke={isSelected ? "#111827" : undefined}
                        strokeWidth={isSelected ? 2 : 0}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={<ChartTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-kanit text-heading-2 font-bold text-text-primary md:text-heading-1">
                {total}
              </span>
              <span className="font-sarabun text-caption text-text-muted">
                {t("totalDatasets")}
              </span>
            </div>
          </div>
          <ul className="flex w-full flex-1 flex-col justify-center gap-2.5 md:max-h-80 md:gap-3 md:overflow-y-auto md:pr-1">
            {chartData.map((item, index) => {
              const percent = Math.round((item.value / total) * 100);
              const color =
                CHART_COLORS.pie[index % CHART_COLORS.pie.length];
              return (
                <li
                  key={item.name}
                  className="flex items-center justify-between gap-3 rounded-radius-sm px-1 py-0.5 font-sarabun text-label"
                >
                  <div className="flex min-w-0 items-center gap-2">
                    <span
                      className="h-3 w-3 shrink-0 rounded-radius-full"
                      style={{ backgroundColor: color }}
                      aria-hidden
                    />
                    <span className="truncate text-text-secondary">
                      {item.name}
                    </span>
                  </div>
                  <span className="shrink-0 text-right font-semibold tabular-nums text-text-primary">
                    <span className="block">{item.value.toLocaleString(locale)}</span>
                    <span className="font-sarabun text-caption font-medium text-text-muted">
                      {percent}%
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
