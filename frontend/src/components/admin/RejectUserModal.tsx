"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useLocale, useTranslations } from "next-intl";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { AdminUser } from "@/types/admin";
import { useRejectUser } from "@/hooks/useRejectUser";

const rejectSchema = z.object({
  reason: z.string().min(10, "minLength"),
});

type RejectFormValues = z.infer<typeof rejectSchema>;

type RejectUserModalProps = {
  user: AdminUser | null;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
};

export default function RejectUserModal({
  user,
  open,
  onClose,
  onSuccess,
  onError,
}: RejectUserModalProps) {
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const rejectMutation = useRejectUser();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<RejectFormValues>({
    resolver: zodResolver(rejectSchema),
    defaultValues: { reason: "" },
  });

  const reasonValue = watch("reason") ?? "";

  useEffect(() => {
    if (open) {
      reset({ reason: "" });
    }
  }, [open, reset]);

  if (!open || !user) {
    return null;
  }

  const agencyName = locale === "th" ? user.agencyName : user.agencyNameEn;

  const onSubmit = handleSubmit(async (values) => {
    try {
      await rejectMutation.mutateAsync({
        userId: user.id,
        reason: values.reason,
      });
      onClose();
      onSuccess();
    } catch {
      onError(t("actionError"));
    }
  });

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reject-user-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-overlay backdrop-blur-sm"
        onClick={onClose}
        aria-label={t("cancel")}
      />
      <form
        onSubmit={onSubmit}
        className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3"
      >
        <h2
          id="reject-user-title"
          className="mb-2 font-kanit text-heading-3 font-bold text-text-primary"
        >
          {t("rejectTitle")}
        </h2>
        <p className="mb-4 font-sarabun text-body-md text-text-muted">
          {t("rejectDesc", { agency: agencyName })}
        </p>
        <label className="mb-1 block font-sarabun text-label font-medium text-text-secondary">
          {t("rejectReason")}
        </label>
        <textarea
          {...register("reason")}
          rows={4}
          className="mb-1 w-full rounded-radius-sm border border-border-input px-3 py-2 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
          placeholder={t("rejectReasonPlaceholder")}
        />
        {errors.reason ? (
          <p className="mb-4 font-sarabun text-caption text-status-error">
            {t("rejectReasonMin")}
          </p>
        ) : (
          <div className="mb-4" />
        )}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={rejectMutation.isPending}
            className="flex-1 rounded-radius-lg border border-border-default py-3 font-sarabun text-label font-medium text-text-secondary hover:bg-surface-container disabled:opacity-50"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            disabled={rejectMutation.isPending || reasonValue.trim().length < 10}
            className="flex-1 rounded-radius-lg bg-status-error py-3 font-sarabun text-label font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {rejectMutation.isPending ? t("rejecting") : t("reject")}
          </button>
        </div>
      </form>
    </div>
  );
}
