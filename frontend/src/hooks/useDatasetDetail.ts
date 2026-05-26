"use client";

import { useQuery } from "@tanstack/react-query";
import type { DatasetDetailMock } from "@/data/mockData";
import { fetchDatasetDetail } from "@/utils/datasetDetailApi";

/** GET /api/v1/datasets/{id} (+ preview, citation) */
export function useDatasetDetail(datasetId: string) {
  return useQuery<DatasetDetailMock, Error>({
    queryKey: ["datasets", datasetId],
    queryFn: () => fetchDatasetDetail(datasetId),
    enabled: Boolean(datasetId),
    retry: 1,
    staleTime: 1000 * 60 * 2,
  });
}
