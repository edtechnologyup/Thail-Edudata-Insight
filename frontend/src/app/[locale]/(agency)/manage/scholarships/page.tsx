"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { Scholarship } from "@/hooks/useScholarships";
import {
  useDeleteScholarship,
  useMyScholarships,
} from "@/hooks/useManageScholarships";
import { toast } from "@/stores/toastStore";

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

function StatusBadge({
  status,
  publishedLabel,
  draftLabel,
}: {
  status: Scholarship["status"];
  publishedLabel: string;
  draftLabel: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-published">
        {publishedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-radius-full bg-status-draft-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-draft">
      {draftLabel}
    </span>
  );
}

function DeleteScholarshipDialog({
  open,
  title,
  onClose,
  onConfirm,
  isDeleting,
  confirmTitle,
  confirmMsg,
  cancelLabel,
  confirmLabel,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  onConfirm: () => void;
  isDeleting: boolean;
  confirmTitle: string;
  confirmMsg: string;
  cancelLabel: string;
  confirmLabel: string;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={cancelLabel}
      />
      <div className="relative w-full max-w-md rounded-radius-lg bg-surface-card p-6 shadow-level-3">
        <h2 className="mb-2 font-kanit text-heading-3 font-bold text-text-primary">
          {confirmTitle}
        </h2>
        <p className="mb-6 font-sarabun text-body-md text-text-secondary">
          {confirmMsg.replace("{title}", title)}
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-radius-md border border-border-input px-4 py-2.5 font-sarabun text-label font-medium text-text-primary"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 rounded-radius-md bg-status-error px-4 py-2.5 font-sarabun text-label font-semibold text-white disabled:opacity-60"
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ManageScholarshipsPage() {
  const locale = useLocale();
  const base = `/${locale}`;
  const t = useTranslations("scholarship");
  const tManage = useTranslations("scholarship.manage");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<Scholarship | null>(null);

  const { data, isLoading, isError } = useMyScholarships(page);
  const deleteMutation = useDeleteScholarship();

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteMutation.mutateAsync(deleteTarget.id);
      toast.success(tManage("deleteSuccess"));
      setDeleteTarget(null);
    } catch {
      toast.error(tManage("deleteError"));
    }
  };

  const columnHeaders = [
    tManage("colTitle"),
    tManage("colType"),
    tManage("colLevel"),
    tManage("colStatus"),
    tManage("colCloseDate"),
    tManage("colActions"),
  ];

  return (
    <div className="space-y-6">
      <header className="flex flex-col justify-between gap-4 border-b border-border-default/20 pb-6 md:flex-row md:items-end">
        <div>
          <h1 className="font-kanit text-[28px] font-bold text-text-primary">
            {tManage("title")}
          </h1>
          <p className="mt-1 font-sarabun text-label text-text-muted">
            {tManage("subtitle")}
          </p>
        </div>
        <Link
          href={`${base}/manage/scholarships/new`}
          className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-radius-lg bg-primary px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-opacity hover:opacity-90"
        >
          {tManage("createNew")}
        </Link>
      </header>

      {isLoading && (
        <p className="font-sarabun text-body-md text-text-muted">
          {t("common.loading")}
        </p>
      )}

      {isError && (
        <p className="font-sarabun text-body-md text-status-error">
          {tManage("loadError")}
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-radius-lg border border-border-default/80 bg-surface-card px-6 py-12 text-center">
          <p className="font-sarabun text-body-md text-text-muted">
            {tManage("empty")}
          </p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="overflow-x-auto rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
          <table className="min-w-full divide-y divide-border-default/60">
            <thead className="bg-surface-container">
              <tr>
                {columnHeaders.map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {items.map((scholarship) => (
                <tr key={scholarship.id} className="hover:bg-surface-page/60">
                  <td className="px-4 py-4 font-sarabun text-body-sm font-medium text-text-primary">
                    {scholarship.title}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {tTypes(scholarship.scholarship_type)}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {tLevels(scholarship.target_level)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      status={scholarship.status}
                      publishedLabel={t("common.statusPublished")}
                      draftLabel={t("common.statusDraft")}
                    />
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {formatDate(scholarship.close_date, locale)}
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`${base}/manage/scholarships/${scholarship.id}/edit`}
                        className="rounded-radius-sm border border-border-input px-3 py-1.5 font-sarabun text-caption font-semibold text-primary hover:bg-primary-light"
                      >
                        {tManage("edit")}
                      </Link>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(scholarship)}
                        className="rounded-radius-sm border border-status-error/30 px-3 py-1.5 font-sarabun text-caption font-semibold text-status-error hover:bg-status-error-bg"
                      >
                        {tManage("delete")}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex justify-center gap-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage((value) => Math.max(1, value - 1))}
            className="rounded-radius-md border border-border-input px-4 py-2 font-sarabun text-label disabled:opacity-40"
          >
            ←
          </button>
          <span className="px-3 py-2 font-sarabun text-label text-text-muted">
            {page} / {totalPages}
          </span>
          <button
            type="button"
            disabled={page >= totalPages}
            onClick={() => setPage((value) => value + 1)}
            className="rounded-radius-md border border-border-input px-4 py-2 font-sarabun text-label disabled:opacity-40"
          >
            →
          </button>
        </div>
      )}

      <DeleteScholarshipDialog
        open={Boolean(deleteTarget)}
        title={deleteTarget?.title ?? ""}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        isDeleting={deleteMutation.isPending}
        confirmTitle={tManage("confirmTitle")}
        confirmMsg={tManage("confirmMsg")}
        cancelLabel={tManage("cancel")}
        confirmLabel={tManage("confirm")}
      />
    </div>
  );
}
