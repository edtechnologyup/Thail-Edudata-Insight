"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type DataDictionaryEntry = {
  id?: string;
  column_name: string;
  description: string | null;
  data_type: string | null;
  sample_value: string | null;
  column_order: number;
};

export type DataDictionaryData = {
  file_id: string;
  entries: DataDictionaryEntry[];
};

export function useDataDictionary(datasetId: string, fileId?: string) {
  return useQuery<DataDictionaryData, Error>({
    queryKey: ["datasets", datasetId, "dictionary", fileId ?? "none"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: DataDictionaryData }>(
        `/datasets/${datasetId}/files/${fileId}/dictionary`
      );
      return res.data.data;
    },
    enabled: Boolean(datasetId) && Boolean(fileId),
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useSaveDataDictionary(datasetId: string, fileId: string) {
  const qc = useQueryClient();
  return useMutation<DataDictionaryData, Error, DataDictionaryEntry[]>({
    mutationFn: async (entries) => {
      const res = await apiClient.put<{ data: DataDictionaryData }>(
        `/datasets/${datasetId}/files/${fileId}/dictionary`,
        { entries }
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["datasets", datasetId, "dictionary"] });
    },
  });
}

export function useAutoDetectDictionary(datasetId: string, fileId: string) {
  return useMutation<DataDictionaryData, Error>({
    mutationFn: async () => {
      const res = await apiClient.post<{ data: DataDictionaryData }>(
        `/datasets/${datasetId}/files/${fileId}/dictionary/auto-detect`
      );
      return res.data.data;
    },
  });
}
