"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

type SubcategoryCardProps = {
  slug: string;
  name: string;
  datasetCount: number;
};

export default function SubcategoryCard({
  slug,
  name,
  datasetCount,
}: SubcategoryCardProps) {
  const locale = useLocale();
  const t = useTranslations("category");

  return (
    <Link
      href={`/${locale}/categories/${slug}`}
      className="group rounded-radius-lg border border-border-default bg-surface-card px-4 py-3 shadow-level-1 transition-all hover:border-primary/50 hover:shadow-level-2"
    >
      <h3 className="font-sarabun text-label font-medium text-text-primary transition-colors group-hover:text-primary-dark">
        {name}
      </h3>
      <p className="mt-1 font-sarabun text-caption text-text-muted">
        {t("datasetCount", { count: datasetCount })}
      </p>
    </Link>
  );
}
