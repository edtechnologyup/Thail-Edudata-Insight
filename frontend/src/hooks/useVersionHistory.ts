"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchMockVersionHistory,
  type DatasetVersionItem,
} from "@/data/mockData";

async function fetchVersionHistory(
  datasetId: string
): Promise<DatasetVersionItem[]> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const response = await apiClient.get<JSendResponse<DatasetVersionItem[]>>(
  //   `/agency/datasets/${datasetId}/versions`
  // );
  // return response.data.data!;
  return fetchMockVersionHistory(datasetId);
}

export function useVersionHistory(datasetId: string) {
  return useQuery({
    queryKey: ["agency", "datasets", datasetId, "versions"],
    queryFn: () => fetchVersionHistory(datasetId),
    staleTime: 1000 * 60 * 5,
    enabled: Boolean(datasetId),
  });
}
