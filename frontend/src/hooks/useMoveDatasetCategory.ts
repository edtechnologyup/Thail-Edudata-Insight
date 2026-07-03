"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type MoveDatasetCategoryVariables = {
  datasetId: string;
  categoryId: string;
};

async function moveDatasetCategory(
  variables: MoveDatasetCategoryVariables
): Promise<void> {
  await apiClient.patch(`/datasets/${variables.datasetId}`, {
    category_id: variables.categoryId,
  });
}

export function useMoveDatasetCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveDatasetCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "datasets"] });
      queryClient.invalidateQueries({ queryKey: ["datasets"] });
    },
  });
}
