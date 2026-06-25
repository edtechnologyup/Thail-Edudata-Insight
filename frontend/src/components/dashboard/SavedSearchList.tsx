"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import type { AgencySavedSearchMock, SavedSearchFilters } from "@/types/stats";

function buildSavedSearchUrl(locale: string, filters: SavedSearchFilters): string {
  const params = new URLSearchParams();
  if (filters.q) params.set("q", filters.q);
  if (filters.category) params.set("category", filters.category);
  if (filters.year) params.set("year", filters.year);
  if (filters.format) params.set("format", filters.format);
  if (filters.agency) params.set("agency", filters.agency);
  const query = params.toString();
  return `/${locale}/search${query ? `?${query}` : ""}`;
}
import {
  useDeleteSavedSearch,
  useSavedSearches,
} from "@/hooks/useSavedSearches";

function formatFilterLabel(key: string, value: string): string {
  return `${key}: ${value}`;
}

function FilterChips({ filters }: { filters: SavedSearchFilters }) {
  const t = useTranslations("agency.saved.savedSearch");
  const entries = Object.entries(filters).filter(([, v]) => v);

  if (entries.length === 0) {
    return null;
  }

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      <span className="font-sarabun text-caption text-text-muted">
        {t("filters")}:
      </span>
      {entries.map(([key, value]) => (
        <span
          key={key}
          className="rounded-radius-full bg-surface-container px-2 py-0.5 font-mono text-code text-text-secondary"
        >
          {formatFilterLabel(key, value)}
        </span>
      ))}
    </div>
  );
}

function SavedSearchRow({
  item,
  locale,
  onSearch,
  onDelete,
  isPending,
}: {
  item: AgencySavedSearchMock;
  locale: string;
  onSearch: (item: AgencySavedSearchMock) => void;
  onDelete: (id: string) => void;
  isPending: boolean;
}) {
  const t = useTranslations("agency.saved.savedSearch");
  const created = new Date(item.createdAt).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );

  return (
    <div className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="font-kanit text-body-md font-semibold text-text-primary">
            {item.name}
          </h3>
          <p className="mt-1 font-sarabun text-caption text-text-muted">
            {t("createdAt", { date: created })}
          </p>
          <FilterChips filters={item.filters} />
        </div>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => onSearch(item)}
            className="rounded-radius-lg bg-primary px-4 py-2 font-sarabun text-label font-medium text-surface-card transition-opacity hover:bg-primary-hover"
          >
            {t("search")}
          </button>
          <button
            type="button"
            onClick={() => onDelete(item.id)}
            disabled={isPending}
            className="rounded-radius-lg border border-border-default px-4 py-2 font-sarabun text-label font-medium text-status-error transition-colors hover:bg-status-error-bg disabled:opacity-50"
          >
            {t("delete")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SavedSearchList() {
  const t = useTranslations("agency.saved.savedSearch");
  const locale = useLocale();
  const base = `/${locale}`;
  const router = useRouter();
  const { data, isLoading, isError } = useSavedSearches();
  const deleteMutation = useDeleteSavedSearch();

  const handleSearch = (item: AgencySavedSearchMock) => {
    router.push(buildSavedSearchUrl(locale, item.filters));
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // optional toast
    }
  };

  if (isError) {
    return (
      <p className="font-sarabun text-label text-status-error">{t("loadError")}</p>
    );
  }

  if (isLoading) {
    return (
      <div className="flex max-w-4xl flex-col gap-4">
        {Array.from({ length: 2 }).map((_, i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-radius-lg bg-surface-container"
          />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-6 flex h-24 w-24 items-center justify-center rounded-radius-full bg-surface-container">
          <SearchOffIcon />
        </div>
        <h3 className="font-kanit text-heading-3 font-semibold text-text-primary">
          {t("empty")}
        </h3>
        <p className="mt-2 max-w-sm font-sarabun text-body-md text-text-muted">
          {t("emptyHint")}
        </p>
        <Link
          href={`${base}/search`}
          className="mt-8 rounded-radius-lg border border-primary-dark px-6 py-2.5 font-sarabun text-label font-bold text-primary-dark transition-colors hover:bg-primary-light"
        >
          {t("goSearch")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      {items.map((item) => (
        <SavedSearchRow
          key={item.id}
          item={item}
          locale={locale}
          onSearch={handleSearch}
          onDelete={handleDelete}
          isPending={deleteMutation.isPending}
        />
      ))}
    </div>
  );
}

function SearchOffIcon() {
  return (
    <svg
      className="h-12 w-12 text-text-muted"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
      <path d="M3 3 1 1" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}
