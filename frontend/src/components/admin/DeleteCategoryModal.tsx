"use client";

import { useTranslations } from "next-intl";
import {
  useDeleteCategory,
  type AdminCategoryTreeNode,
} from "@/hooks/useAdminCategories";

type DeleteCategoryModalProps = {
  open: boolean;
  target: AdminCategoryTreeNode | null;
  displayName: string;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function DeleteCategoryModal({
  open,
  target,
  displayName,
  onClose,
  onSuccess,
  onError,
}: DeleteCategoryModalProps) {
  const t = useTranslations("admin.categories");
  const deleteMutation = useDeleteCategory();

  if (!open || !target) {
    return null;
  }

  const hasDatasets = target.datasetCount > 0;
  const hasChildren = target.childCount > 0;

  const handleDelete = async (force: boolean = false) => {
    try {
      await deleteMutation.mutateAsync({ id: target.id, force });
      onSuccess();
      onClose();
    } catch {
      onError(t("deleteError"));
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-delete-category-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-xl">
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
            <WarningIcon />
          </div>

          {hasChildren ? (
            <>
              <h2
                id="admin-delete-category-title"
                className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
              >
                {t("deleteBlockedTitle")}
              </h2>
              <p className="mb-6 px-4 font-sarabun text-body-md text-text-secondary">
                {t("deleteErrorChildren")}
              </p>
              <button
                type="button"
                onClick={onClose}
                className="w-full rounded-full bg-surface-container-highest py-3 font-kanit text-label font-bold text-text-primary transition-colors hover:bg-surface-container"
              >
                {t("close")}
              </button>
            </>
          ) : hasDatasets ? (
            <>
              <h2
                id="admin-delete-category-title"
                className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
              >
                ลบหมวดหมู่ไม่ได้
              </h2>
              <p className="mb-2 px-4 font-sarabun text-body-md text-text-secondary">
                หมวดหมู่ &quot;{displayName}&quot; มี{" "}
                <span className="font-bold text-status-error">
                  {target.datasetCount} dataset
                </span>{" "}
                อยู่ ยังลบไม่ได้
              </p>
              <p className="mb-6 font-sarabun text-label text-text-muted">
                ต้องการลบ dataset ทั้งหมดในหมวดนี้แล้วลบหมวดหมู่ด้วยหรือไม่?
              </p>
              <div className="flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleteMutation.isPending}
                  className="w-full rounded-full border border-border-default py-3 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
                >
                  ไม่ลบ
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(true)}
                  disabled={deleteMutation.isPending}
                  className="w-full rounded-full bg-status-error py-3 font-kanit text-label font-medium text-surface-card transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? "กำลังลบ..." : "ลบทั้งหมด"}
                </button>
              </div>
            </>
          ) : (
            <>
              <h2
                id="admin-delete-category-title"
                className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
              >
                {t("deleteTitle")}
              </h2>
              <p className="mb-6 px-4 font-sarabun text-body-md text-text-secondary">
                {t("deleteMsg", { name: displayName })}
              </p>
              <div className="flex w-full flex-col gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={deleteMutation.isPending}
                  className="w-full rounded-full border border-border-default py-3 font-kanit text-label font-medium text-text-secondary transition-colors hover:bg-surface-container disabled:opacity-50"
                >
                  {t("cancel")}
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(false)}
                  disabled={deleteMutation.isPending}
                  className="w-full rounded-full bg-status-error py-3 font-kanit text-label font-medium text-surface-card transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {deleteMutation.isPending ? t("deleting") : t("confirmDelete")}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg
      className="h-10 w-10 text-status-error"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
    </svg>
  );
}
