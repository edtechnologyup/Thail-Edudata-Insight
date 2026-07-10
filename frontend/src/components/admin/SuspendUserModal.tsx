"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { AdminUser } from "@/types/admin";
import { useSuspendUser } from "@/hooks/useSuspendUser";

type SuspendUserModalProps = {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function SuspendUserModal({
  user,
  open,
  onClose,
  onSuccess,
  onError,
}: SuspendUserModalProps) {
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const suspendMutation = useSuspendUser();
  const [reason, setReason] = useState("");

  if (!open || !user) {
    return null;
  }

  const agencyName = locale === "th" ? user.agencyName : user.agencyNameEn;
  const isValid = reason.trim().length >= 10;

  const handleSuspend = async () => {
    try {
      await suspendMutation.mutateAsync({ userId: user.id, reason: reason.trim() });
      setReason("");
      onClose();
      onSuccess();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message
        || t("suspendAdminError");
      onError(msg);
    }
  };

  const handleClose = () => {
    setReason("");
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="suspend-user-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={handleClose}
        aria-label={t("cancel")}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-radius-full bg-surface-container">
            <WarningIcon />
          </div>
          <h2
            id="suspend-user-title"
            className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
          >
            {t("suspendTitle")}
          </h2>
          <p className="mb-4 font-sarabun text-body-md text-text-secondary">
            {t("suspendMsg", { agency: agencyName })}
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t("suspendReasonPlaceholder")}
            rows={3}
            className="mb-2 w-full rounded-radius-md border border-border-default p-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          />
          {reason.length > 0 && !isValid && (
            <p className="mb-2 w-full text-left font-sarabun text-caption text-error">
              {t("suspendReasonMinLength")}
            </p>
          )}
          <div className="flex w-full gap-4">
            <button
              type="button"
              onClick={handleClose}
              disabled={suspendMutation.isPending}
              className="flex-1 rounded-radius-lg border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50"
            >
              {t("cancel")}
            </button>
            <button
              type="button"
              onClick={handleSuspend}
              disabled={suspendMutation.isPending || !isValid}
              className="flex-1 rounded-radius-lg bg-surface-container py-3 font-sarabun text-label font-medium text-text-primary hover:bg-surface-page disabled:opacity-50"
            >
              {suspendMutation.isPending ? t("suspending") : t("suspend")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg className="h-8 w-8 text-text-muted" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
    </svg>
  );
}
