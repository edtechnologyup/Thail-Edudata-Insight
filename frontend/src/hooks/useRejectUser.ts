"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

type RejectUserInput = {
  userId: string;
  reason: string;
};

async function rejectUser({ userId, reason }: RejectUserInput): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/reject`, { reason });
}

export function useRejectUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectUser,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
