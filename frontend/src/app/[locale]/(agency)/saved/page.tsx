"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import BookmarkList from "@/components/dashboard/BookmarkList";
import SavedSearchList from "@/components/saved-search/SavedSearchList";
import SubscriptionForm from "@/components/subscription/SubscriptionForm";
import SubscriptionList from "@/components/subscription/SubscriptionList";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useCategories } from "@/hooks/useCategories";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useSubscriptions } from "@/hooks/useSubscriptions";
import apiClient from "@/services/api";

type SubscriptionOption = {
  id: string;
  label: string;
};

type PublicAgency = {
  agency_user_id: string;
  agency_name: string | null;
  agency_name_en?: string | null;
};

type SavedTab = "bookmark" | "subscription" | "saved-search";

export default function AgencySavedPage() {
  const t = useTranslations("agency.saved");
  const locale = useLocale();
  const [activeTab, setActiveTab] = useState<SavedTab>("bookmark");

  const { data: bookmarks } = useBookmarks();
  const { data: subscriptions } = useSubscriptions();
  const { data: savedSearches } = useSavedSearches();
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

  const bookmarkCount = bookmarks?.length ?? 0;
  const subscriptionCount = subscriptions?.length ?? 0;
  const savedSearchCount = savedSearches?.length ?? 0;

  const tabs: { id: SavedTab; label: string }[] = [
    { id: "bookmark", label: t("tabBookmark", { count: bookmarkCount }) },
    {
      id: "subscription",
      label: t("tabSubscription", { count: subscriptionCount }),
    },
    {
      id: "saved-search",
      label: t("tabSavedSearch", { count: savedSearchCount }),
    },
  ];

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
