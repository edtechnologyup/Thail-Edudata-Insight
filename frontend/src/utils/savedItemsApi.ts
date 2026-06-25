import apiClient from "@/services/api";
import type {
  AgencyBookmarkMock,
  AgencySavedSearchMock,
  AgencySubscriptionMock,
  SavedSearchFilters,
} from "@/types/stats";

type JSendList<T> = {
  success: boolean;
  data: T[];
  pagination?: {
    page: number;
    page_size: number;
    total_items: number;
    total_pages: number;
  };
};

type JSendData<T> = {
  success: boolean;
  data: T;
};

/** ตาม claude.md #23 — Backend PaginationParams: page_size สูงสุด 100 */
const API_PAGE_SIZE = 20;

async function fetchPaginatedList<T>(
  path: string,
  extraParams?: Record<string, string | number | undefined>
): Promise<T[]> {
  const all: T[] = [];
  let page = 1;
  let totalPages = 1;

  do {
    const res = await apiClient.get<JSendList<T>>(path, {
      params: {
        page,
        page_size: API_PAGE_SIZE,
        sort: "created_at",
        order: "desc",
        ...extraParams,
      },
    });
    all.push(...(res.data.data ?? []));
    totalPages = res.data.pagination?.total_pages ?? 1;
    page += 1;
  } while (page <= totalPages);

  return all;
}

type ApiBookmark = {
  id: string;
  dataset_id: string;
  created_at: string;
};

type ApiSubscription = {
  id: string;
  category_id: string | null;
  agency_user_id: string | null;
  created_at: string;
};

type ApiSavedSearch = {
  id: string;
  name: string;
  filters: SavedSearchFilters;
  created_at: string;
};

type ApiCategory = {
  id: string;
  name_th: string;
  name_en: string;
};

type ApiDataset = {
  id: string;
  title: string;
  status: string;
  view_count: number;
  updated_at: string;
  category_id: string | null;
  user_id: string;
  metadata?: { agency?: string } | null;
};

type ApiAgencyDataset = {
  id: string;
  title: string;
  titleEn?: string;
  title_en?: string;
  category: string;
  categoryEn?: string;
  category_en?: string;
  status: string;
  downloadCount?: number;
  download_count?: number;
  view_count?: number;
  updatedAt?: string;
  updated_at?: string;
};

function mapBookmarkStatus(
  status: string
): AgencyBookmarkMock["status"] {
  if (status === "published") return "published";
  return "draft";
}

async function fetchDatasetDetail(
  datasetId: string
): Promise<ApiDataset | null> {
  try {
    const res = await apiClient.get<JSendData<ApiDataset>>(
      `/datasets/${datasetId}`
    );
    return res.data.data ?? null;
  } catch {
    return null;
  }
}

async function buildCategoryMap(): Promise<Map<string, ApiCategory>> {
  const res = await apiClient.get<JSendList<ApiCategory>>("/categories");
  const map = new Map<string, ApiCategory>();
  for (const cat of res.data.data ?? []) {
    map.set(String(cat.id), cat);
  }
  return map;
}

export async function fetchBookmarks(): Promise<AgencyBookmarkMock[]> {
  const bookmarks = await fetchPaginatedList<ApiBookmark>("/bookmarks");

  let agencyRows: ApiAgencyDataset[] = [];
  let categoryMap = new Map<string, ApiCategory>();

  try {
    [agencyRows, categoryMap] = await Promise.all([
      fetchPaginatedList<ApiAgencyDataset>("/agency/datasets", {
        sort: "updated_at",
        order: "desc",
      }),
      buildCategoryMap(),
    ]);
  } catch {
    categoryMap = await buildCategoryMap().catch(() => new Map());
  }

  const agencyById = new Map<string, ApiAgencyDataset>();
  for (const row of agencyRows) {
    agencyById.set(String(row.id), row);
  }

  const results = await Promise.all(
    bookmarks.map(async (bookmark) => {
      const datasetId = String(bookmark.dataset_id);
      const agencyRow = agencyById.get(datasetId);

      if (agencyRow) {
        return {
          id: String(bookmark.id),
          datasetId,
          title: agencyRow.title,
          titleEn: agencyRow.titleEn ?? agencyRow.title_en ?? agencyRow.title,
          category: agencyRow.category,
          categoryEn:
            agencyRow.categoryEn ?? agencyRow.category_en ?? agencyRow.category,
          agency: "-",
          agencyEn: "-",
          status: mapBookmarkStatus(agencyRow.status),
          viewCount:
            agencyRow.downloadCount ??
            agencyRow.download_count ??
            agencyRow.view_count ??
            0,
          updatedAt:
            agencyRow.updatedAt ??
            agencyRow.updated_at ??
            bookmark.created_at,
        } satisfies AgencyBookmarkMock;
      }

      const dataset = await fetchDatasetDetail(datasetId);
      if (!dataset) {
        return null;
      }

      const category = dataset.category_id
        ? categoryMap.get(String(dataset.category_id))
        : undefined;

      return {
        id: String(bookmark.id),
        datasetId,
        title: dataset.title,
        titleEn: dataset.title,
        category: category?.name_th ?? "-",
        categoryEn: category?.name_en ?? "-",
        agency:
          typeof dataset.metadata?.agency === "string"
            ? dataset.metadata.agency
            : "-",
        agencyEn:
          typeof dataset.metadata?.agency === "string"
            ? dataset.metadata.agency
            : "-",
        status: mapBookmarkStatus(dataset.status),
        viewCount: dataset.view_count ?? 0,
        updatedAt: dataset.updated_at ?? bookmark.created_at,
      } satisfies AgencyBookmarkMock;
    })
  );

  return results.filter((row): row is AgencyBookmarkMock => row !== null);
}

export async function fetchSubscriptions(): Promise<AgencySubscriptionMock[]> {
  const [subsRes, categoryMap] = await Promise.all([
    apiClient.get<JSendData<ApiSubscription[]>>("/subscriptions"),
    buildCategoryMap(),
  ]);

  const items = subsRes.data.data ?? [];

  return items.map((sub) => {
    if (sub.category_id) {
      const cat = categoryMap.get(String(sub.category_id));
      return {
        id: String(sub.id),
        type: "category" as const,
        name: cat?.name_th ?? "-",
        nameEn: cat?.name_en ?? "-",
        subscribedAt: sub.created_at,
      };
    }

    return {
      id: String(sub.id),
      type: "agency" as const,
      name: "หน่วยงาน",
      nameEn: "Agency",
      subscribedAt: sub.created_at,
    };
  });
}

export async function fetchSavedSearches(): Promise<AgencySavedSearchMock[]> {
  const res = await apiClient.get<JSendList<ApiSavedSearch>>(
    "/saved-searches"
  );

  return (res.data.data ?? []).map((item) => ({
    id: String(item.id),
    name: item.name,
    filters: (item.filters ?? {}) as SavedSearchFilters,
    createdAt: item.created_at,
  }));
}
