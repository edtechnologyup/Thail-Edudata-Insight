"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type {
  AdminDashboardData,
  AdminMonthlyCount,
  AdminPendingUser,
} from "@/data/mockData";

type AdminStatsApiData = {
  total_users: number;
  total_datasets: number;
  total_downloads: number;
  pending_agencies: number;
  users_today: number;
  datasets_today: number;
  downloads_today: number;
};

type ApiAdminUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  agency_name: string | null;
  created_at: string;
};

type UsersListResponse = {
  success: boolean;
  data: ApiAdminUser[];
};

function mapMonthlyItems(
  items: { month: string; count: number; month_en?: string; monthEn?: string }[] | undefined
): AdminMonthlyCount[] {
  if (!items?.length) {
    return [];
  }
  return items.map((item) => ({
    month: item.month,
    monthEn: item.monthEn ?? item.month_en ?? item.month,
    count: item.count,
  }));
}

function agencyInitials(name: string): string {
  const trimmed = name.trim();
  if (!trimmed) return "—";
  const parts = trimmed.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return trimmed.slice(0, 2).toUpperCase();
}

function mapPendingUser(user: ApiAdminUser): AdminPendingUser {
  const agencyName = user.agency_name?.trim() || user.email;
  return {
    id: user.id,
    agencyName,
    agencyNameEn: agencyName,
    email: user.email,
    createdAt: user.created_at,
    initials: agencyInitials(agencyName),
  };
}

function trendPercent(today: number, total: number): number {
  if (total <= 0 || today <= 0) {
    return 0;
  }
  return Math.round((today / total) * 1000) / 10;
}

async function fetchPendingUsers(): Promise<AdminPendingUser[]> {
  const res = await apiClient.get<UsersListResponse>("/admin/users", {
    params: {
      page: 1,
      page_size: 100,
      sort: "created_at",
      order: "desc",
    },
  });

  return (res.data.data ?? [])
    .filter((user) => user.role === "agency" && user.status === "pending")
    .map(mapPendingUser);
}

async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  const [statsRes, pendingUserList] = await Promise.all([
    apiClient.get<{ data: AdminStatsApiData }>("/admin/stats"),
    fetchPendingUsers(),
  ]);

  const stats = statsRes.data.data;
  if (!stats) {
    throw new Error("โหลดข้อมูล Admin Dashboard ไม่สำเร็จ");
  }

  const apiWithCharts = stats as AdminStatsApiData & {
    datasets_by_month?: { month: string; count: number; month_en?: string }[];
    downloads_by_month?: { month: string; count: number; month_en?: string }[];
    pending_users?: number;
    today_downloads?: number;
  };

  return {
    totalUsers: stats.total_users,
    totalDatasets: stats.total_datasets,
    pendingUsers: apiWithCharts.pending_users ?? stats.pending_agencies,
    todayDownloads: apiWithCharts.today_downloads ?? stats.downloads_today,
    userTrendPercent: trendPercent(stats.users_today, stats.total_users),
    datasetTrendPercent: trendPercent(stats.datasets_today, stats.total_datasets),
    datasetsByMonth: mapMonthlyItems(apiWithCharts.datasets_by_month),
    downloadsByMonth: mapMonthlyItems(apiWithCharts.downloads_by_month),
    pendingUserList,
  };
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
