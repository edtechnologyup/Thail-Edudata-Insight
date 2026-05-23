"use client";

import { useQuery } from "@tanstack/react-query";
import {
  getApiDocsMock,
  MOCK_API_DOCS,
  type ApiDocsMock,
} from "@/data/mockData";
import apiClient from "@/services/api";

async function fetchApiDocs(): Promise<ApiDocsMock> {
  try {
    const response = await apiClient.get<{ data: ApiDocsMock }>(
      "/pages/api-docs"
    );
    const data = response.data?.data;
    if (data?.endpoints?.length) {
      return data;
    }
    return getApiDocsMock();
  } catch {
    return getApiDocsMock();
  }
}

export function useApiDocs() {
  return useQuery({
    queryKey: ["pages", "api-docs"],
    queryFn: fetchApiDocs,
    staleTime: 10 * 60 * 1000,
    placeholderData: MOCK_API_DOCS,
  });
}
