"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { ApiDataset } from "@/types/dataset";

/** ดึง file_format จาก GET /api/v1/datasets/{id} (รองรับทั้ง Visitor และ Agency) */
export function useDatasetFileFormat(datasetId: string, enabled = true) {
  return useQuery<string | null, Error>({
    queryKey: ["datasets", datasetId, "file-format"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ApiDataset }>(
        `/datasets/${datasetId}`
      );
      return res.data.data?.file_format ?? null;
    },
    enabled: enabled && Boolean(datasetId),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}
