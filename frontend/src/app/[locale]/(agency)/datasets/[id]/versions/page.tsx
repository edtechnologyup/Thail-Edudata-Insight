"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import RestoreModal from "@/components/dataset/RestoreModal";
import VersionTimeline from "@/components/dataset/VersionTimeline";
import { getAgencyDatasetById } from "@/data/mockData";
import { useVersionHistory } from "@/hooks/useVersionHistory";

export default function DatasetVersionsPage() {
  const t = useTranslations("agency.versions");
  const locale = useLocale();
  const base = `/${locale}`;
  const params = useParams<{ id: string }>();
  const datasetId = params.id;

  const [restoreVersion, setRestoreVersion] = useState<string | null>(null);
  const [toastSuccess, setToastSuccess] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const { data: versions, isLoading, isError } = useVersionHistory(datasetId);

  const dataset = useMemo(
    () => getAgencyDatasetById(datasetId),
    [datasetId]
  );

  const datasetTitle =
    locale === "th" ? dataset?.title : dataset?.titleEn ?? dataset?.title ?? "";

  const handleRestoreSuccess = () => {
    setToastSuccess(t("restoreSuccess"));
    setTimeout(() => setToastSuccess(null), 3000);
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-spacing-6 pb-24">
      <header>
        <nav
          aria-label="Breadcrumb"
          className="mb-2 flex flex-wrap items-center gap-2 font-sarabun text-label text-text-muted"
        >
          <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
            {t("breadcrumbDashboard")}
          </Link>
          <ChevronIcon />
          <Link href={`${base}/datasets`} className="hover:text-primary-dark">
            {t("breadcrumbDatasets")}
          </Link>
          {datasetTitle && (
            <>
              <ChevronIcon />
              <Link
                href={`${base}/datasets/${datasetId}/edit`}
                className="hover:text-primary-dark"
              >
                {datasetTitle}
              </Link>
            </>
          )}
          <ChevronIcon />
          <span className="font-medium text-primary-dark">
            {t("breadcrumbCurrent")}
          </span>
        </nav>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        {datasetTitle && (
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {datasetTitle}
          </p>
        )}
      </header>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-8 shadow-level-1">
        {isLoading && <TimelineSkeleton />}
        {isError && (
          <p className="font-sarabun text-body-md text-status-error">{t("loadError")}</p>
        )}
        {!isLoading && !isError && versions && versions.length > 0 && (
          <VersionTimeline
            versions={versions}
            onRestore={(version) => setRestoreVersion(version)}
          />
        )}
        {!isLoading && !isError && versions?.length === 0 && (
          <p className="font-sarabun text-body-md text-text-muted">{t("empty")}</p>
        )}
      </section>

      <RestoreModal
        datasetId={datasetId}
        version={restoreVersion}
        open={Boolean(restoreVersion)}
        onClose={() => setRestoreVersion(null)}
        onSuccess={handleRestoreSuccess}
        onError={(message) => {
          setToastError(message);
          setTimeout(() => setToastError(null), 3000);
        }}
      />

      {toastSuccess && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-radius-md bg-primary-action px-4 py-3 font-sarabun text-label text-white shadow-level-2">
          {toastSuccess}
        </div>
      )}
      {toastError && (
        <div className="fixed bottom-6 right-6 z-[110] rounded-radius-md bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-level-2">
          {toastError}
        </div>
      )}
    </div>
  );
}

function TimelineSkeleton() {
  return (
    <div className="animate-pulse space-y-10">
      {Array.from({ length: 3 }).map((_, index) => (
        <div key={index} className="flex gap-8">
          <div className="h-6 w-6 rounded-radius-full bg-surface-container" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-32 rounded-radius-sm bg-surface-container" />
            <div className="h-28 rounded-radius-lg bg-surface-container" />
          </div>
        </div>
      ))}
    </div>
  );
}

function ChevronIcon() {
  return (
    <svg className="h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
