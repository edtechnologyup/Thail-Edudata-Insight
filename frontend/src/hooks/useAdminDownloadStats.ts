"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { MonthlyDataPoint } from "@/hooks/useAdminMonthlyStats";

export type YearlyDataPoint = {
  year: number;
  count: number;
};

export type DownloadSourceMonthly = {
  year: number;
  web_by_month: MonthlyDataPoint[];
  api_by_month: MonthlyDataPoint[];
};

export type DownloadSourceYearly = {
  web_by_year: YearlyDataPoint[];
  api_by_year: YearlyDataPoint[];
};

async function fetchDownloadSourceMonthly(
  year: number
): Promise<DownloadSourceMonthly> {
  const res = await apiClient.get<{ data: DownloadSourceMonthly }>(
    "/admin/stats/downloads",
    { params: { granularity: "month", year } }
  );
  return res.data.data;
}

export function useAdminDownloadSourceMonthly(year: number) {
  return useQuery({
    queryKey: ["admin", "stats", "downloads", "month", year],
    queryFn: () => fetchDownloadSourceMonthly(year),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

async function fetchDownloadSourceYearly(): Promise<DownloadSourceYearly> {
  const res = await apiClient.get<{ data: DownloadSourceYearly }>(
    "/admin/stats/downloads",
    { params: { granularity: "year" } }
  );
  return res.data.data;
}

export function useAdminDownloadSourceYearly() {
  return useQuery({
    queryKey: ["admin", "stats", "downloads", "year"],
    queryFn: fetchDownloadSourceYearly,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function toYearlyChartData(
  points: YearlyDataPoint[]
): { label: string; count: number }[] {
  return points.map((p) => ({ label: String(p.year), count: p.count }));
}
