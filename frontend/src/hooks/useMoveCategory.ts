"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { ApiCategory, CategoryUpdateBody } from "@/utils/categoryApi";

type MoveCategoryVariables = {
  id: string;
  parentId: string | null;
};

type CategoryMutationResponse = {
  success: boolean;
  data: ApiCategory;
};

async function moveCategory(
  variables: MoveCategoryVariables
): Promise<ApiCategory> {
  const body: CategoryUpdateBody =
    variables.parentId === null
      ? { move_to_root: true }
      : { parent_id: variables.parentId };

  const res = await apiClient.patch<CategoryMutationResponse>(
    `/categories/${variables.id}`,
    body
  );

  return res.data.data;
}

export function useMoveCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: moveCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "categories"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
  });
}
