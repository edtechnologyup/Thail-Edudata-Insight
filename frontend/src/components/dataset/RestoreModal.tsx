"use client";

import { useTranslations } from "next-intl";
import { useRestoreVersion } from "@/hooks/useRestoreVersion";

type RestoreModalProps = {
  datasetId: string;
  version: string | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function RestoreModal({
  datasetId,
  version,
  open,
  onClose,
  onSuccess,
  onError,
}: RestoreModalProps) {
  const t = useTranslations("agency.versions");
  const restoreMutation = useRestoreVersion();

  if (!open || !version) {
    return null;
  }

  const handleRestore = async () => {
    try {
      await restoreMutation.mutateAsync({ datasetId, version });
      onClose();
      onSuccess();
    } catch {
      onError(t("restoreError"));
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="restore-version-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-8 shadow-level-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-radius-full bg-primary-light">
            <HistoryIcon />
          </div>
          <h2
            id="restore-version-title"
            className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
          >
            {t("restoreConfirmTitle")}
          </h2>
          <p className="mb-1 font-sarabun text-body-lg text-text-primary">
            {t("restoreConfirmMsg", { version: `Version ${version}` })}
          </p>
          <p className="mb-8 font-sarabun text-caption text-text-muted">
            {t("restoreNote")}
          </p>
          <div className="flex w-full gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={restoreMutation.isPending}
              className="flex-1 rounded-radius-md border border-primary-dark py-3 font-kanit text-label font-bold text-primary-dark transition-colors hover:bg-surface-container disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleRestore}
              disabled={restoreMutation.isPending}
              className="flex-1 rounded-radius-md bg-primary-action py-3 font-kanit text-label font-bold text-white shadow-level-1 transition-all hover:bg-primary-action-hover disabled:opacity-50"
            >
              {restoreMutation.isPending ? t("restoring") : t("restore")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function HistoryIcon() {
  return (
    <svg
      className="h-8 w-8 text-primary-dark"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M13 3a9 9 0 0 0-9 9H1l3.89 3.89.07.14L9 12H6c0-3.87 3.13-7 7-7s7 3.13 7 7-3.13 7-7 7-7-7-7v2l-4-4 4-4v2z" />
    </svg>
  );
}
