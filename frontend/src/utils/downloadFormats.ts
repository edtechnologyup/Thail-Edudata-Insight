import type { DownloadFormat } from "@/hooks/useDownloadDataset";

const TABULAR_FORMATS: DownloadFormat[] = ["csv", "excel", "json", "xml"];

const SINGLE_FORMAT_SOURCES = new Set<DownloadFormat>(["pdf", "sql"]);

export function getAvailableDownloadFormats(
  sourceFormat: string | null | undefined
): DownloadFormat[] {
  const source = (sourceFormat ?? "csv").toLowerCase() as DownloadFormat;

  if (SINGLE_FORMAT_SOURCES.has(source)) {
    return [source];
  }

  return [...TABULAR_FORMATS];
}

export const DOWNLOAD_FORMAT_LABELS: Record<DownloadFormat, string> = {
  csv: "CSV",
  excel: "Excel",
  json: "JSON",
  xml: "XML",
  pdf: "PDF",
  sql: "SQL",
};
