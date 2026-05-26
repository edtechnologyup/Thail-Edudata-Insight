"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { DatasetCitationData } from "@/types/dataset";

/** GET /api/v1/datasets/{id}/citation — ไม่ต้อง Auth */
export function useDatasetCitation(datasetId: string, enabled = true) {
  return useQuery<DatasetCitationData, Error>({
    queryKey: ["datasets", datasetId, "citation"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DatasetCitationData }>(
        `/datasets/${datasetId}/citation`
      );
      return res.data.data;
    },
    enabled: Boolean(datasetId) && enabled,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}
