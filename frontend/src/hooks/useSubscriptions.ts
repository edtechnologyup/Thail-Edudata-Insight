"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  deleteAgencySubscriptionMock,
  getAgencySubscriptionsMock,
  type AgencySubscriptionMock,
} from "@/data/mockData";

export function useSubscriptions() {
  return useQuery<AgencySubscriptionMock[]>({
    queryKey: ["agency", "subscriptions"],
    queryFn: async () => {
      // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
      // const res = await apiClient.get<{ data: AgencySubscriptionMock[] }>(
      //   "/agency/subscriptions"
      // );
      // return res.data.data;

      await Promise.resolve();
      return getAgencySubscriptionsMock();
    },
    staleTime: 1000 * 60 * 5,
  });
}

export function useDeleteSubscription() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
      // await apiClient.delete(`/agency/subscriptions/${id}`);

      await Promise.resolve();
      deleteAgencySubscriptionMock(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["agency", "subscriptions"] });
    },
  });
}
