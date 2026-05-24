"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getAdminDashboardMock,
  mockAdminDashboard,
  type AdminDashboardData,
} from "@/data/mockData";

async function fetchAdminDashboard(): Promise<AdminDashboardData> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const response = await apiClient.get<{ data: AdminDashboardData }>(
  //   "/admin/stats"
  // );
  // return response.data.data;
  await Promise.resolve();
  return getAdminDashboardMock();
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ["admin", "dashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 1000 * 60 * 5,
    placeholderData: mockAdminDashboard,
  });
}
