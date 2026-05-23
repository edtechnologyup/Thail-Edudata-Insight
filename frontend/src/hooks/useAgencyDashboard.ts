"use client";

import { useQuery } from "@tanstack/react-query";
import {
  mockAgencyStats,
  type AgencyDashboardStats,
} from "@/data/mockData";
async function fetchAgencyDashboard(): Promise<AgencyDashboardStats> {
  // TODO: switch to real API when backend is ready
  // const response = await apiClient.get<{ data: AgencyDashboardStats }>(
  //   "/agency/dashboard"
  // );
  // return response.data.data;
  await Promise.resolve();
  return mockAgencyStats;
}

export function useAgencyDashboard() {
  return useQuery({
    queryKey: ["agency", "dashboard"],
    queryFn: fetchAgencyDashboard,
    staleTime: 1000 * 60 * 5,
    placeholderData: mockAgencyStats,
  });
}
