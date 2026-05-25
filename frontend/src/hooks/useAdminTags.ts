"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { AdminTag } from "@/data/mockData";

type ApiTag = {
  id: string;
  name: string;
};

type TagsListResponse = {
  success: boolean;
  data: ApiTag[];
};

function mapTag(item: ApiTag): AdminTag {
  return {
    id: String(item.id),
    name: item.name,
    datasetCount: 0,
  };
}

async function fetchAdminTags(search?: string): Promise<AdminTag[]> {
  const res = await apiClient.get<TagsListResponse>("/admin/tags");
  let tags = (res.data.data ?? []).map(mapTag);

  if (search?.trim()) {
    const keyword = search.trim().toLowerCase();
    tags = tags.filter((tag) => tag.name.toLowerCase().includes(keyword));
  }

  return tags;
}

/** GET /api/v1/admin/tags */
export function useAdminTags(search?: string) {
  return useQuery({
    queryKey: ["admin", "tags", search],
    queryFn: () => fetchAdminTags(search),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });
}

async function createTag(name: string): Promise<void> {
  await apiClient.post("/admin/tags", { name });
}

/** POST /api/v1/admin/tags */
export function useCreateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}

export const useAdminCreateTag = useCreateTag;

type UpdateTagVariables = {
  id: string;
  name: string;
};

async function updateTag(variables: UpdateTagVariables): Promise<void> {
  await apiClient.patch(`/admin/tags/${variables.id}`, { name: variables.name });
}

/** PATCH /api/v1/admin/tags/{id} */
export function useUpdateTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateTag,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}

export const useAdminUpdateTag = useUpdateTag;

async function deleteTag(id: string): Promise<void> {
  await apiClient.delete(`/admin/tags/${id}`);
}

/** DELETE /api/v1/admin/tags/{id} */
export function useDeleteTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTag,
    retry: 0,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin", "tags"] });
    },
  });
}

export const useAdminDeleteTag = useDeleteTag;
