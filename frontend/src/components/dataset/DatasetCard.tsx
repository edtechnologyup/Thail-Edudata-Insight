"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import type { DatasetLicense, DatasetStatus, HomeDatasetMock } from "@/types/dataset";
import { useDatasetNewBadge } from "@/hooks/useDatasetNewBadge";

type DatasetCardProps = HomeDatasetMock & {
  variant?: "popular" | "latest";
  createdAt?: string;
  index?: number;
  imageUrl?: string | null;
};

function DomainIcon() {
  return (
    <svg
      className="h-4 w-4 shrink-0"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
      />
    </svg>
  );
}

function DownloadIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
      />
    </svg>
  );
}

const FORMAT_ICON_COLORS: Record<string, { bg: string; text: string }> = {
  csv: { bg: "#e3f2fd", text: "#1565c0" },
  excel: { bg: "#e8f5e9", text: "#2e7d32" },
  xlsx: { bg: "#e8f5e9", text: "#2e7d32" },
  pdf: { bg: "#ffebee", text: "#c62828" },
  json: { bg: "#fff3e0", text: "#e65100" },
};

const FORMAT_TITLES: Record<string, string> = {
  csv: "ไฟล์ตารางข้อมูล CSV",
  excel: "ไฟล์ Excel",
  xlsx: "ไฟล์ Excel",
  pdf: "ไฟล์เอกสาร PDF",
  json: "ไฟล์ข้อมูล JSON",
  xml: "ไฟล์ข้อมูล XML",
  sql: "ไฟล์ฐานข้อมูล SQL",
};

function FileFormatIcon({ format }: { format: string }) {
  const lower = format.toLowerCase();
  const colors = FORMAT_ICON_COLORS[lower] ?? { bg: "#f5f5f5", text: "#616161" };
  return (
    <span
      title={FORMAT_TITLES[lower] ?? `ไฟล์ ${format.toUpperCase()}`}
      className="inline-flex cursor-default items-center gap-1.5 rounded-radius-md px-2.5 py-1 text-[13px] font-bold uppercase"
      style={{ backgroundColor: colors.bg, color: colors.text }}
    >
      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden>
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6zm-1 2l5 5h-5V4zM6 20V4h5v7h7v9H6z" />
      </svg>
      {format}
    </span>
  );
}

function formatDownloadCount(count: number, locale: string): string {
  if (count >= 1000) {
    const k = count / 1000;
    const formatted =
      k >= 10
        ? Math.round(k).toString()
        : k.toFixed(1).replace(/\.0$/, "");
    return `${formatted}k`;
  }
  return count.toLocaleString(locale);
}

function formatRelativeDate(iso: string, locale: string): string {
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  const rtf = new Intl.RelativeTimeFormat(locale === "th" ? "th-TH" : "en-US", {
    numeric: "auto",
  });

  if (diffDays < 1) {
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    if (diffHours < 1) {
      return rtf.format(0, "hour");
    }
    return rtf.format(-diffHours, "hour");
  }
  if (diffDays < 7) {
    return rtf.format(-diffDays, "day");
  }
  if (diffDays < 30) {
    return rtf.format(-Math.floor(diffDays / 7), "week");
  }
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatAbsoluteDate(iso: string, locale: string): string {
  const date = new Date(iso);
  return date.toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function licenseLabel(
  license: DatasetLicense,
  t: ReturnType<typeof useTranslations<"dataset">>
) {
  if (license === "open") return t("licenseOpen");
  if (license === "conditional") return t("licenseConditional");
  return t("licenseCc");
}

function statusLabel(
  status: DatasetStatus,
  t: ReturnType<typeof useTranslations<"dataset">>
) {
  if (status === "published") return t("statusPublished");
  if (status === "draft") return t("statusDraft");
  return t("statusPublished");
}

export default function DatasetCard({
  id,
  title,
  description,
  category,
  agency,
  status,
  downloadCount,
  apiDownloadCount = 0,
  viewCount = 0,
  qualityScore,
  fileFormat,
  updatedAt,
  createdAt,
  publishedAt,
  license,
  variant = "popular",
  index = 0,
  imageUrl,
  ratingAvg = null,
  ratingCount = 0,
}: DatasetCardProps) {
  const t = useTranslations("dataset");
  const tCommon = useTranslations("notifications");
  const locale = useLocale();
  const showNewBadge = useDatasetNewBadge(id, publishedAt);

  const isUpdated =
    createdAt && updatedAt
      ? new Date(updatedAt).getTime() !== new Date(createdAt).getTime()
      : false;

  const isPublished = status === "published";

  if (variant === "latest") {
    const latestBg = "white";
    const latestText = "#191c1e";
    const latestSub = "#3c4946";
    const latestMuted = "#6c7a76";
    return (
      <Link
        href={`/${locale}/datasets/${id}`}
        className="group flex overflow-hidden rounded-2xl shadow-level-1 transition-all hover:shadow-level-2"
        style={{ backgroundColor: latestBg }}
      >
        <div className="flex flex-1 items-start gap-4 p-4 md:p-5">
          <div className="min-w-0 flex-1">
            <h3 className="mb-1 font-kanit text-body-md font-semibold md:text-heading-3" style={{ color: latestText }}>
              {title}
            </h3>
            <p className="mb-2 font-sarabun text-body-sm line-clamp-1" style={{ color: latestSub }}>
              {t("agency")}: {agency}
            </p>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 font-sarabun text-caption" style={{ color: latestMuted }}>
              {fileFormat && <FileFormatIcon format={fileFormat} />}
              <span className="flex items-center gap-1">
                <DownloadIcon />
                {formatDownloadCount(downloadCount, locale)}
              </span>
              {viewCount > 0 && (
                <span className="flex items-center gap-1">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {formatDownloadCount(viewCount, locale)}
                </span>
              )}
            </div>
          </div>
          <span className="shrink-0 font-sarabun text-caption" style={{ color: latestMuted }}>
            {formatRelativeDate(updatedAt, locale)}
          </span>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/${locale}/datasets/${id}`}
      className="group flex w-full shrink-0 snap-start flex-col overflow-hidden rounded-2xl border border-border-default bg-surface-card shadow-level-1 transition-all hover:-translate-y-1 hover:shadow-level-2"
    >
      <div
        className="relative w-full overflow-hidden rounded-t-radius-xl"
        style={{ height: "192px", backgroundColor: index % 2 === 0 ? "var(--color-primary)" : "var(--color-primary-light)" }}
      >
        {imageUrl && (
          <img
            src={`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ""}${imageUrl}`}
            alt={title}
            className="h-full w-full object-cover"
          />
        )}
      </div>

      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex min-w-0 items-center gap-2">
          <span className="truncate rounded-radius-md bg-primary-light px-2 py-0.5 font-sarabun text-caption font-semibold text-primary-dark">
            {category}
          </span>
          {isPublished && (
            <span className="shrink-0 font-sarabun text-caption font-semibold text-status-published">
              {statusLabel(status, t)}
            </span>
          )}
          {showNewBadge && (
            <span className="inline-flex shrink-0 animate-new-blink items-center gap-1 rounded-radius-full bg-status-error px-2 py-0.5 font-sarabun text-caption font-bold text-white">
              <span className="h-1.5 w-1.5 animate-new-blink rounded-radius-full bg-white" />
              {tCommon("newBadge")}
            </span>
          )}
        </div>

        <h3 className="mb-2 line-clamp-2 font-kanit text-body-md font-semibold text-text-primary transition-colors group-hover:text-primary-dark md:text-heading-3">
          {title}
        </h3>

        <p className="mb-2 font-sarabun text-body-sm text-text-secondary line-clamp-1">
          {t("agency")}: {agency}
        </p>

        {description && (
          <p className="mb-3 line-clamp-2 font-sarabun text-body-sm text-text-muted">
            {description}
          </p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-border-default/60 pt-3 font-sarabun text-label text-text-secondary">
          <span className="flex items-center gap-1.5">
            <DownloadIcon className="h-5 w-5" />
            {formatDownloadCount(downloadCount, locale)}
          </span>
          <span className="flex items-center gap-1.5">
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {formatDownloadCount(viewCount, locale)}
          </span>
          <span className="flex items-center gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => {
              const filled = ratingAvg != null && i < Math.round(ratingAvg);
              return (
                <svg key={i} className="h-5 w-5" fill={filled ? "#f9a825" : "#e0e0e0"} viewBox="0 0 24 24" aria-hidden>
                  <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              );
            })}
            {ratingAvg != null && ratingCount > 0 && (
              <span className="ml-1.5 font-bold" style={{ color: "#ba7517" }}>
                {ratingAvg.toFixed(1)}{" "}
                <span className="font-normal text-text-muted">({ratingCount})</span>
              </span>
            )}
          </span>
        </div>
      </div>
    </Link>
  );
}
