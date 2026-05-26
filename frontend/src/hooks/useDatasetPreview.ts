"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { DatasetPreviewData } from "@/types/dataset";

/** GET /api/v1/datasets/{id}/preview — ไม่ต้อง Auth */
export function useDatasetPreview(datasetId: string, enabled = true) {
  return useQuery<DatasetPreviewData, Error>({
    queryKey: ["datasets", datasetId, "preview"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DatasetPreviewData }>(
        `/datasets/${datasetId}/preview`,
        { timeout: 120000 }
      );
      return res.data.data;
    },
    enabled: Boolean(datasetId) && enabled,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
