"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  useAddScholarshipBookmark,
  useScholarshipBookmarks,
} from "@/hooks/useScholarshipBookmarks";
import type { Scholarship } from "@/hooks/useScholarships";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/stores/toastStore";

type ScholarshipCardProps = {
  scholarship: Scholarship;
};

function isClosed(closeDate: string): boolean {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const close = new Date(closeDate);
  close.setHours(0, 0, 0, 0);
  return close < today;
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

function formatAmount(
  amount: number | null,
  amountNote: string | null,
  locale: string,
  currencyLabel: string
): string | null {
  if (amount == null) return null;
  const formatted = amount.toLocaleString(
    locale === "th" ? "th-TH" : "en-US",
    { minimumFractionDigits: 0, maximumFractionDigits: 2 }
  );
  const base = `${formatted} ${currencyLabel}`;
  return amountNote ? `${base} (${amountNote})` : base;
}

export default function ScholarshipCard({ scholarship }: ScholarshipCardProps) {
  const locale = useLocale();
  const t = useTranslations("scholarship");
  const tCard = useTranslations("scholarship.card");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const { user } = useAuthStore();
  const canBookmark = user?.role === "agency" || user?.role === "admin";
  const { data: bookmarks = [] } = useScholarshipBookmarks({
    enabled: canBookmark,
  });
  const addBookmarkMutation = useAddScholarshipBookmark();
  const isBookmarked = useMemo(
    () => bookmarks.some((item) => item.scholarship_id === scholarship.id),
    [bookmarks, scholarship.id]
  );
  const closed = isClosed(scholarship.close_date);
  const amountText = formatAmount(
    scholarship.amount,
    scholarship.amount_note,
    locale,
    t("common.currency")
  );

  const handleBookmark = () => {
    if (isBookmarked || addBookmarkMutation.isPending) return;
    addBookmarkMutation.mutate(scholarship.id, {
      onSuccess: () => toast.success(tCard("bookmarkSuccess")),
    });
  };

  return (
    <article className="flex h-full flex-col rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1 transition-all hover:border-primary/40 hover:shadow-level-2">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-radius-sm bg-primary-light px-2.5 py-1 font-sarabun text-caption font-semibold text-primary-dark">
            {tTypes(scholarship.scholarship_type)}
          </span>
          <span className="rounded-radius-sm bg-surface-container px-2.5 py-1 font-sarabun text-caption font-medium text-text-secondary">
            {tLevels(scholarship.target_level)}
          </span>
        </div>
        {canBookmark && (
          <button
            type="button"
            onClick={handleBookmark}
            disabled={isBookmarked || addBookmarkMutation.isPending}
            className="inline-flex min-h-[36px] min-w-[36px] shrink-0 items-center justify-center rounded-radius-md border border-border-input p-2 text-text-secondary transition-colors hover:bg-surface-container disabled:cursor-default disabled:opacity-60"
            aria-label={isBookmarked ? tCard("bookmarked") : tCard("bookmark")}
            title={isBookmarked ? tCard("bookmarked") : tCard("bookmark")}
          >
            <svg
              className="h-4 w-4"
              fill={isBookmarked ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </button>
        )}
      </div>

      <h2 className="font-kanit text-heading-3 font-semibold text-text-primary line-clamp-2">
        {scholarship.title}
      </h2>

      <p className="mt-2 font-sarabun text-body-sm text-text-muted">
        {tCard("agency")}: {scholarship.agency_name ?? t("common.noAgency")}
      </p>

      {amountText && (
        <p className="mt-3 font-sarabun text-body-sm font-medium text-text-primary">
          {amountText}
        </p>
      )}

      <div className="mt-3 flex items-center gap-2">
        <span className="font-sarabun text-caption text-text-muted">
          {tCard("closeDate")}:
        </span>
        {closed ? (
          <span className="inline-flex rounded-radius-sm bg-status-error/10 px-2.5 py-0.5 font-sarabun text-caption font-semibold text-status-error">
            {t("common.closedBadge")}
          </span>
        ) : (
          <span className="font-sarabun text-caption text-text-primary">
            {formatDate(scholarship.close_date, locale)}
          </span>
        )}
      </div>

      <div className="mt-auto pt-5">
        <Link
          href={`/${locale}/scholarship/${scholarship.id}`}
          className="inline-flex min-h-[44px] w-full items-center justify-center rounded-radius-md bg-primary px-4 font-sarabun text-label font-semibold text-white transition-colors hover:bg-primary-hover"
        >
          {tCard("viewDetail")}
        </Link>
      </div>
    </article>
  );
}
