"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { AgencySubscriptionMock } from "@/data/mockData";
import {
  useDeleteSubscription,
  useSubscriptions,
} from "@/hooks/useSubscriptions";

function formatSubscribedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function SubscriptionRow({
  item,
  locale,
  onUnsubscribe,
  isPending,
}: {
  item: AgencySubscriptionMock;
  locale: string;
  onUnsubscribe: (id: string) => void;
  isPending: boolean;
}) {
  const t = useTranslations("agency.saved.subscription");
  const name = locale === "th" ? item.name : item.nameEn;
  const label =
    item.type === "category"
      ? t("categoryLabel", { name })
      : t("agencyLabel", { name });
  const date = formatSubscribedDate(item.subscribedAt, locale);

  return (
    <div className="flex flex-col gap-4 rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-4">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-radius-lg ${
            item.type === "category"
              ? "bg-primary/10 text-primary-dark"
              : "bg-status-draft-bg text-status-draft"
          }`}
        >
          {item.type === "category" ? <CategoryIcon /> : <AgencyIcon />}
        </div>
        <div>
          <h3 className="font-sarabun text-label font-medium text-text-primary">
            {label}
          </h3>
          <div className="mt-1 flex flex-wrap gap-2">
            <span
              className={`rounded px-2 py-0.5 font-sarabun text-[10px] font-bold ${
                item.type === "category"
                  ? "bg-primary/20 text-primary-dark"
                  : "bg-status-draft-bg text-status-draft"
              }`}
            >
              {item.type === "category" ? t("typeCategory") : t("typeAgency")}
            </span>
            <span className="font-sarabun text-[10px] text-text-muted">
              {t("subscribedAt", { date })}
            </span>
          </div>
        </div>
      </div>
      <button
        type="button"
        onClick={() => onUnsubscribe(item.id)}
        disabled={isPending}
        className="flex items-center justify-center gap-1 rounded-radius-lg px-3 py-2 font-sarabun text-label font-semibold text-status-error transition-colors hover:bg-status-error-bg disabled:opacity-50"
      >
        <UnsubscribeIcon />
        {t("cancel")}
      </button>
    </div>
  );
}

export default function SubscriptionList() {
  const t = useTranslations("agency.saved.subscription");
  const locale = useLocale();
  const base = `/${locale}`;
  const { data, isLoading, isError } = useSubscriptions();
  const deleteMutation = useDeleteSubscription();

  const handleUnsubscribe = async (id: string) => {
    try {
      await deleteMutation.mutateAsync(id);
    } catch {
      // handled silently; page may show toast
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
            className="h-20 animate-pulse rounded-radius-lg bg-surface-container"
          />
        ))}
      </div>
    );
  }

  const items = data ?? [];

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-radius-lg border border-border-default/80 bg-surface-card px-6 py-16 text-center shadow-level-1">
        <p className="font-sarabun text-body-lg text-text-secondary">{t("empty")}</p>
        <Link
          href={`${base}/search`}
          className="mt-6 rounded-radius-lg border border-primary-dark px-6 py-2.5 font-sarabun text-label font-bold text-primary-dark transition-colors hover:bg-primary-light"
        >
          {t("add")}
        </Link>
      </div>
    );
  }

  return (
    <div className="flex max-w-4xl flex-col gap-4">
      {items.map((item) => (
        <SubscriptionRow
          key={item.id}
          item={item}
          locale={locale}
          onUnsubscribe={handleUnsubscribe}
          isPending={deleteMutation.isPending}
        />
      ))}
    </div>
  );
}

function CategoryIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="m12 2 2 7h7l-5.5 4 2 7L12 16l-5.5 4 2-7L3 9h7l2-7z" />
    </svg>
  );
}

function AgencyIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 7V3H2v18h20V7H12zM6 19H4v-2h2v2zm0-4H4v-2h2v2zm0-4H4V9h2v2zm0-4H4V5h2v2zm4 12H8v-2h2v2zm0-4H8v-2h2v2zm0-4H8V9h2v2zm0-4H8V5h2v2zm10 12h-8v-2h2v-2h-2v-2h2v-2h-2V9h8v10z" />
    </svg>
  );
}

function UnsubscribeIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z" />
    </svg>
  );
}
