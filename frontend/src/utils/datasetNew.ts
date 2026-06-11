const NEW_DATASET_DAYS = 3;
const VIEWED_DATASETS_KEY = "viewedNewDatasetIds";

export function isDatasetNew(
  publishedAt: string | null | undefined,
  days = NEW_DATASET_DAYS
): boolean {
  if (!publishedAt) return false;
  const published = new Date(publishedAt).getTime();
  if (Number.isNaN(published)) return false;
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  return published >= cutoff;
}

export function getViewedNewDatasetIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(VIEWED_DATASETS_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw) as unknown;
    return new Set(
      Array.isArray(parsed) ? parsed.filter((id) => typeof id === "string") : []
    );
  } catch {
    return new Set();
  }
}

export function markDatasetAsViewed(datasetId: string): void {
  if (typeof window === "undefined") return;
  const ids = getViewedNewDatasetIds();
  if (ids.has(datasetId)) return;
  ids.add(datasetId);
  localStorage.setItem(VIEWED_DATASETS_KEY, JSON.stringify([...ids]));
  window.dispatchEvent(
    new CustomEvent("dataset-viewed", { detail: { datasetId } })
  );
}

export function shouldShowNewBadge(
  datasetId: string,
  publishedAt: string | null | undefined
): boolean {
  return isDatasetNew(publishedAt) && !getViewedNewDatasetIds().has(datasetId);
}
