"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminDatasetsMock,
  type AdminDatasetsFilters,
  type AdminDatasetsResult,
} from "@/data/mockData";

async function fetchAdminDatasets(
  filters?: AdminDatasetsFilters
): Promise<AdminDatasetsResult> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const response = await apiClient.get<{ data: AdminDataset[]; pagination: ... }>(
  //   "/admin/datasets",
  //   { params: filters }
  // );
  // return response.data;
  await Promise.resolve();
  return getAdminDatasetsMock(filters);
}

export function useAdminDatasets(filters?: AdminDatasetsFilters) {
  return useQuery({
    queryKey: ["admin", "datasets", filters],
    queryFn: () => fetchAdminDatasets(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminDatasetsMock(filters),
  });
}
