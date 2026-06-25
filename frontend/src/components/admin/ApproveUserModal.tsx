"use client";

import { useLocale, useTranslations } from "next-intl";
import type { AdminUser } from "@/types/admin";
import { useApproveUser } from "@/hooks/useApproveUser";

type ApproveUserModalProps = {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function ApproveUserModal({
  user,
  open,
  onClose,
  onSuccess,
  onError,
}: ApproveUserModalProps) {
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const approveMutation = useApproveUser();

  if (!open || !user) {
    return null;
  }

  const agencyName = locale === "th" ? user.agencyName : user.agencyNameEn;

  const handleApprove = async () => {
    try {
      await approveMutation.mutateAsync(user.id);
      onClose();
      onSuccess();
    } catch {
      onError(t("actionError"));
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-radius-full bg-primary-light">
            <CheckIcon />
          </div>
          <h2 className="mb-2 font-kanit text-heading-3 font-bold text-text-primary">
            {t("approveTitle")}
          </h2>
          <p className="mb-8 font-sarabun text-body-md text-text-secondary">
            {t("approveMsg", { agency: agencyName })}
          </p>
          <div className="flex w-full gap-4">
            <button
              type="button"
              onClick={onClose}
              disabled={approveMutation.isPending}
              className="flex-1 rounded-radius-lg border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleApprove}
              disabled={approveMutation.isPending}
              className="flex-1 rounded-radius-lg bg-primary-dark py-3 font-sarabun text-label font-medium text-white hover:bg-primary-hover disabled:opacity-50"
            >
              {approveMutation.isPending ? t("approving") : t("approve")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg className="h-8 w-8 text-primary-dark" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}
