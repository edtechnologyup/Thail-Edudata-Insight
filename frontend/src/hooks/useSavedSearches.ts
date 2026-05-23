"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAgencySavedSearchMock,
  getAgencySavedSearchesMock,
  type AgencySavedSearchMock,
} from "@/data/mockData";

export function useSavedSearches() {
  return useQuery<AgencySavedSearchMock[]>({
    queryKey: ["agency", "saved-searches"],
    queryFn: async () => {
      // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
      // const res = await apiClient.get<{ data: AgencySavedSearchMock[] }>(
      //   "/agency/saved-searches"
      // );
      // return res.data.data;

      await Promise.resolve();
      return getAgencySavedSearchesMock();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteSavedSearch() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
      // await apiClient.delete(`/agency/saved-searches/${id}`);

      await Promise.resolve();
      deleteAgencySavedSearchMock(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "saved-searches"] });
    },
  });
}
