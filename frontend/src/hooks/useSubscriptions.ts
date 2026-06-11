"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type Subscription = {
  id: string;
  category_id: string | null;
  agency_user_id: string | null;
  created_at: string;
  type: "category" | "agency";
  name: string;
  nameEn: string;
  subscribedAt: string;
};

export type CreateSubscriptionInput =
  | { category_id: string; agency_user_id?: never }
  | { agency_user_id: string; category_id?: never };

type SubscriptionsResponse = {
  success: boolean;
  data: Subscription[];
};

async function fetchSubscriptions(): Promise<Subscription[]> {
  const res = await apiClient.get<SubscriptionsResponse>("/subscriptions");
  return (res.data.data ?? []).map((item) => {
    const type = item.category_id ? "category" : "agency";
    const fallbackName = item.category_id ?? item.agency_user_id ?? "-";
    return {
      ...item,
      type,
      name: fallbackName,
      nameEn: fallbackName,
      subscribedAt: item.created_at,
    };
  });
}

async function createSubscription(input: CreateSubscriptionInput): Promise<void> {
  await apiClient.post("/subscriptions", input);
}

async function deleteSubscription(subscriptionId: string): Promise<void> {
  await apiClient.delete(`/subscriptions/${subscriptionId}`);
}

export function useSubscriptions() {
  return useQuery<Subscription[]>({
    queryKey: ["agency", "subscriptions"],
    queryFn: fetchSubscriptions,
    retry: 1,
    staleTime: 30 * 1000,
  });
}

export function useCreateSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createSubscription,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "subscriptions"] });
    },
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteSubscription,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "subscriptions"] });
    },
  });
}
