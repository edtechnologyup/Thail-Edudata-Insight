"use client";

import { useQuery } from "@tanstack/react-query";
import { getPageContentBySlug, type PageContentMock } from "@/data/mockData";
import apiClient from "@/services/api";

async function fetchPageContent(slug: string): Promise<PageContentMock> {
  const response = await apiClient.get<{ data: PageContentMock }>(
    `/pages/${slug}`
  );
  const data = response.data?.data;
  if (!data?.slug) {
    throw new Error("Invalid page content");
  }
  return data;
}

export function usePageContent(slug: string) {
  return useQuery({
    queryKey: ["pages", slug],
    queryFn: () => fetchPageContent(slug),
    staleTime: 1000 * 60 * 10,
    retry: 1,
    placeholderData: () => getPageContentBySlug(slug) ?? undefined,
  });
}
