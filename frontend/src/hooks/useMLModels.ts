"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type MLModelStatus = "training" | "ready" | "failed";

export type MLModel = {
  id: string;
  name: string;
  description: string | null;
  status: MLModelStatus;
  model_type: string | null;
  target_column: string;
  feature_columns: string[] | null;
  metrics: Record<string, unknown> | null;
  predict_count: number;
  error_message: string | null;
  training_duration: number | null;
  is_public: boolean;
  dataset_id: string;
  user_id: string;
  created_at: string;
  updated_at: string;
  agency_name?: string | null;
  dataset_title?: string | null;
};

type ListResponse = {
  success: boolean;
  data: MLModel[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

type SingleResponse = {
  success: boolean;
  data: MLModel;
};

type ColumnsResponse = {
  success: boolean;
  data: {
    column_name: string;
    dtype: string;
    sample_values: unknown[];
    unique_count: number;
  }[];
};

const PAGE_SIZE = 10;

export function useMyMLModels(
  page = 1,
  status?: MLModelStatus,
  search?: string,
) {
  return useQuery({
    queryKey: ["ml-models", "my", page, status, search],
    queryFn: async () => {
      const res = await apiClient.get<ListResponse>("/ml-models", {
        params: {
          page,
          page_size: PAGE_SIZE,
          my_models: true,
          ...(search ? { search } : {}),
        },
      });
      const body = res.data;
      if (!body?.data || !body.pagination) {
        throw new Error("โหลดรายการโมเดลไม่สำเร็จ");
      }
      let models = body.data;
      if (status) {
        models = models.filter((m) => m.status === status);
      }
      return {
        data: models,
        total: body.pagination.total_items,
        page: body.pagination.page,
        totalPages: body.pagination.total_pages,
      };
    },
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

export function useMLModelDetail(modelId: string | null) {
  return useQuery({
    queryKey: ["ml-models", modelId],
    queryFn: async () => {
      const res = await apiClient.get<SingleResponse>(
        `/ml-models/${modelId}`,
      );
      return res.data.data;
    },
    enabled: Boolean(modelId),
  });
}

export function useDatasetColumns(datasetId: string | null) {
  return useQuery({
    queryKey: ["dataset-columns", datasetId],
    queryFn: async () => {
      const res = await apiClient.get<ColumnsResponse>(
        `/datasets/${datasetId}/columns`,
      );
      return res.data.data;
    },
    enabled: Boolean(datasetId),
  });
}

export function useCreateMLModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (body: {
      dataset_id: string;
      name: string;
      description?: string;
      target_column: string;
      feature_columns: string[];
    }) => {
      const res = await apiClient.post<SingleResponse>("/ml-models", body);
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ml-models"] });
    },
  });
}

export function useUpdateMLModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      modelId,
      ...body
    }: {
      modelId: string;
      name?: string;
      description?: string;
      is_public?: boolean;
    }) => {
      const res = await apiClient.put<SingleResponse>(
        `/ml-models/${modelId}`,
        body,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ml-models"] });
    },
  });
}

export function useDeleteMLModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (modelId: string) => {
      await apiClient.delete(`/ml-models/${modelId}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ml-models"] });
    },
  });
}

export function useDatasetPublicModels(datasetId: string | null) {
  return useQuery({
    queryKey: ["ml-models", "dataset-public", datasetId],
    queryFn: async () => {
      const res = await apiClient.get<ListResponse>(
        `/datasets/${datasetId}/models`,
      );
      return res.data.data ?? [];
    },
    enabled: Boolean(datasetId),
    staleTime: 1000 * 60 * 5,
  });
}

export type FeatureInfo = {
  column_name: string;
  dtype: "number" | "text";
  min?: number;
  max?: number;
  mean?: number;
  options?: string[];
};

export function useModelFeatureInfo(modelId: string | null) {
  return useQuery({
    queryKey: ["ml-feature-info", modelId],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: FeatureInfo[];
      }>(`/ml-models/${modelId}/feature-info`);
      return res.data.data ?? [];
    },
    enabled: Boolean(modelId),
    staleTime: 1000 * 60 * 10,
  });
}

export type PredictionLog = {
  id: string;
  input_data: Record<string, unknown>;
  result: { prediction: unknown };
  created_at: string;
};

export function usePredictionLogs(modelId: string | null) {
  return useQuery({
    queryKey: ["ml-predictions", modelId],
    queryFn: async () => {
      const res = await apiClient.get<{
        success: boolean;
        data: PredictionLog[];
      }>(`/ml-models/${modelId}/predictions`);
      return res.data.data ?? [];
    },
    enabled: Boolean(modelId),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePredictMLModel() {
  return useMutation({
    mutationFn: async ({
      modelId,
      inputData,
    }: {
      modelId: string;
      inputData: Record<string, unknown>;
    }) => {
      const res = await apiClient.post<{
        success: boolean;
        data: { prediction: unknown; model_name: string; model_type: string };
      }>(`/ml-models/${modelId}/predict`, { input_data: inputData });
      return res.data.data;
    },
  });
}

export function useRetrainMLModel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (modelId: string) => {
      const res = await apiClient.post<SingleResponse>(
        `/ml-models/${modelId}/retrain`,
      );
      return res.data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["ml-models"] });
    },
  });
}
