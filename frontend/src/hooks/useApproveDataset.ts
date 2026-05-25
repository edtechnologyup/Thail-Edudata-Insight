"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

async function approveDataset(datasetId: string): Promise<void> {
  await apiClient.post(`/admin/datasets/${datasetId}/approve`);
}

export function useApproveDataset() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveDataset,
    retry: 0,
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "datasets"] });
    },
  });
}
