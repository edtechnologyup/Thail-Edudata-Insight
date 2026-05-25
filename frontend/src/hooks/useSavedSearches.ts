"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type {
  AgencySavedSearchMock,
  SavedSearchFilters,
} from "@/data/mockData";
import { fetchSavedSearches } from "@/utils/savedItemsApi";

export function useSavedSearches() {
  return useQuery<AgencySavedSearchMock[]>({
    queryKey: ["agency", "saved-searches"],
    queryFn: fetchSavedSearches,
    retry: 1,
    staleTime: 1000 * 60 * 5,
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
      await apiClient.delete(`/saved-searches/${savedSearchId}`);
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "saved-searches"] });
    },
  });
}
