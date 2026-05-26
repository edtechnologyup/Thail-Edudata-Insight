"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { ApiDataset } from "@/types/dataset";
import { assertPublishedDataset } from "@/utils/datasetDetailMappers";

/** GET /api/v1/datasets/{id} — ไม่ต้อง Auth (published เท่านั้น) */
export function useDatasetDetail(datasetId: string) {
  return useQuery<ApiDataset, Error>({
    queryKey: ["datasets", datasetId],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ApiDataset }>(
        `/datasets/${datasetId}`
      );
      const data = res.data.data;
      if (!data) {
        const err = new Error("DATASET_NOT_FOUND");
        (err as Error & { code?: string }).code = "DATASET_NOT_FOUND";
        throw err;
      }
      assertPublishedDataset(data);
      return data;
    },
    enabled: Boolean(datasetId),
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
