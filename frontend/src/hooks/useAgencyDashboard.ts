"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type {
  AgencyDashboardStats,
  AgencyMonthlyDownload,
} from "@/data/mockData";

type ApiMonthlyDownload = {
  month: string;
  count: number;
  monthEn?: string;
  month_en?: string;
};

type ApiAgencyDashboardData = {
  total_datasets?: number | null;
  published_datasets?: number | null;
  draft_datasets?: number | null;
  submitted_datasets?: number | null;
  total_downloads?: number | null;
  monthly_downloads?: ApiMonthlyDownload[] | null;
  datasets_created_this_month?: number | null;
  datasets_created_last_month?: number | null;
  datasets_month_change_percent: number | null;
  downloads_this_month?: number | null;
  top_download_format: string | null;
  top_download_format_percent: number | null;
};

function numberOrZero(value: number | null | undefined): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapMonthlyDownloads(
  items: ApiMonthlyDownload[] | null | undefined
): AgencyMonthlyDownload[] {
  return (items ?? []).map((item) => ({
    month: item.month,
    monthEn: item.monthEn ?? item.month_en ?? item.month,
    count: numberOrZero(item.count),
  }));
}

function mapAgencyDashboard(data: ApiAgencyDashboardData): AgencyDashboardStats {
  return {
    totalDatasets: numberOrZero(data.total_datasets),
    publishedDatasets: numberOrZero(data.published_datasets),
    draftDatasets: numberOrZero(data.draft_datasets),
    submittedDatasets: numberOrZero(data.submitted_datasets),
    totalDownloads: numberOrZero(data.total_downloads),
    monthlyDownloads: mapMonthlyDownloads(data.monthly_downloads),
    datasetsCreatedThisMonth: numberOrZero(data.datasets_created_this_month),
    datasetsCreatedLastMonth: numberOrZero(data.datasets_created_last_month),
    datasetsMonthChangePercent: data.datasets_month_change_percent ?? null,
    downloadsThisMonth: numberOrZero(data.downloads_this_month),
    topDownloadFormat: data.top_download_format ?? null,
    topDownloadFormatPercent: data.top_download_format_percent ?? null,
  };
}

async function fetchAgencyDashboard(): Promise<AgencyDashboardStats> {
  const res = await apiClient.get<{ data: ApiAgencyDashboardData }>(
    "/agency/dashboard"
  );
  const data = res.data?.data;
  if (!data) {
    throw new Error("โหลดข้อมูล Dashboard ไม่สำเร็จ");
  }
  return mapAgencyDashboard(data);
}

export function useAgencyDashboard() {
  return useQuery({
    queryKey: ["agency", "dashboard"],
    queryFn: fetchAgencyDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
