"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { AgencySubscriptionMock } from "@/data/mockData";
import { fetchSubscriptions } from "@/utils/savedItemsApi";

export function useSubscriptions() {
  return useQuery<AgencySubscriptionMock[]>({
    queryKey: ["agency", "subscriptions"],
    queryFn: fetchSubscriptions,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subscriptionId: string) => {
      await apiClient.delete(`/subscriptions/${subscriptionId}`);
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "subscriptions"] });
    },
  });
}
