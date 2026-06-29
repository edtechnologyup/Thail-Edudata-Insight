"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type AdminSiteSetting = {
  key: string;
  value: string;
  enabled: boolean;
};

export function useAdminSiteSettings() {
  return useQuery<AdminSiteSetting[]>({
    queryKey: ["admin", "site-settings"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: AdminSiteSetting[] }>(
        "/admin/settings/site"
      );
      return res.data.data;
    },
  });
}

export function useUpdateSiteSetting() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      key,
      enabled,
      value,
    }: {
      key: string;
      enabled: boolean;
      value?: string;
    }) => {
      await apiClient.put(`/admin/settings/site/${key}`, {
        enabled,
        value: value ?? "",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}

export function useUploadRibbonImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiClient.post<{ data: { image_url: string } }>(
        "/admin/settings/ribbon-image",
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data.data.image_url;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}

export function useDeleteRibbonImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await apiClient.delete("/admin/settings/ribbon-image");
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}

export function useUploadSettingImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ key, file }: { key: string; file: File }) => {
      const fd = new FormData();
      fd.append("image", file);
      const res = await apiClient.post<{ data: { image_url: string } }>(
        `/admin/settings/images/${key}`,
        fd,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      return res.data.data.image_url;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}

export function useDeleteSettingImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (key: string) => {
      await apiClient.delete(`/admin/settings/images/${key}`);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "site-settings"] });
      qc.invalidateQueries({ queryKey: ["site-settings"] });
    },
  });
}
