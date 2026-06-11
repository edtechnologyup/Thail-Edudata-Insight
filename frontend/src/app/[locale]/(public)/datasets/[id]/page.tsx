"use client";

import { useState } from "react";
import DatasetDetailPageClient from "@/components/dataset/DatasetDetailPageClient";
import apiClient from "@/services/api";

type DatasetDetailPageProps = {
  params: { locale: string; id: string };
};

function getFilename(contentDisposition: string | undefined, datasetId: string) {
  if (!contentDisposition) {
    return `dataset-${datasetId}.pdf`;
  }

  const match = contentDisposition.match(/filename="?([^"]+)"?/i);
  return match?.[1] ?? `dataset-${datasetId}.pdf`;
}

export default function DatasetDetailPage({ params }: DatasetDetailPageProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const handleExportPdf = async () => {
    setIsExporting(true);
    setToast(null);

    try {
      const response = await apiClient.get(`/datasets/${params.id}/export-pdf`, {
        responseType: "blob",
      });
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = getFilename(
        response.headers["content-disposition"],
        params.id
      );
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      setToast("Export PDF ไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      window.setTimeout(() => setToast(null), 3000);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="relative">
      <div className="mx-auto flex max-w-container-max justify-end px-4 pt-6 md:px-spacing-10">
        <button
          type="button"
          onClick={handleExportPdf}
          disabled={isExporting}
          className="inline-flex min-h-[44px] items-center gap-2 rounded-radius-md bg-primary px-5 font-sarabun text-label font-semibold text-white shadow-level-1 transition-colors hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isExporting && (
            <span className="h-4 w-4 animate-spin rounded-radius-full border-2 border-white/40 border-t-white" />
          )}
          Export PDF
        </button>
      </div>

      <DatasetDetailPageClient id={params.id} locale={params.locale} />

      {toast && (
        <div
          className="fixed bottom-6 right-6 z-[110] rounded-radius-lg bg-status-error px-5 py-3 font-sarabun text-body-md text-surface-card shadow-level-2"
          role="status"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
