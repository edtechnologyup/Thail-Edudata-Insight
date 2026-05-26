"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import DatasetDetail from "@/components/dataset/DatasetDetail";
import { useDatasetDetail } from "@/hooks/useDatasetDetail";

type DatasetDetailPageClientProps = {
  id: string;
  locale: string;
};

function formatPublishedDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

function formatDownloadCount(count: number, locale: string): string {
  return count.toLocaleString(locale === "th" ? "th-TH" : "en-US");
}

export default function DatasetDetailPageClient({
  id,
  locale,
}: DatasetDetailPageClientProps) {
  const t = useTranslations("dataset");
  const tCommon = useTranslations("common");
  const base = `/${locale}`;

  const { data: dataset, isLoading, isError, error } = useDatasetDetail(id);

  if (isLoading) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-16 text-center">
        <p className="font-sarabun text-body-md text-text-muted">
          {tCommon("loading")}
        </p>
      </div>
    );
  }

  if (isError || !dataset) {
    const code = (error as Error & { code?: string })?.code;
    const isNotFound = code === "DATASET_NOT_FOUND";

    return (
      <div className="mx-auto max-w-container-max px-4 py-16 text-center">
        <p className="font-kanit text-heading-3 text-text-primary">
          {isNotFound ? t("notFound") : t("detail.loadError")}
        </p>
        {error?.message && !isNotFound && (
          <p className="mt-2 font-sarabun text-body-md text-text-secondary">
            {error.message}
          </p>
        )}
        <Link
          href={`${base}/search`}
          className="mt-6 inline-block font-sarabun text-label text-primary-dark hover:underline"
        >
          {t("detail.breadcrumbCategory")}
        </Link>
      </div>
    );
  }

  return (
    <DatasetDetail
      dataset={dataset}
      publishedDateLabel={formatPublishedDate(dataset.publishedAt, locale)}
      downloadCountLabel={formatDownloadCount(dataset.downloadCount, locale)}
    />
  );
}
