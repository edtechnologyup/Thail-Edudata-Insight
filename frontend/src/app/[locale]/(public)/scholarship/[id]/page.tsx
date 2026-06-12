"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo } from "react";
import {
  useAddScholarshipBookmark,
  useScholarshipBookmarks,
} from "@/hooks/useScholarshipBookmarks";
import { useScholarship } from "@/hooks/useScholarships";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/stores/toastStore";

type ScholarshipDetailPageProps = {
  params: { locale: string; id: string };
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
    { year: "numeric", month: "long", day: "numeric" }
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

function DetailRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="border-b border-border-default/60 py-4 last:border-b-0">
      <dt className="font-sarabun text-label font-medium text-text-muted">
        {label}
      </dt>
      <dd className="mt-1 font-sarabun text-body-md text-text-primary whitespace-pre-wrap">
        {children}
      </dd>
    </div>
  );
}

export default function ScholarshipDetailPage({
  params,
}: ScholarshipDetailPageProps) {
  const locale = useLocale();
  const t = useTranslations("scholarship");
  const tDetail = useTranslations("scholarship.detail");
  const tCard = useTranslations("scholarship.card");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const { user } = useAuthStore();
  const { data: scholarship, isLoading, isError } = useScholarship(params.id);
  const canBookmark = user?.role === "agency" || user?.role === "admin";
  const { data: bookmarks = [] } = useScholarshipBookmarks({
    enabled: canBookmark,
  });
  const addBookmarkMutation = useAddScholarshipBookmark();
  const isBookmarked = useMemo(
    () =>
      scholarship
        ? bookmarks.some((item) => item.scholarship_id === scholarship.id)
        : false,
    [bookmarks, scholarship]
  );

  if (isLoading) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted md:px-spacing-10">
        {t("common.loading")}
      </div>
    );
  }

  if (isError || !scholarship) {
    return (
      <div className="mx-auto max-w-container-max space-y-4 px-4 py-12 text-center md:px-spacing-10">
        <p className="font-sarabun text-body-md text-status-error">
          {tDetail("notFound")}
        </p>
        <Link
          href={`/${locale}/scholarship`}
          className="inline-flex font-sarabun text-label font-semibold text-primary hover:text-primary-hover"
        >
          {tDetail("back")}
        </Link>
      </div>
    );
  }

  const closed = isClosed(scholarship.close_date);
  const amountText = formatAmount(
    scholarship.amount,
    scholarship.amount_note,
    locale,
    t("common.currency")
  );

  return (
    <>
      <section className="border-b border-border-default/60 bg-surface-card px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <Link
            href={`/${locale}/scholarship`}
            className="mb-4 inline-flex font-sarabun text-label text-primary hover:text-primary-hover"
          >
            ← {tDetail("back")}
          </Link>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="font-kanit text-heading-2 text-text-primary md:text-heading-1">
                {scholarship.title}
              </h1>
              <p className="mt-1 font-sarabun text-label text-text-muted">
                {t("subtitle")}
              </p>
            </div>
            {canBookmark && (
              <button
                type="button"
                onClick={() => {
                  if (isBookmarked || addBookmarkMutation.isPending) return;
                  addBookmarkMutation.mutate(scholarship.id, {
                    onSuccess: () => toast.success(tCard("bookmarkSuccess")),
                  });
                }}
                disabled={isBookmarked || addBookmarkMutation.isPending}
                className="inline-flex min-h-[44px] items-center gap-2 rounded-radius-md border border-border-input px-4 py-2.5 font-sarabun text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:cursor-default disabled:opacity-60"
              >
                <svg
                  className="h-5 w-5"
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
                {isBookmarked ? tCard("bookmarked") : tCard("bookmark")}
              </button>
            )}
          </div>
        </div>
      </section>

      <section className="bg-surface-page px-4 py-spacing-6 md:px-spacing-10">
        <div className="mx-auto max-w-container-max">
          <div className="rounded-radius-lg border border-border-default/80 bg-surface-card p-6 shadow-level-1 md:p-8">
            <div className="mb-6 flex flex-wrap gap-2">
              <span className="rounded-radius-sm bg-primary-light px-2.5 py-1 font-sarabun text-caption font-semibold text-primary-dark">
                {tTypes(scholarship.scholarship_type)}
              </span>
              <span className="rounded-radius-sm bg-surface-container px-2.5 py-1 font-sarabun text-caption font-medium text-text-secondary">
                {tLevels(scholarship.target_level)}
              </span>
              {closed && (
                <span className="inline-flex rounded-radius-sm bg-status-error/10 px-2.5 py-0.5 font-sarabun text-caption font-semibold text-status-error">
                  {t("common.closedBadge")}
                </span>
              )}
            </div>

            <dl>
              {scholarship.description && (
                <DetailRow label={tDetail("description")}>
                  {scholarship.description}
                </DetailRow>
              )}

              <DetailRow label={tDetail("eligibility")}>
                {scholarship.eligibility}
              </DetailRow>

              <DetailRow label={tDetail("type")}>
                {tTypes(scholarship.scholarship_type)}
              </DetailRow>

              <DetailRow label={tDetail("level")}>
                {tLevels(scholarship.target_level)}
              </DetailRow>

              {amountText && (
                <DetailRow label={tDetail("amount")}>{amountText}</DetailRow>
              )}

              <DetailRow label={tDetail("openDate")}>
                {formatDate(scholarship.open_date, locale)}
              </DetailRow>

              <DetailRow label={tDetail("closeDate")}>
                <span className="inline-flex items-center gap-2">
                  {formatDate(scholarship.close_date, locale)}
                  {closed && (
                    <span className="inline-flex rounded-radius-sm bg-status-error/10 px-2.5 py-0.5 font-sarabun text-caption font-semibold text-status-error">
                      {t("common.closedBadge")}
                    </span>
                  )}
                </span>
              </DetailRow>

              {scholarship.contact_phone && (
                <DetailRow label={tDetail("phone")}>
                  <a
                    href={`tel:${scholarship.contact_phone}`}
                    className="text-primary hover:text-primary-hover"
                  >
                    {scholarship.contact_phone}
                  </a>
                </DetailRow>
              )}

              {scholarship.contact_email && (
                <DetailRow label={tDetail("email")}>
                  <a
                    href={`mailto:${scholarship.contact_email}`}
                    className="text-primary hover:text-primary-hover"
                  >
                    {scholarship.contact_email}
                  </a>
                </DetailRow>
              )}
            </dl>

            {scholarship.application_url && (
              <div className="mt-8 border-t border-border-default/60 pt-6">
                <a
                  href={scholarship.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-[44px] items-center justify-center rounded-radius-md bg-primary px-6 font-sarabun text-label font-semibold text-white transition-colors hover:bg-primary-hover"
                >
                  {tDetail("apply")}
                </a>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
}
