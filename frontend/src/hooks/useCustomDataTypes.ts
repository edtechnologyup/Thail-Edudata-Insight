"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type CustomDataType = { id: string; name: string };

export function useCustomDataTypes() {
  return useQuery<CustomDataType[]>({
    queryKey: ["customDataTypes"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: CustomDataType[] }>("/datasets/data-types");
      return res.data.data ?? [];
    },
  });
}

export function useCreateCustomDataType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (name: string) => {
      const res = await apiClient.post<{ data: CustomDataType }>("/datasets/data-types", { name });
      return res.data.data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customDataTypes"] }),
  });
}

export function useDeleteCustomDataType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`/datasets/data-types/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["customDataTypes"] }),
  });
}
