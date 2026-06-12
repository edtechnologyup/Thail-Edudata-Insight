"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { Scholarship } from "@/hooks/useScholarships";

type ScholarshipRecentListItemProps = {
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

function formatUpdatedAt(value: string, locale: string): string {
  const updated = new Date(value);
  const now = new Date();
  const diffMs = now.getTime() - updated.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return locale === "th" ? "อัปเดตวันนี้" : "Updated today";
  }
  if (diffDays === 1) {
    return locale === "th" ? "อัปเดตเมื่อวาน" : "Updated yesterday";
  }
  if (locale === "th") {
    return `อัปเดต ${diffDays} วันที่แล้ว`;
  }
  return `Updated ${diffDays} days ago`;
}

export default function ScholarshipRecentListItem({
  scholarship,
}: ScholarshipRecentListItemProps) {
  const locale = useLocale();
  const t = useTranslations("scholarship");
  const tCard = useTranslations("scholarship.card");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const tHome = useTranslations("home.scholarships");
  const closed = isClosed(scholarship.close_date);

  return (
    <article className="rounded-radius-lg border border-border-default/80 bg-surface-card p-4 shadow-level-1 transition-colors hover:border-primary/40 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-radius-sm bg-primary-light px-2.5 py-1 font-sarabun text-caption font-semibold text-primary-dark">
              {tTypes(scholarship.scholarship_type)}
            </span>
            <span className="rounded-radius-sm bg-surface-container px-2.5 py-1 font-sarabun text-caption font-medium text-text-secondary">
              {tLevels(scholarship.target_level)}
            </span>
            <span className="font-sarabun text-caption text-text-muted">
              {formatUpdatedAt(scholarship.updated_at, locale)}
            </span>
            {closed && (
              <span className="inline-flex rounded-radius-sm bg-status-error/10 px-2.5 py-0.5 font-sarabun text-caption font-semibold text-status-error">
                {t("common.closedBadge")}
              </span>
            )}
          </div>

          <h3 className="font-kanit text-body-md font-semibold text-text-primary md:text-heading-3">
            {scholarship.title}
          </h3>

          <p className="font-sarabun text-body-sm text-text-muted">
            {tCard("agency")}: {scholarship.agency_name ?? t("common.noAgency")}
            <span className="mx-2 text-border-default">·</span>
            {tCard("closeDate")}: {formatDate(scholarship.close_date, locale)}
          </p>
        </div>

        <Link
          href={`/${locale}/scholarship/${scholarship.id}`}
          className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-radius-md border border-primary/30 px-5 font-sarabun text-label font-semibold text-primary transition-colors hover:bg-primary-light"
        >
          {tHome("viewDetail")}
        </Link>
      </div>
    </article>
  );
}
