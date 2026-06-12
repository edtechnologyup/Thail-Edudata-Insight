"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import apiClient from "@/services/api";

export type ScholarshipBookmarkItem = {
  id: string;
  user_id: string;
  scholarship_id: string;
  created_at: string;
};

const STALE_TIME_MS = 30_000;

export function useScholarshipBookmarks(options?: { enabled?: boolean }) {
  return useQuery<ScholarshipBookmarkItem[], Error>({
    queryKey: ["agency", "scholarship-bookmarks"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: ScholarshipBookmarkItem[] }>(
        "/scholarship-bookmarks"
      );
      return res.data.data ?? [];
    },
    enabled: options?.enabled ?? true,
    staleTime: STALE_TIME_MS,
    retry: 1,
  });
}

export function useAddScholarshipBookmark() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const locale = useLocale();

  return useMutation({
    mutationFn: async (scholarshipId: string) => {
      await apiClient.post("/scholarship-bookmarks", {
        scholarship_id: scholarshipId,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agency", "scholarship-bookmarks"],
      });
    },
    onError: (error: unknown) => {
      const status = (error as { response?: { status?: number } })?.response
        ?.status;
      if (status === 401 || status === 403) {
        router.push(`/${locale}/login`);
      }
    },
  });
}

export function useDeleteScholarshipBookmark() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookmarkId: string) => {
      await apiClient.delete(`/scholarship-bookmarks/${bookmarkId}`);
    },
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["agency", "scholarship-bookmarks"],
      });
    },
  });
}
