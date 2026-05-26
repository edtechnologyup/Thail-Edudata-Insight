"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { SearchResultMock } from "@/data/mockData";
import type { ApiCategory } from "@/utils/categoryApi";
import {
  mapApiDatasetToSearchResult,
  type ApiPublishedDataset,
} from "@/utils/publicCategoryApi";

type DatasetsListResponse = {
  success: boolean;
  data: ApiPublishedDataset[];
};

async function fetchPublishedDatasets(
  categoryIds: string[],
  categories: ApiCategory[]
): Promise<SearchResultMock[]> {
  if (categoryIds.length === 0) {
    return [];
  }

  const res = await apiClient.get<DatasetsListResponse>("/datasets", {
    params: { page: 1, page_size: 100, sort: "updated_at", order: "desc" },
  });

  const idSet = new Set(categoryIds);
  const categoryById = new Map(
    categories.map((c) => [String(c.id), c] as const)
  );

  return (res.data.data ?? [])
    .filter(
      (d) => d.category_id != null && idSet.has(String(d.category_id))
    )
    .map((d) => mapApiDatasetToSearchResult(d, categoryById));
}

export function useCategoryDatasets(
  categoryIds: string[],
  categories: ApiCategory[] | undefined
) {
  return useQuery({
    queryKey: ["datasets", "by-category", categoryIds],
    queryFn: () => fetchPublishedDatasets(categoryIds, categories ?? []),
    enabled: categoryIds.length > 0 && (categories?.length ?? 0) > 0,
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
