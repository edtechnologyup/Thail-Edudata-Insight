"use client";

import { useQuery } from "@tanstack/react-query";
import { getAdminUsersMock, type AdminUsersFilters, type AdminUsersResult } from "@/data/mockData";

async function fetchAdminUsers(
  filters?: AdminUsersFilters
): Promise<AdminUsersResult> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // const response = await apiClient.get<{ data: AdminUser[]; pagination: ... }>(
  //   "/admin/users",
  //   { params: filters }
  // );
  // return response.data;
  await Promise.resolve();
  return getAdminUsersMock(filters);
}

export function useAdminUsers(filters?: AdminUsersFilters) {
  return useQuery({
    queryKey: ["admin", "users", filters],
    queryFn: () => fetchAdminUsers(filters),
    staleTime: 1000 * 60 * 5,
    placeholderData: () => getAdminUsersMock(filters),
  });
}
