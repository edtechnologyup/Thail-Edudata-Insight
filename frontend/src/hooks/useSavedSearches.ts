"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { SavedSearchFilters } from "@/types/stats";

export type SavedSearch = {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  created_at: string;
  createdAt: string;
};

type SavedSearchesResponse = {
  success: boolean;
  data: SavedSearch[];
};

async function fetchSavedSearches(): Promise<SavedSearch[]> {
  const res = await apiClient.get<SavedSearchesResponse>("/saved-searches");
  return (res.data.data ?? []).map((item) => ({
    ...item,
    createdAt: item.created_at,
  }));
}

async function deleteSavedSearch(savedSearchId: string): Promise<void> {
  await apiClient.delete(`/saved-searches/${savedSearchId}`);
}

export function useSavedSearches() {
  return useQuery<SavedSearch[]>({
    queryKey: ["agency", "saved-searches"],
    queryFn: fetchSavedSearches,
    retry: 1,
    staleTime: 30 * 1000,
  });
}

type CreateSavedSearchVariables = {
  name: string;
  filters: SavedSearchFilters;
};

export function useCreateSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateSavedSearchVariables) => {
      await apiClient.post("/saved-searches", {
        name: variables.name,
        filters: variables.filters,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "saved-searches"] });
    },
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (savedSearchId: string) => {
      await deleteSavedSearch(savedSearchId);
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "saved-searches"] });
    },
  });
}
