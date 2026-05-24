"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAdminDatasetMock } from "@/data/mockData";

async function deleteAdminDataset(id: string): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.delete(`/admin/datasets/${id}`);
  await Promise.resolve();
  deleteAdminDatasetMock(id);
}

export function useAdminDeleteDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteAdminDataset,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
