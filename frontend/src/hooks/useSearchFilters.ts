"use client";

import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";

export type SearchFilterCategory = {
  id: string;
  parent_id: string | null;
  level: number;
  name_th: string;
  name_en: string;
  slug: string;
};

export type SearchFilterAgency = {
  agency_user_id: string;
  agency_name: string;
};

export type SearchFilterOptions = {
  categories: SearchFilterCategory[];
  agencies: SearchFilterAgency[];
  years: number[];
  provinces: string[];
  formats: string[];
};

type SearchFiltersResponse = {
  success: boolean;
  data: SearchFilterOptions;
};

const EMPTY_FILTERS: SearchFilterOptions = {
  categories: [],
  agencies: [],
  years: [],
  provinces: [],
  formats: [],
};

async function fetchSearchFilters(): Promise<SearchFilterOptions> {
  const res = await apiClient.get<SearchFiltersResponse>("/search/filters");
  const body = res.data as SearchFiltersResponse;
  return body.data ?? EMPTY_FILTERS;
}

/** GET /api/v1/search/filters — ตัวเลือก filter จากข้อมูลจริง */
export function useSearchFilters() {
  return useQuery({
    queryKey: ["search", "filters"],
    queryFn: fetchSearchFilters,
    retry: 2,
    staleTime: 1000 * 60 * 5,
    placeholderData: EMPTY_FILTERS,
  });
}
