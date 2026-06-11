"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  type AppNotification,
  type NotificationType,
} from "@/hooks/useNotifications";
import { useAuthStore } from "@/stores/useAuthStore";

function typeLabel(
  type: NotificationType,
  t: ReturnType<typeof useTranslations<"notifications">>
) {
  if (type === "announcement") return t("typeAnnouncement");
  if (type === "new_dataset") return t("typeNewDataset");
  if (type === "scholarship") return t("typeScholarship");
  return t("typeSystem");
}

function formatDate(iso: string, locale: string) {
  return new Date(iso).toLocaleString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function NotificationRow({
  item,
  locale,
  onRead,
}: {
  item: AppNotification;
  locale: string;
  onRead: (id: string) => void;
}) {
  const t = useTranslations("notifications");
  const base = `/${locale}`;
  const href = item.link ? `${base}${item.link}` : undefined;

  const content = (
    <div
      className={`rounded-radius-lg border p-5 transition-colors ${
        item.is_read
          ? "border-border-default bg-surface-card"
          : "border-status-error/30 bg-status-error/5"
      }`}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <span className="rounded-radius-full bg-primary px-2.5 py-0.5 font-sarabun text-caption font-bold text-white">
          {typeLabel(item.type, t)}
        </span>
        {!item.is_read && (
          <span className="inline-flex items-center gap-1 rounded-radius-full bg-status-error px-2 py-0.5 font-sarabun text-caption font-bold text-white">
            <span className="h-1.5 w-1.5 rounded-radius-full bg-white" />
            NEW
          </span>
        )}
        <span className="font-sarabun text-caption text-text-muted">
          {formatDate(item.created_at, locale)}
        </span>
      </div>
      <h3 className="font-kanit text-heading-3-mobile font-semibold text-text-primary">
        {item.title}
      </h3>
      <p className="mt-2 font-sarabun text-body-md text-text-secondary">
        {item.content}
      </p>
      {href && (
        <span className="mt-3 inline-block font-sarabun text-label font-medium text-primary-dark">
          {t("openLink")} →
        </span>
      )}
    </div>
  );

  if (!href) {
    return (
      <button
        type="button"
        className="w-full text-left"
        onClick={() => !item.is_read && onRead(item.id)}
      >
        {content}
      </button>
    );
  }

  return (
    <Link
      href={href}
      className="block"
      onClick={() => !item.is_read && onRead(item.id)}
    >
      {content}
    </Link>
  );
}

export default function NotificationsPage() {
  const t = useTranslations("notifications");
  const locale = useLocale();
  const base = `/${locale}`;
  const [page, setPage] = useState(1);
  const isLoggedIn = Boolean(useAuthStore((s) => s.token));

  const { data, isLoading, isError } = useNotifications(page, 20);
  const markRead = useMarkNotificationRead();
  const markAll = useMarkAllNotificationsRead();

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  const handleMarkAll = () => {
    const ids = items.map((item) => item.id);
    markAll.mutate(ids);
  };

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <h1 className="font-kanit text-heading-2 text-text-primary md:text-heading-1">
            {t("pageTitle")}
          </h1>
          <p className="mt-1 font-sarabun text-label text-text-muted">
            {t("pageSubtitle")}
          </p>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Link
              href={base}
              className="font-sarabun text-label text-primary-dark hover:underline"
            >
              ← {t("backHome")}
            </Link>
            {items.some((item) => !item.is_read) && (
              <button
                type="button"
                onClick={handleMarkAll}
                disabled={markAll.isPending}
                className="rounded-radius-md border border-border-input px-4 py-2 font-sarabun text-label text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-60"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          {isLoading && (
            <p className="font-sarabun text-body-md text-text-muted">{t("loading")}</p>
          )}

          {isError && (
            <p className="font-sarabun text-body-md text-status-error" role="alert">
              {t("loadError")}
            </p>
          )}

          {!isLoading && !isError && items.length === 0 && (
            <p className="rounded-radius-lg border border-border-default bg-surface-card p-8 text-center font-sarabun text-body-md text-text-muted">
              {t("empty")}
            </p>
          )}

          <div className="space-y-4">
            {items.map((item) => (
              <NotificationRow
                key={item.id}
                item={item}
                locale={locale}
                onRead={(id) => markRead.mutate(id)}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="rounded-radius-md border border-border-input px-4 py-2 font-sarabun text-label disabled:opacity-40"
              >
                {t("prev")}
              </button>
              <span className="font-sarabun text-label text-text-muted">
                {page} / {totalPages}
              </span>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
                className="rounded-radius-md border border-border-input px-4 py-2 font-sarabun text-label disabled:opacity-40"
              >
                {t("next")}
              </button>
            </div>
          )}

          {!isLoggedIn && (
            <p className="text-center font-sarabun text-caption text-text-muted">
              {t("visitorNote")}
            </p>
          )}
        </div>
      </section>
    </>
  );
}
