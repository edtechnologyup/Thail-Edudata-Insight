"use client";

import { useLocale, useTranslations } from "next-intl";
import type { DatasetVersionItem } from "@/data/mockData";

type VersionTimelineProps = {
  versions: DatasetVersionItem[];
  onRestore: (version: string) => void;
};

export default function VersionTimeline({
  versions,
  onRestore,
}: VersionTimelineProps) {
  const t = useTranslations("agency.versions");
  const locale = useLocale();

  return (
    <div className="flex flex-col gap-10">
      {versions.map((item, index) => (
        <VersionItem
          key={item.version}
          item={item}
          locale={locale}
          isLast={index === versions.length - 1}
          onRestore={onRestore}
          t={t}
        />
      ))}
    </div>
  );
}

type VersionItemProps = {
  item: DatasetVersionItem;
  locale: string;
  isLast: boolean;
  onRestore: (version: string) => void;
  t: ReturnType<typeof useTranslations<"agency.versions">>;
};

function VersionItem({
  item,
  locale,
  isLast,
  onRestore,
  t,
}: VersionItemProps) {
  const createdBy = locale === "th" ? item.createdByTh : item.createdByEn;
  const changelogItems = locale === "th" ? item.changelogTh : item.changelogEn;
  const formattedDate = formatVersionDate(item.createdAt, locale);

  return (
    <article className="relative flex gap-8">
      <div className="relative flex-shrink-0">
        {!isLast && (
          <span
            className="absolute left-[11px] top-6 bottom-[-40px] w-0.5 bg-border-default"
            aria-hidden
          />
        )}
        <span
          className={`relative z-10 block rounded-radius-full border-4 border-surface-card bg-primary-action shadow-sm ${
            item.isCurrent ? "h-6 w-6" : "h-6 w-6"
          }`}
          aria-hidden
        />
      </div>

      <div className="min-w-0 flex-1 -mt-1">
        <div
          className={`mb-3 flex flex-wrap items-center gap-4 ${
            item.isCurrent ? "" : "justify-between"
          }`}
        >
          <div className="flex flex-wrap items-center gap-4">
            <h3 className="font-kanit text-heading-2 font-bold text-text-primary">
              {t("versionLabel", { version: item.version })}
            </h3>
            {item.isCurrent && (
              <span className="rounded-radius-full bg-primary-light px-3 py-0.5 font-sarabun text-label font-bold text-primary-dark">
                {t("current")}
              </span>
            )}
          </div>
          {!item.isCurrent && (
            <button
              type="button"
              onClick={() => onRestore(item.version)}
              className="inline-flex items-center gap-2 rounded-radius-md border border-primary-dark px-4 py-2 font-sarabun text-label font-bold text-primary-dark transition-colors hover:bg-surface-container"
            >
              <RestoreIcon />
              {t("restore")}
            </button>
          )}
        </div>

        <div
          className={`grid grid-cols-1 gap-6 rounded-radius-lg border p-6 md:grid-cols-2 ${
            item.isCurrent
              ? "border-border-default/30 bg-surface-container/30"
              : "border-border-default bg-transparent"
          }`}
        >
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-text-muted">
              <CalendarIcon />
              <span className="font-sarabun text-label">{formattedDate}</span>
            </div>
            <div className="flex items-center gap-2 text-text-primary">
              <PersonIcon isSystem={item.changelogType === "initial"} />
              <span className="font-sarabun text-body-md font-medium">
                {createdBy}
              </span>
            </div>
          </div>

          <div className="space-y-3">
            <p className="font-sarabun text-label font-medium text-text-secondary">
              {t("changelog")}
            </p>
            {changelogItems.map((entry) => (
              <div key={entry} className="flex flex-wrap items-start gap-2">
                <ChangelogBadge type={item.changelogType} t={t} />
                <p className="font-sarabun text-body-md text-text-primary">{entry}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </article>
  );
}

function ChangelogBadge({
  type,
  t,
}: {
  type: DatasetVersionItem["changelogType"];
  t: ReturnType<typeof useTranslations<"agency.versions">>;
}) {
  if (type === "edit") {
    return (
      <span className="rounded-radius-sm bg-status-warning-bg px-2 py-0.5 font-sarabun text-caption font-bold text-status-warning">
        {t("changelogEdit")}
      </span>
    );
  }

  return (
    <span className="rounded-radius-sm bg-status-published-bg px-2 py-0.5 font-sarabun text-caption font-bold text-primary-dark">
      {type === "initial" ? t("changelogInitial") : t("changelogAdd")}
    </span>
  );
}

function formatVersionDate(iso: string, locale: string): string {
  const date = new Date(iso);
  return new Intl.DateTimeFormat(locale === "th" ? "th-TH" : "en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

function CalendarIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 16H5V10h14v10ZM5 8V6h14v2H5Z" />
    </svg>
  );
}

function PersonIcon({ isSystem }: { isSystem: boolean }) {
  void isSystem;
  return (
    <svg
      className="h-4 w-4 text-primary-dark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4Zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4Z" />
    </svg>
  );
}

function RestoreIcon() {
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8Z" />
    </svg>
  );
}
