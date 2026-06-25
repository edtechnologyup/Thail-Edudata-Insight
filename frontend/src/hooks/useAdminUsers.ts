"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
const ADMIN_USERS_PAGE_SIZE = 5;
import type { AdminUser, AdminUsersFilters, AdminUsersResult } from "@/types/admin";

type ApiAdminUser = {
  id: string;
  email: string;
  role: string;
  status: string;
  agency_name: string | null;
  reject_reason: string | null;
  created_at: string;
};

type AdminUsersListResponse = {
  success: boolean;
  data: ApiAdminUser[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

function mapAdminUser(user: ApiAdminUser): AdminUser {
  const agencyName = user.agency_name?.trim() || user.email;
  const role = user.role === "admin" ? "admin" : "agency";
  const status = user.status as AdminUser["status"];

  return {
    id: user.id,
    agencyName,
    agencyNameEn: agencyName,
    email: user.email,
    role,
    status:
      status === "pending" ||
      status === "active" ||
      status === "rejected" ||
      status === "suspended"
        ? status
        : "pending",
    createdAt: user.created_at,
    rejectReason: user.reject_reason ?? undefined,
  };
}

function buildQueryParams(filters?: AdminUsersFilters) {
  const params: Record<string, string | number> = {
    page: filters?.page ?? 1,
    page_size: ADMIN_USERS_PAGE_SIZE,
    sort: "created_at",
    order: "desc",
  };

  if (filters?.status && filters.status !== "all") {
    params.status = filters.status;
  }
  if (filters?.role && filters.role !== "all") {
    params.role = filters.role;
  }
  if (filters?.search?.trim()) {
    params.search = filters.search.trim();
  }

  return params;
}

async function fetchAdminUsers(
  filters?: AdminUsersFilters
): Promise<AdminUsersResult> {
  const res = await apiClient.get<AdminUsersListResponse>("/admin/users", {
    params: buildQueryParams(filters),
  });

  const pagination = res.data.pagination;

  return {
    data: (res.data.data ?? []).map(mapAdminUser),
    total: pagination.total_items,
    page: pagination.page,
    pageSize: pagination.page_size,
    totalPages: pagination.total_pages,
  };
}

/** GET /api/v1/admin/users — กรอง status/role/search ที่ backend */
export function useAdminUsers(filters?: AdminUsersFilters) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
