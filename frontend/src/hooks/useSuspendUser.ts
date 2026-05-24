"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  suspendAdminUserMock,
  unsuspendAdminUserMock,
} from "@/data/mockData";

async function suspendUser(userId: string): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.post(`/admin/users/${userId}/suspend`);
  await Promise.resolve();
  suspendAdminUserMock(userId);
}

async function unsuspendUser(userId: string): Promise<void> {
  // TODO: เปลี่ยนเป็น API จริงเมื่อ Backend พร้อม
  // await apiClient.post(`/admin/users/${userId}/unsuspend`);
  await Promise.resolve();
  unsuspendAdminUserMock(userId);
}

export function useSuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: suspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}

export function useUnsuspendUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: unsuspendUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "users"] });
    },
  });
}
