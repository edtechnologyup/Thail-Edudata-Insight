"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Cell, Pie, PieChart, ResponsiveContainer, Sector } from "recharts";
import { CHART_COLORS } from "@/constants/chartColors";
import type { CategoryStatItem } from "@/hooks/useStatsByCategory";

type CategoryPieChartProps = {
  data: CategoryStatItem[];
};

type ChartItem = {
  id: string | null;
  name: string;
  value: number;
  download_count: number;
  view_count: number;
};

function ActiveShape(props: any) {
  const {
    cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill,
  } = props;
  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius - 4}
        outerRadius={outerRadius + 8}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
        stroke="#111827"
        strokeWidth={2}
      />
    </g>
  );
}

function CategoryDetail({
  item,
  color,
  total,
  locale,
}: {
  item: ChartItem;
  color: string;
  total: number;
  locale: string;
}) {
  const t = useTranslations("stats");
  const base = `/${locale}`;
  const percent = Math.round((item.value / total) * 100);
  const numLocale = locale === "th" ? "th-TH" : "en-US";

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2.5">
        <span
          className="h-4 w-4 shrink-0 rounded-radius-full"
          style={{ backgroundColor: color }}
          aria-hidden
        />
        <h3 className="font-kanit text-label font-bold text-text-primary">
          {item.name}
        </h3>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div className="rounded-radius-md bg-primary-light/50 px-3 py-2">
          <p className="font-sarabun text-caption font-medium text-text-muted">{t("datasetCount")}</p>
          <p className="font-kanit text-label font-bold text-primary-dark">
            {item.value.toLocaleString(numLocale)} <span className="text-caption font-medium text-text-muted">({percent}%)</span>
          </p>
        </div>
        <div className="rounded-radius-md bg-surface-container/60 px-3 py-2">
          <p className="font-sarabun text-caption font-medium text-text-muted">{t("downloads")}</p>
          <p className="font-kanit text-label font-bold text-text-primary">
            {item.download_count.toLocaleString(numLocale)}
          </p>
        </div>
        <div className="rounded-radius-md bg-surface-container/60 px-3 py-2">
          <p className="font-sarabun text-caption font-medium text-text-muted">{t("views")}</p>
          <p className="font-kanit text-label font-bold text-text-primary">
            {item.view_count.toLocaleString(numLocale)}
          </p>
        </div>
      </div>

      {item.id && item.id !== "__others__" && (
        <Link
          href={`${base}/search?category=${item.id}`}
          className="inline-flex items-center justify-center gap-2 rounded-radius-md bg-primary px-4 py-2 font-sarabun text-caption font-medium text-white transition-colors hover:bg-primary-hover"
        >
          {t("viewAllDatasets")}
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      )}
    </div>
  );
}

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  const t = useTranslations("stats");
  const locale = useLocale();
  const isTh = locale === "th";
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const TOP_CATEGORY_LIMIT = 6;

  const sortedData: ChartItem[] = data
    .filter((item) => item.count > 0)
    .map((item) => ({
      id: item.id,
      name: isTh ? item.name_th : item.name_en,
      value: item.count,
      download_count: item.download_count ?? 0,
      view_count: item.view_count ?? 0,
    }))
    .sort((a, b) => b.value - a.value);

  const chartData: ChartItem[] =
    sortedData.length > TOP_CATEGORY_LIMIT + 1
      ? [
          ...sortedData.slice(0, TOP_CATEGORY_LIMIT),
          sortedData.slice(TOP_CATEGORY_LIMIT).reduce(
            (acc, item) => ({
              ...acc,
              value: acc.value + item.value,
              download_count: acc.download_count + item.download_count,
              view_count: acc.view_count + item.view_count,
            }),
            {
              id: "__others__",
              name: isTh ? "อื่นๆ" : "Others",
              value: 0,
              download_count: 0,
              view_count: 0,
            } as ChartItem
          ),
        ]
      : sortedData;

  const pieColor = (item: ChartItem, index: number) =>
    item.id === "__others__"
      ? "#9e9e9e"
      : CHART_COLORS.pie[index % CHART_COLORS.pie.length];

  const total = chartData.reduce((sum, item) => sum + item.value, 0);

  const toggleDetail = useCallback((_: any, index: number) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  }, []);

  const selectedItem = activeIndex !== null ? chartData[activeIndex] : null;
  const selectedColor = selectedItem ? pieColor(selectedItem, activeIndex ?? 0) : "";

  return (
    <div className="rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1 md:p-6">
      <div className="mb-4 flex items-center gap-2">
        <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
        </svg>
        <h2 className="font-kanit text-heading-3-mobile font-bold text-primary md:text-heading-3">
          {t("datasetByCategory")}
        </h2>
      </div>
      {total === 0 ? (
        <p className="py-8 text-center font-sarabun text-body-md text-text-muted">
          {t("noChartData")}
        </p>
      ) : (
        <div className="flex flex-col items-center gap-5 md:flex-row md:items-start md:gap-6">
          {/* กราฟวงกลม */}
          <div className="relative h-56 w-56 shrink-0 sm:h-64 sm:w-64 md:h-72 md:w-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius="55%"
                  outerRadius="82%"
                  paddingAngle={2}
                  activeIndex={activeIndex ?? undefined}
                  activeShape={ActiveShape}
                  onClick={toggleDetail}
                >
                  {chartData.map((item, index) => {
                    const color = pieColor(item, index);
                    const dimmed = activeIndex !== null && activeIndex !== index;
                    return (
                      <Cell
                        key={item.name}
                        fill={color}
                        opacity={dimmed ? 0.35 : 1}
                        className="cursor-pointer transition-opacity duration-200"
                      />
                    );
                  })}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="font-kanit text-heading-3-mobile font-bold text-text-primary md:text-heading-2">
                {selectedItem ? selectedItem.value : total}
              </span>
              <span className="max-w-[80%] truncate text-center font-sarabun text-caption text-text-muted">
                {selectedItem ? selectedItem.name : t("totalDatasets")}
              </span>
            </div>
          </div>

          {/* รายชื่อหมวดหมู่ หรือ ข้อมูลรายละเอียด — สลับกัน */}
          <div className="w-full min-w-0 flex-1">
            {selectedItem ? (
              <CategoryDetail
                item={selectedItem}
                color={selectedColor}
                total={total}
                locale={locale}
              />
            ) : (
              <ul className="flex flex-col gap-0.5 md:max-h-72 md:overflow-y-auto md:pr-1">
                {chartData.map((item, index) => {
                  const percent = Math.round((item.value / total) * 100);
                  const color = pieColor(item, index);
                  return (
                    <li key={item.name}>
                      <button
                        type="button"
                        onClick={() => toggleDetail(null, index)}
                        className="flex w-full items-center justify-between gap-2 rounded-radius-md px-2.5 py-1.5 font-sarabun text-label transition-colors hover:bg-surface-container"
                      >
                        <div className="flex min-w-0 items-center gap-2">
                          <span
                            className="h-3 w-3 shrink-0 rounded-radius-full"
                            style={{ backgroundColor: color }}
                            aria-hidden
                          />
                          <span className="truncate font-medium text-text-secondary">
                            {item.name}
                          </span>
                        </div>
                        <span className="shrink-0 font-semibold tabular-nums text-text-primary">
                          {item.value.toLocaleString(locale)}{" "}
                          <span className="font-medium text-text-muted">({percent}%)</span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
