"use client";

import { useQuery } from "@tanstack/react-query";
import {
  mockAgencyDatasets,
  type AgencyDatasetRow,
} from "@/data/mockData";
type AgencyDatasetsResponse = {
  data: AgencyDatasetRow[];
  total: number;
};

async function fetchAgencyDatasets(): Promise<AgencyDatasetsResponse> {
  // TODO: switch to real API when backend is ready
  // const response = await apiClient.get<{ data: AgencyDatasetsResponse }>(
  //   "/agency/datasets"
  // );
  // return response.data.data;
  await Promise.resolve();
  return { data: mockAgencyDatasets, total: mockAgencyDatasets.length };
}

export function useAgencyDatasets(limit?: number) {
  return useQuery({
    queryKey: ["agency", "datasets", limit ?? "all"],
    queryFn: async () => {
      const result = await fetchAgencyDatasets();
      const rows = limit ? result.data.slice(0, limit) : result.data;
      return { data: rows, total: result.total };
    },
    staleTime: 1000 * 60 * 5,
    placeholderData: {
      data: limit
        ? mockAgencyDatasets.slice(0, limit)
        : mockAgencyDatasets,
      total: mockAgencyDatasets.length,
    },
  });
}
