"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type CategoryStatItem = {
  id: string | null;
  name_th: string;
  name_en: string;
  slug: string;
  count: number;
};

export type StatsByCategoryData = {
  categories: CategoryStatItem[];
  datasets_by_year: { year: number; count: number }[];
  selected_category_id: string | null;
};

export function useStatsByCategory(categoryId?: string | null) {
  return useQuery<StatsByCategoryData, Error>({
    queryKey: ["stats", "by-category", categoryId ?? "all"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: StatsByCategoryData }>(
        "/stats/by-category",
        {
          params: categoryId ? { category_id: categoryId } : undefined,
        }
      );
      return res.data.data;
    },
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
