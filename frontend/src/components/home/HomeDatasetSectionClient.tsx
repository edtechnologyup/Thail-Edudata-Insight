"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import DatasetCard from "@/components/dataset/DatasetCard";
import { useCategories } from "@/hooks/useCategories";
import { useNewReleases } from "@/hooks/useNewReleases";
import { useTrendingDatasets } from "@/hooks/useTrendingDatasets";
import { mapApiDatasetToHomeCard } from "@/utils/statsMappers";

type HomeDatasetSectionClientProps = {
  locale: string;
  variant: "popular" | "latest";
  embedded?: boolean;
};

function DatasetCardSkeleton() {
  return (
    <div className="animate-pulse rounded-2xl border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
      <div className="mb-4 h-5 w-3/4 rounded-radius-sm bg-surface-container" />
      <div className="mb-2 h-4 w-1/2 rounded-radius-sm bg-surface-container" />
      <div className="h-4 w-2/3 rounded-radius-sm bg-surface-container" />
    </div>
  );
}

export default function HomeDatasetSectionClient({
  locale,
  variant,
  embedded = false,
}: HomeDatasetSectionClientProps) {
  const t = useTranslations(
    variant === "popular" ? "home.popular" : "home.latest"
  );
  const uiLocale = useLocale();

  const trendingQuery = useTrendingDatasets();
  const newReleasesQuery = useNewReleases();
  const { data: categories = [] } = useCategories();

  const query = variant === "popular" ? trendingQuery : newReleasesQuery;
  const datasets = (query.data?.datasets ?? []).map((d) =>
    mapApiDatasetToHomeCard(d, categories, uiLocale)
  );

  const header = (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
      <div>
        <h2 className="font-kanit text-heading-2 text-text-primary">
          {t("title")}
        </h2>
        <p className="mt-2 font-sarabun text-body-md text-text-secondary">
          {t("subtitle")}
        </p>
      </div>
      <Link
        href={`/${locale}/search`}
        className="inline-flex shrink-0 items-center gap-1 py-2 font-sarabun text-label font-bold text-primary-dark hover:underline"
      >
        {t("viewAll")}
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </Link>
    </div>
  );

  const content = (
    <>
      {query.isLoading && (
        variant === "latest" ? (
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <DatasetCardSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <DatasetCardSkeleton key={i} />
            ))}
          </div>
        )
      )}

      {query.isError && (
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {query.error?.message ?? t("loadError")}
        </p>
      )}

      {query.isSuccess && datasets.length === 0 && (
        <p className="font-sarabun text-body-md text-text-muted">
          {t("empty")}
        </p>
      )}

      {query.isSuccess && datasets.length > 0 && (
        variant === "latest" ? (
          <div className="space-y-4">
            {datasets.map((dataset, i) => (
              <DatasetCard key={dataset.id} {...dataset} variant="latest" index={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {datasets.slice(0, 6).map((dataset, i) => (
              <DatasetCard key={dataset.id} {...dataset} variant="popular" index={i} imageUrl={dataset.imageUrl} />
            ))}
          </div>
        )
      )}
    </>
  );

  if (embedded) {
    return (
      <>
        {header}
        {content}
      </>
    );
  }

  const bgClass =
    variant === "popular" ? "" : "";

  return (
    <section className={`py-12 md:py-20 ${bgClass}`}>
      <div className="mx-auto max-w-container-max px-4 md:px-10">
        {header}
        {content}
      </div>
    </section>
  );
}
