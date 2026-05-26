import apiClient from "@/services/api";
import type {
  DatasetDetailMock,
  DatasetLicense,
  DatasetPreviewColumn,
  DatasetStatus,
} from "@/data/mockData";
import type { ApiCategory } from "@/utils/categoryApi";

type ApiDataset = {
  id: string;
  title: string;
  description: string | null;
  status: string;
  license: string;
  category_id: string | null;
  tags: string[];
  metadata?: Record<string, unknown> | null;
  quality_score: number | null;
  download_count: number;
  published_at: string | null;
  created_at: string;
};

type PreviewApi = {
  rows: Record<string, string | number>[];
  columns: string[];
  masked_columns: string[];
};

type CitationApi = {
  apa: string;
  vancouver: string;
  agency_name: string | null;
};

function resolveCategoryLabels(
  categoryId: string | null,
  categories: ApiCategory[]
): {
  categoryTh: string;
  categoryEn: string;
  subcategoryTh: string;
  subcategoryEn: string;
} {
  if (!categoryId) {
    return {
      categoryTh: "—",
      categoryEn: "—",
      subcategoryTh: "",
      subcategoryEn: "",
    };
  }

  const level2 = categories.find((c) => String(c.id) === String(categoryId));
  if (!level2) {
    return {
      categoryTh: "—",
      categoryEn: "—",
      subcategoryTh: "",
      subcategoryEn: "",
    };
  }

  if (level2.level === 1) {
    return {
      categoryTh: level2.name_th,
      categoryEn: level2.name_en,
      subcategoryTh: "",
      subcategoryEn: "",
    };
  }

  const parent = level2.parent_id
    ? categories.find((c) => String(c.id) === String(level2.parent_id))
    : undefined;

  return {
    categoryTh: parent?.name_th ?? level2.name_th,
    categoryEn: parent?.name_en ?? level2.name_en,
    subcategoryTh: level2.name_th,
    subcategoryEn: level2.name_en,
  };
}

function buildPreviewColumns(preview: PreviewApi): DatasetPreviewColumn[] {
  const masked = new Set(preview.masked_columns ?? []);
  return (preview.columns ?? []).map((key) => ({
    key,
    labelTh: key,
    labelEn: key,
    masked: masked.has(key),
  }));
}

function mapToDatasetDetail(
  dataset: ApiDataset,
  categories: ApiCategory[],
  preview: PreviewApi | null,
  citation: CitationApi | null
): DatasetDetailMock {
  const title = dataset.title;
  const description = dataset.description ?? "";
  const cats = resolveCategoryLabels(dataset.category_id, categories);
  const agency = citation?.agency_name ?? "—";
  const apa = citation?.apa ?? "";
  const vancouver = citation?.vancouver ?? "";

  return {
    id: dataset.id,
    titleTh: title,
    titleEn: title,
    descriptionTh: description,
    descriptionEn: description,
    categoryTh: cats.categoryTh,
    categoryEn: cats.categoryEn,
    subcategoryTh: cats.subcategoryTh,
    subcategoryEn: cats.subcategoryEn,
    agencyTh: agency,
    agencyEn: agency,
    publishedAt: dataset.published_at ?? dataset.created_at ?? new Date().toISOString(),
    downloadCount: dataset.download_count ?? 0,
    qualityScore: dataset.quality_score ?? 0,
    license: dataset.license as DatasetLicense,
    status: (dataset.status === "published" ? "published" : "draft") as DatasetStatus,
    tagsTh: [],
    tagsEn: [],
    columns: preview ? buildPreviewColumns(preview) : [],
    previewData: preview?.rows ?? [],
    citationApaTh: apa,
    citationApaEn: apa,
    citationVancouverTh: vancouver,
    citationVancouverEn: vancouver,
  };
}

/** GET /datasets/{id} + preview + citation + categories */
export async function fetchDatasetDetail(
  datasetId: string
): Promise<DatasetDetailMock> {
  const [datasetRes, categoriesRes, previewRes, citationRes] =
    await Promise.all([
      apiClient.get<{ data: ApiDataset }>(`/datasets/${datasetId}`),
      apiClient.get<{ data: ApiCategory[] }>("/categories"),
      apiClient
        .get<{ data: PreviewApi }>(`/datasets/${datasetId}/preview`)
        .catch(() => null),
      apiClient
        .get<{ data: CitationApi }>(`/datasets/${datasetId}/citation`)
        .catch(() => null),
    ]);

  const dataset = datasetRes.data.data;
  if (!dataset) {
    const err = new Error("DATASET_NOT_FOUND");
    (err as Error & { code?: string }).code = "DATASET_NOT_FOUND";
    throw err;
  }

  const categories = categoriesRes.data.data ?? [];
  const preview = previewRes?.data?.data ?? null;
  const citation = citationRes?.data?.data ?? null;

  return mapToDatasetDetail(dataset, categories, preview, citation);
}
