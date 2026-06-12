"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { Scholarship } from "@/hooks/useScholarships";

export type AdminScholarshipsParams = {
  status?: string;
  scholarship_type?: string;
  agency_id?: string;
  page?: number;
  page_size?: number;
};

type PaginationMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type AdminScholarshipsResult = {
  items: Scholarship[];
  pagination: PaginationMeta;
};

const STALE_TIME_MS = 30_000;

export function useAdminScholarships(params: AdminScholarshipsParams) {
  return useQuery<AdminScholarshipsResult, Error>({
    queryKey: ["admin", "scholarships", params],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: Scholarship[];
        pagination: PaginationMeta;
      }>("/admin/scholarships", {
        params: {
          status: params.status || undefined,
          scholarship_type: params.scholarship_type || undefined,
          agency_id: params.agency_id || undefined,
          page: params.page ?? 1,
          page_size: params.page_size ?? 20,
        },
      });

      return {
        items: res.data.data ?? [],
        pagination: res.data.pagination ?? {
          page: 1,
          page_size: 20,
          total_items: 0,
          total_pages: 0,
        },
      };
    },
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
}

export function useHideScholarship() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.post(`/admin/scholarships/${id}/hide`);
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "scholarships"] });
      queryClient.invalidateQueries({ queryKey: ["scholarships"] });
    },
  });
}
