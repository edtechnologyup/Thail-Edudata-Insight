import type { DatasetDetailView, ApiDataset } from "@/types/dataset";
import type {
  DatasetLicense,
  DatasetPreviewColumn,
  DatasetStatus,
} from "@/data/mockData";
import type { ApiCategory } from "@/utils/categoryApi";
import type { DatasetCitationData, DatasetPreviewData } from "@/types/dataset";

export function resolveCategoryLabels(
  categoryId: string | null,
  categories: ApiCategory[],
  locale: string
): { categoryLabel: string; subcategoryLabel: string } {
  if (!categoryId) {
    return { categoryLabel: "—", subcategoryLabel: "" };
  }

  const level2 = categories.find((c) => String(c.id) === String(categoryId));
  if (!level2) {
    return { categoryLabel: "—", subcategoryLabel: "" };
  }

  const pick = (c: ApiCategory) => (locale === "th" ? c.name_th : c.name_en);

  if (level2.level === 1) {
    return { categoryLabel: pick(level2), subcategoryLabel: "" };
  }

  const parent = level2.parent_id
    ? categories.find((c) => String(c.id) === String(level2.parent_id))
    : undefined;

  return {
    categoryLabel: parent ? pick(parent) : pick(level2),
    subcategoryLabel: pick(level2),
  };
}

export function buildDatasetDetailView(
  dataset: ApiDataset,
  categories: ApiCategory[],
  locale: string,
  agencyName?: string | null
): DatasetDetailView {
  const cats = resolveCategoryLabels(dataset.category_id, categories, locale);

  return {
    id: dataset.id,
    title: dataset.title,
    description: dataset.description ?? "",
    categoryLabel: cats.categoryLabel,
    subcategoryLabel: cats.subcategoryLabel,
    agencyName: agencyName ?? "—",
    publishedAt:
      dataset.published_at ?? dataset.created_at ?? new Date().toISOString(),
    downloadCount: dataset.download_count ?? 0,
    qualityScore: dataset.quality_score ?? 0,
    license: dataset.license as DatasetLicense,
    status: (dataset.status === "published"
      ? "published"
      : "draft") as DatasetStatus,
  };
}

export function mapPreviewToTable(preview: DatasetPreviewData): {
  columns: DatasetPreviewColumn[];
  rows: Record<string, string | number>[];
} {
  const masked = new Set(preview.masked_columns ?? []);
  const columns = (preview.columns ?? []).map((key) => ({
    key,
    labelTh: key,
    labelEn: key,
    masked: masked.has(key),
  }));
  return { columns, rows: preview.rows ?? [] };
}

export function assertPublishedDataset(dataset: ApiDataset): void {
  if (dataset.status !== "published") {
    const err = new Error("DATASET_NOT_FOUND");
    (err as Error & { code?: string }).code = "DATASET_NOT_FOUND";
    throw err;
  }
}

export type { DatasetCitationData };
