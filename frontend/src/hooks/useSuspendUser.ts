"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

async function suspendUser({ userId, reason }: { userId: string; reason: string }): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/suspend`, { reason });
}

async function unsuspendUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/unsuspend`);
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendUser,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsuspendUser,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
      queryClient.invalidateQueries({ queryKey: ["admin", "dashboard"] });
    },
  });
}
