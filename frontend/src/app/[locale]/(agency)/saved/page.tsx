"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import BookmarkList from "@/components/dashboard/BookmarkList";
import SavedSearchList from "@/components/dashboard/SavedSearchList";
import SubscriptionList from "@/components/dashboard/SubscriptionList";
import { useBookmarks } from "@/hooks/useBookmarks";
import { useSavedSearches } from "@/hooks/useSavedSearches";
import { useSubscriptions } from "@/hooks/useSubscriptions";

type SavedTab = "bookmark" | "subscription" | "saved-search";

export default function AgencySavedPage() {
  const t = useTranslations("agency.saved");
  const [activeTab, setActiveTab] = useState<SavedTab>("bookmark");

  const { data: bookmarks } = useBookmarks();
  const { data: subscriptions } = useSubscriptions();
  const { data: savedSearches } = useSavedSearches();

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
        {activeTab === "subscription" && <SubscriptionList />}
        {activeTab === "saved-search" && <SavedSearchList />}
      </div>
    </div>
  );
}
