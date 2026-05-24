"use client";

import { useTranslations } from "next-intl";
import type { AdminDataset } from "@/data/mockData";
import { useAdminDeleteDataset } from "@/hooks/useAdminDeleteDataset";

type DeleteDatasetModalProps = {
  dataset: AdminDataset | null;
  title: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function DeleteDatasetModal({
  dataset,
  title,
  open,
  onClose,
  onSuccess,
  onError,
}: DeleteDatasetModalProps) {
  const t = useTranslations("admin.datasets");
  const deleteMutation = useAdminDeleteDataset();

  if (!open || !dataset) {
    return null;
  }

  const handleDelete = async () => {
    try {
      await deleteMutation.mutateAsync(dataset.id);
      onClose();
      onSuccess();
    } catch {
      onError(t("deleteError"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-delete-dataset-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-8 shadow-level-3">
        <div className="mb-6 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-radius-full bg-status-error-bg">
            <WarningIcon />
          </div>
          <h2
            id="admin-delete-dataset-title"
            className="font-kanit text-heading-3 font-bold text-text-primary"
          >
            {t("deleteTitle")}
          </h2>
        </div>
        <div className="mb-8 space-y-2">
          <p className="font-sarabun text-body-md text-text-secondary">
            {t("deleteMsg", { title })}
          </p>
          <p className="font-sarabun text-label text-status-error">
            {t("deleteWarning")}
          </p>
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            className="flex-1 rounded-radius-lg border border-border-default py-2.5 font-sarabun text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="flex-1 rounded-radius-lg bg-status-error py-2.5 font-sarabun text-label font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {deleteMutation.isPending ? t("deleting") : t("confirmDelete")}
          </button>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg className="h-8 w-8 text-status-error" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
    </svg>
  );
}
