"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

async function suspendUser(userId: string): Promise<void> {
  await apiClient.post(`/admin/users/${userId}/suspend`);
}

/** Backend ไม่มี /unsuspend — ใช้ PATCH status=active ตาม PATCH /admin/users/{id} */
async function unsuspendUser(userId: string): Promise<void> {
  await apiClient.patch(`/admin/users/${userId}`, { status: "active" });
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
