"use client";

import { notFound } from "next/navigation";
import { useMemo } from "react";
import CategoryPageContent from "@/components/category/CategoryPageContent";
import { useCategories } from "@/hooks/useCategories";
import { useCategoryDatasets } from "@/hooks/useCategoryDatasets";
import {
  applyDatasetCounts,
  buildCategoryTreeFromApi,
  findCategoryPageBySlug,
  getCategoryFilterIds,
} from "@/utils/publicCategoryApi";

type CategorySlugPageClientProps = {
  slug: string;
};

export default function CategorySlugPageClient({
  slug,
}: CategorySlugPageClientProps) {
  const { data: categories = [], isLoading, isError } = useCategories();

  const tree = useMemo(
    () => buildCategoryTreeFromApi(categories),
    [categories]
  );

  const pageData = useMemo(
    () => findCategoryPageBySlug(slug, tree),
    [slug, tree]
  );

  const filterIds = useMemo(() => {
    if (!pageData) return [];
    return getCategoryFilterIds(pageData, categories);
  }, [pageData, categories]);

  const { data: datasets = [], isLoading: datasetsLoading } =
    useCategoryDatasets(filterIds, categories);

  const pageDataWithCounts = useMemo(() => {
    if (!pageData) return null;
    const treeWithCounts = applyDatasetCounts(tree, datasets);
    return findCategoryPageBySlug(slug, treeWithCounts);
  }, [pageData, tree, datasets, slug]);

  if (isLoading || datasetsLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center font-sarabun text-body-md text-text-muted">
        Loading...
      </div>
    );
  }

  if (isError || !pageDataWithCounts) {
    notFound();
  }

  return (
    <CategoryPageContent
      pageData={pageDataWithCounts}
      datasets={datasets}
    />
  );
}
