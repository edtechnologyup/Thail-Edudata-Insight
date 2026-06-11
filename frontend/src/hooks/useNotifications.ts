"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import { useAuthStore } from "@/stores/useAuthStore";
import {
  getVisitorReadNotificationIds,
  markAllVisitorNotificationsRead,
  markVisitorNotificationRead,
} from "@/utils/notificationStorage";

export type NotificationType =
  | "announcement"
  | "new_dataset"
  | "scholarship"
  | "system";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  content: string;
  link: string | null;
  reference_id: string | null;
  is_read: boolean;
  created_at: string;
};

type ListResponse = {
  success: boolean;
  data: AppNotification[];
  pagination: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

type UnreadResponse = {
  success: boolean;
  data: { count: number };
};

function resolveIsRead(item: AppNotification, isLoggedIn: boolean): boolean {
  if (isLoggedIn) return item.is_read;
  return getVisitorReadNotificationIds().has(item.id);
}

export function useNotifications(page = 1, pageSize = 20) {
  const isLoggedIn = Boolean(useAuthStore((s) => s.token));

  return useQuery({
    queryKey: ["notifications", page, pageSize, isLoggedIn],
    queryFn: async () => {
      const res = await apiClient.get<ListResponse>("/notifications", {
        params: { page, page_size: pageSize },
      });
      const items = (res.data.data ?? []).map((item) => ({
        ...item,
        is_read: resolveIsRead(item, isLoggedIn),
      }));
      return {
        items,
        pagination: res.data.pagination,
      };
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useNotificationUnreadCount() {
  const isLoggedIn = Boolean(useAuthStore((s) => s.token));

  return useQuery({
    queryKey: ["notifications", "unread-count", isLoggedIn],
    queryFn: async () => {
      const res = await apiClient.get<UnreadResponse>(
        "/notifications/unread-count"
      );
      if (!isLoggedIn) {
        const listRes = await apiClient.get<ListResponse>("/notifications", {
          params: { page: 1, page_size: 50 },
        });
        const read = getVisitorReadNotificationIds();
        return (listRes.data.data ?? []).filter((n) => !read.has(n.id)).length;
      }
      return res.data.data?.count ?? 0;
    },
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60,
  });
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient();
  const isLoggedIn = Boolean(useAuthStore((s) => s.token));

  return useMutation({
    mutationFn: async (notificationId: string) => {
      if (!isLoggedIn) {
        markVisitorNotificationRead(notificationId);
        return;
      }
      await apiClient.patch(`/notifications/${notificationId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient();
  const isLoggedIn = Boolean(useAuthStore((s) => s.token));

  return useMutation({
    mutationFn: async (broadcastIds: string[]) => {
      if (!isLoggedIn) {
        markAllVisitorNotificationsRead(broadcastIds);
        return;
      }
      await apiClient.patch("/notifications/read-all");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });
}
