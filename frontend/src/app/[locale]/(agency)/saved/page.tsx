"use client";

import { useQueries } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import BookmarkList from "@/components/dashboard/BookmarkList";
import SavedSearchList from "@/components/saved-search/SavedSearchList";
import SubscriptionForm from "@/components/subscription/SubscriptionForm";
import SubscriptionList from "@/components/subscription/SubscriptionList";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useCategories } from "@/hooks/useCategories";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import {
  useDeleteScholarshipBookmark,
  useScholarshipBookmarks,
} from "@/hooks/useScholarshipBookmarks";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import type { Scholarship } from "@/hooks/useScholarships";
import apiClient from "@/services/api";
import { toast } from "@/stores/toastStore";

type SubscriptionOption = {
  id: string;
  label: string;
};

type PublicAgency = {
  agency_user_id: string;
  agency_name: string | null;
  agency_name_en?: string | null;
};

type SavedTab =
  | "bookmark"
  | "subscription"
  | "saved-search"
  | "scholarship-bookmark";

function isScholarshipClosed(closeDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const close = new Date(closeDate);
  close.setHours(0, 0, 0, 0);
  return close < today;
}

function formatScholarshipDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

export default function AgencySavedPage() {
  const t = useTranslations("agency.saved");
  const tScholarship = useTranslations("scholarship");
  const tScholarshipSaved = useTranslations("scholarship.saved");
  const tScholarshipCard = useTranslations("scholarship.card");
  const tScholarshipTypes = useTranslations("scholarship.types");
  const locale = useLocale();
  const base = `/${locale}`;
  const [activeTab, setActiveTab] = useState<SavedTab>("bookmark");

  const { data: bookmarks } = useBookmarks();
  const { data: subscriptions } = useSubscriptions();
  const { data: savedSearches } = useSavedSearches();
  const {
    data: scholarshipBookmarks = [],
    isLoading: scholarshipBookmarksLoading,
  } = useScholarshipBookmarks();
  const deleteScholarshipBookmark = useDeleteScholarshipBookmark();
  const { data: categories = [] } = useCategories();
  const { data: agencies = [] } = useQuery({
    queryKey: ["public", "agencies"],
    queryFn: async (): Promise<PublicAgency[]> => {
      const response = await apiClient.get("/public/agencies");
      return (response.data as { data?: PublicAgency[] }).data ?? [];
    },
    retry: 1,
    staleTime: 5 * 60 * 1000,
  });

  const scholarshipQueries = useQueries({
    queries: scholarshipBookmarks.map((bookmark) => ({
      queryKey: ["scholarships", bookmark.scholarship_id],
      queryFn: async (): Promise<Scholarship> => {
        const response = await apiClient.get<{ data: Scholarship }>(
          `/scholarship/${bookmark.scholarship_id}`
        );
        return response.data.data;
      },
      enabled: Boolean(bookmark.scholarship_id),
      staleTime: 30_000,
      retry: 0,
    })),
  });

  const scholarshipById = useMemo(() => {
    const map = new Map<string, Scholarship>();
    scholarshipBookmarks.forEach((bookmark, index) => {
      const scholarship = scholarshipQueries[index]?.data;
      if (scholarship) {
        map.set(bookmark.scholarship_id, scholarship);
      }
    });
    return map;
  }, [scholarshipBookmarks, scholarshipQueries]);

  const bookmarkCount = bookmarks?.length ?? 0;
  const subscriptionCount = subscriptions?.length ?? 0;
  const savedSearchCount = savedSearches?.length ?? 0;
  const scholarshipBookmarkCount = scholarshipBookmarks.length;

  const tabs: { id: SavedTab; label: string }[] = [
    { id: "bookmark", label: t("tabBookmark", { count: bookmarkCount }) },
    {
      id: "scholarship-bookmark",
      label: tScholarshipSaved("tab", { count: scholarshipBookmarkCount }),
    },
    {
      id: "subscription",
      label: t("tabSubscription", { count: subscriptionCount }),
    },
    {
      id: "saved-search",
      label: t("tabSavedSearch", { count: savedSearchCount }),
    },
  ];

  const handleRemoveScholarshipBookmark = async (bookmarkId: string) => {
    try {
      await deleteScholarshipBookmark.mutateAsync(bookmarkId);
      toast.success(tScholarshipSaved("removeSuccess"));
    } catch {
      toast.error(tScholarshipSaved("removeError"));
    }
  };

  const categoryOptions: SubscriptionOption[] = categories.map((category) => ({
    id: String(category.id),
    label: locale === "th" ? category.name_th : category.name_en,
  }));
  const agencyOptions: SubscriptionOption[] = agencies.map((agency) => ({
    id: String(agency.agency_user_id),
    label:
      locale === "th"
        ? agency.agency_name ?? agency.agency_name_en ?? "-"
        : agency.agency_name_en ?? agency.agency_name ?? "-",
  }));

  return (
    <div className="space-y-0">
      <header className="border-b border-border-default/20 pb-6">
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-label text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      <div className="mt-6 border-b border-border-default">
        <div className="flex gap-8 overflow-x-auto">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`whitespace-nowrap border-b-2 pb-3 font-sarabun text-label font-medium transition-colors ${
                  isActive
                    ? "border-primary-dark text-primary-dark"
                    : "border-transparent text-text-muted hover:text-primary-dark"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="pt-8">
        {activeTab === "bookmark" && <BookmarkList />}
        {activeTab === "scholarship-bookmark" && (
          <div className="space-y-4">
            {scholarshipBookmarksLoading && (
              <p className="font-sarabun text-body-md text-text-muted">
                {tScholarship("common.loading")}
              </p>
            )}

            {!scholarshipBookmarksLoading &&
              scholarshipBookmarks.length === 0 && (
                <div className="rounded-radius-lg border border-border-default/80 bg-surface-card px-6 py-12 text-center">
                  <p className="font-sarabun text-body-md text-text-muted">
                    {tScholarshipSaved("empty")}
                  </p>
                </div>
              )}

            {!scholarshipBookmarksLoading &&
              scholarshipBookmarks.map((bookmark, index) => {
                const scholarship = scholarshipById.get(bookmark.scholarship_id);
                const query = scholarshipQueries[index];
                const isRemoving =
                  deleteScholarshipBookmark.isPending &&
                  deleteScholarshipBookmark.variables === bookmark.id;

                if (query?.isError || !scholarship) {
                  return (
                    <div
                      key={bookmark.id}
                      className="rounded-radius-lg border border-border-default bg-surface-card p-4"
                    >
                      <p className="font-sarabun text-body-sm text-text-muted">
                        {tScholarshipSaved("loadError")}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveScholarshipBookmark(bookmark.id)
                        }
                        disabled={isRemoving}
                        className="mt-3 font-sarabun text-caption font-semibold text-status-error"
                      >
                        {tScholarshipSaved("removeBookmark")}
                      </button>
                    </div>
                  );
                }

                const closed = isScholarshipClosed(scholarship.close_date);

                return (
                  <article
                    key={bookmark.id}
                    className="flex flex-col gap-4 rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:flex-row md:items-center md:justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-radius-sm bg-primary-light px-2.5 py-1 font-sarabun text-caption font-semibold text-primary-dark">
                          {tScholarshipTypes(scholarship.scholarship_type)}
                        </span>
                        {closed && (
                          <span className="inline-flex rounded-radius-sm bg-status-error/10 px-2.5 py-0.5 font-sarabun text-caption font-semibold text-status-error">
                            {tScholarship("common.closedBadge")}
                          </span>
                        )}
                      </div>
                      <h3 className="font-kanit text-body-md font-semibold text-text-primary">
                        {scholarship.title}
                      </h3>
                      <p className="font-sarabun text-caption text-text-muted">
                        {tScholarshipCard("closeDate")}:{" "}
                        {formatScholarshipDate(scholarship.close_date, locale)}
                      </p>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`${base}/scholarship/${scholarship.id}`}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md border border-border-input px-4 font-sarabun text-label font-semibold text-primary hover:bg-primary-light"
                      >
                        {tScholarshipCard("viewDetail")}
                      </Link>
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveScholarshipBookmark(bookmark.id)
                        }
                        disabled={isRemoving}
                        className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md px-4 font-sarabun text-label font-semibold text-status-error transition-colors hover:bg-status-error-bg disabled:opacity-50"
                      >
                        {tScholarshipSaved("removeBookmark")}
                      </button>
                    </div>
                  </article>
                );
              })}
          </div>
        )}
        {activeTab === "subscription" && (
          <div className="max-w-4xl space-y-6">
            <SubscriptionForm
              categories={categoryOptions}
              agencies={agencyOptions}
            />
            <SubscriptionList
              categories={categoryOptions}
              agencies={agencyOptions}
            />
          </div>
        )}
        {activeTab === "saved-search" && <SavedSearchList />}
      </div>
    </div>
  );
}
