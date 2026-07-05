"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type PublicAgency = {
  agency_user_id: string;
  agency_name: string;
  agency_name_en: string | null;
  agency_type: string | null;
  agency_website: string | null;
  contact_email: string | null;
  contact_phone: string | null;
  image_url: string | null;
  dataset_count: number;
  total_downloads: number;
  total_views: number;
};

type PaginationMeta = {
  page: number;
  page_size: number;
  total_items: number;
  total_pages: number;
};

export type AgencyDatasetListResult = {
  items: unknown[];
  pagination: PaginationMeta;
};

const STALE = 30_000;

export function useAgencyDetail(id: string) {
  return useQuery<PublicAgency, Error>({
    queryKey: ["agency-public", id],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PublicAgency }>(
        `/public/agencies/${id}`
      );
      return res.data.data;
    },
    enabled: Boolean(id),
    staleTime: STALE,
    retry: 1,
  });
}

export function useAgencyDatasets(id: string, page: number, pageSize = 9) {
  return useQuery<AgencyDatasetListResult, Error>({
    queryKey: ["agency-public-datasets", id, page, pageSize],
    queryFn: async () => {
      const res = await apiClient.get<{
        data: unknown[];
        pagination: PaginationMeta;
      }>(`/public/agencies/${id}/datasets`, {
        params: { page, page_size: pageSize },
      });
      return {
        items: res.data.data ?? [],
        pagination: res.data.pagination ?? {
          page: 1,
          page_size: pageSize,
          total_items: 0,
          total_pages: 0,
        },
      };
    },
    enabled: Boolean(id),
    staleTime: STALE,
    retry: 1,
  });
}
