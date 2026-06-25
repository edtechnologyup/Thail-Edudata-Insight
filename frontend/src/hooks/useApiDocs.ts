"use client";

import { useQuery } from "@tanstack/react-query";
import type { ApiDocsMock } from "@/types/content";
import apiClient from "@/services/api";
import type { ApiPageContent } from "@/utils/pageContentApi";

const EMPTY_API_DOCS: ApiDocsMock = {
  slug: "api-docs",
  titleTh: "เอกสาร API",
  titleEn: "API Documentation",
  descriptionTh: "",
  descriptionEn: "",
  version: "v1.0.0",
  updatedAt: "",
  baseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  endpoints: [],
};

async function fetchApiDocs(): Promise<ApiDocsMock> {
  try {
    const res = await apiClient.get<{ data: ApiPageContent }>(
      "/public/pages/api-docs"
    );
    const page = res.data.data;
    if (!page) return EMPTY_API_DOCS;

    return {
      ...EMPTY_API_DOCS,
      titleTh: page.title_th || EMPTY_API_DOCS.titleTh,
      titleEn: page.title_en || EMPTY_API_DOCS.titleEn,
      descriptionTh: page.content_th?.trim()
        ? stripHtml(page.content_th).slice(0, 500)
        : "",
      descriptionEn: page.content_en?.trim()
        ? stripHtml(page.content_en).slice(0, 500)
        : "",
    };
  } catch {
    return EMPTY_API_DOCS;
  }
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
}

/** API docs page — title/description from API, endpoint reference from bundled docs */
export function useApiDocs() {
  return useQuery<ApiDocsMock, Error>({
    queryKey: ["pages", "api-docs"],
    queryFn: fetchApiDocs,
    retry: 1,
    staleTime: 1000 * 60 * 10,
  });
}
