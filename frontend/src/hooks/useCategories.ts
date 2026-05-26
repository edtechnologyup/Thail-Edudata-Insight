"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { ApiCategory } from "@/utils/categoryApi";

type CategoriesListResponse = {
  success: boolean;
  data: ApiCategory[];
};

async function fetchPublicCategories(): Promise<ApiCategory[]> {
  const res = await apiClient.get<CategoriesListResponse>("/categories");
  return res.data.data ?? [];
}

/** GET /api/v1/categories — หมวดหมู่สาธารณะ (ไม่ต้อง login) */
export function useCategories() {
  return useQuery({
    queryKey: ["categories", "public"],
    queryFn: fetchPublicCategories,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
