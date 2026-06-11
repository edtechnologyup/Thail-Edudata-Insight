"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import {
  type SavedSearch,
  useDeleteSavedSearch,
  useSavedSearches,
} from "@/hooks/useSavedSearches";
import { toast } from "@/stores/toastStore";

function buildSearchUrl(locale: string, filters: SavedSearch["filters"]) {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.set(key, String(value));
    }
  });

  const query = params.toString();
  return `/${locale}/search${query ? `?${query}` : ""}`;
}

export default function SavedSearchList() {
  const locale = useLocale();
  const router = useRouter();
  const { data: savedSearches = [], isLoading, isError } = useSavedSearches();
  const deleteMutation = useDeleteSavedSearch();

  const handleDelete = async (id: string) => {
    await deleteMutation.mutateAsync(id);
    toast.success("ลบการค้นหาแล้ว");
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="h-24 animate-pulse rounded-radius-lg bg-surface-container"
          />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <p className="rounded-radius-lg border border-status-error bg-status-error-bg px-4 py-3 font-sarabun text-body-md text-status-error">
        โหลดการค้นหาที่บันทึกไม่สำเร็จ
      </p>
    );
  }

  if (savedSearches.length === 0) {
    return (
      <div className="rounded-radius-lg border border-border-default bg-surface-card px-6 py-12 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">
          ยังไม่มีการค้นหาที่บันทึก
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {savedSearches.map((savedSearch) => (
        <div
          key={savedSearch.id}
          className="flex flex-col justify-between gap-4 rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 sm:flex-row sm:items-center"
        >
          <div className="min-w-0">
            <h3 className="font-kanit text-body-md font-semibold text-text-primary">
              {savedSearch.name}
            </h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.entries(savedSearch.filters)
                .filter(([, value]) => value)
                .map(([key, value]) => (
                  <span
                    key={key}
                    className="rounded-radius-full bg-surface-container px-2 py-0.5 font-mono text-code text-text-secondary"
                  >
                    {key}: {String(value)}
                  </span>
                ))}
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => router.push(buildSearchUrl(locale, savedSearch.filters))}
              className="rounded-radius-lg bg-primary px-4 py-2 font-sarabun text-label font-semibold text-surface-card transition-colors hover:bg-primary-hover"
            >
              ค้นหา
            </button>
            <button
              type="button"
              onClick={() => handleDelete(savedSearch.id)}
              disabled={deleteMutation.isPending}
              className="rounded-radius-lg border border-border-default px-4 py-2 font-sarabun text-label font-semibold text-status-error transition-colors hover:bg-status-error-bg disabled:opacity-50"
            >
              ลบ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
