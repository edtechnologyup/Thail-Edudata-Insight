"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import {
  dismissAnnouncement,
  getDismissedAnnouncementId,
} from "@/utils/notificationStorage";

type ApiAnnouncement = {
  id: string;
  title: string;
  content: string;
  is_active: boolean;
  created_at: string;
};

type PublicAnnouncementsResponse = {
  success: boolean;
  data: ApiAnnouncement[];
};

function usePublicAnnouncements() {
  return useQuery({
    queryKey: ["public", "announcements"],
    queryFn: async () => {
      const res = await apiClient.get<PublicAnnouncementsResponse>(
        "/public/announcements"
      );
      return res.data.data ?? [];
    },
    staleTime: 1000 * 60,
    refetchInterval: 1000 * 60 * 2,
  });
}

function MegaphoneIcon() {
  return (
    <svg
      className="h-8 w-8 shrink-0 text-white md:h-10 md:w-10"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.75}
        d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z"
      />
    </svg>
  );
}

export default function AnnouncementBanner() {
  const t = useTranslations("notifications.announcementBanner");
  const { data: announcements, isLoading } = usePublicAnnouncements();
  const [dismissedId, setDismissedId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setDismissedId(getDismissedAnnouncementId());
  }, []);

  const announcement = (announcements ?? []).find(
    (item) => item.id !== dismissedId
  );

  if (!mounted || isLoading || !announcement) return null;

  const handleDismiss = () => {
    dismissAnnouncement(announcement.id);
    setDismissedId(announcement.id);
  };

  return (
    <div
      className="border-b-4 border-primary-dark bg-gradient-to-r from-primary-dark to-primary px-4 py-5 shadow-level-2 md:px-10 md:py-6"
      role="alert"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-container-max items-start gap-4 md:items-center">
        <div className="hidden rounded-radius-full bg-white/15 p-3 md:flex">
          <MegaphoneIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-radius-full bg-white px-3 py-1 font-sarabun text-caption font-bold uppercase tracking-wide text-primary-dark">
              <span className="h-2 w-2 animate-pulse rounded-radius-full bg-primary" />
              {t("badge")}
            </span>
            <span className="font-sarabun text-caption font-medium text-white/90">
              {t("fromAdmin")}
            </span>
          </div>
          <h2 className="font-kanit text-heading-3 font-bold text-white md:text-heading-2">
            {announcement.title}
          </h2>
          <p className="mt-2 font-sarabun text-body-md leading-relaxed text-white/95 md:text-body-lg">
            {announcement.content}
          </p>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="shrink-0 rounded-radius-md border border-white/40 bg-white/10 px-4 py-2 font-sarabun text-label font-semibold text-white transition-colors hover:bg-white/20"
        >
          {t("dismiss")}
        </button>
      </div>
    </div>
  );
}
