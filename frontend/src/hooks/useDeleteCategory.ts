"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type DeleteCategoryVariables = {
  id: string;
  force?: boolean;
};

async function deleteCategory(variables: DeleteCategoryVariables): Promise<void> {
  const params = variables.force ? { force: true } : undefined;
  await apiClient.delete(`/categories/${variables.id}`, { params });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteCategory,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}
