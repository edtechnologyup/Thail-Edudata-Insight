"use client";

import { useTranslations } from "next-intl";
import type { AuditLog, AuditLogAction, AuditLogsFilters } from "@/data/mockData";
import { useAuditLogs } from "@/hooks/useAuditLogs";

type AuditLogTableProps = {
  filters: AuditLogsFilters;
  onPageChange: (page: number) => void;
};

function getPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total];
  }
  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }
  return [1, "ellipsis", current, "ellipsis", total];
}

function ActionBadge({
  action,
  label,
}: {
  action: AuditLogAction;
  label: string;
}) {
  const styles: Record<AuditLogAction, string> = {
    UPLOAD: "bg-status-published-bg text-status-published",
    DOWNLOAD: "bg-status-published-bg text-status-published",
    APPROVE: "bg-status-published-bg text-status-published",
    LOGIN: "bg-status-draft-bg text-status-draft",
    DELETE: "bg-status-error-bg text-status-error",
    REJECT: "bg-status-error-bg text-status-error",
  };

  return (
    <span
      className={`inline-flex rounded-radius-full px-3 py-1 font-sarabun text-[11px] font-bold ${styles[action]}`}
    >
      {label}
    </span>
  );
}

function TableSkeleton() {
  return (
    <div className="animate-pulse space-y-3 p-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="h-12 rounded-radius-sm bg-surface-container"
        />
      ))}
    </div>
  );
}

function ChevronLeftIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRightIcon() {
  return (
    <svg className="h-[18px] w-[18px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  );
}

export default function AuditLogTable({
  filters,
  onPageChange,
}: AuditLogTableProps) {
  const t = useTranslations("admin.auditLogs");
  const { data, isLoading } = useAuditLogs(filters);

  const rows: AuditLog[] = data?.data ?? [];
  const total = data?.total ?? 0;
  const currentPage = data?.page ?? 1;
  const totalPages = data?.totalPages ?? 1;
  const pageSize = data?.pageSize ?? 6;

  const startItem = total === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, total);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  const actionLabel = (action: AuditLogAction) => {
    const key = action.toLowerCase() as
      | "login"
      | "upload"
      | "download"
      | "delete"
      | "approve"
      | "reject";
    return t(`actions.${key}`);
  };

  return (
    <section className="overflow-hidden rounded-radius-lg border border-border-default bg-surface-card shadow-level-1">
      <div className="overflow-x-auto">
        {isLoading ? (
          <TableSkeleton />
        ) : (
          <table className="w-full border-collapse text-left">
            <thead className="bg-surface-container">
              <tr>
                <th className="px-6 py-4 font-kanit text-[13px] font-semibold text-text-secondary">
                  {t("colTimestamp")}
                </th>
                <th className="px-6 py-4 font-kanit text-[13px] font-semibold text-text-secondary">
                  {t("colUser")}
                </th>
                <th className="px-6 py-4 font-kanit text-[13px] font-semibold text-text-secondary">
                  {t("colAction")}
                </th>
                <th className="px-6 py-4 font-kanit text-[13px] font-semibold text-text-secondary">
                  {t("colDetail")}
                </th>
                <th className="px-6 py-4 font-kanit text-[13px] font-semibold text-text-secondary">
                  {t("colIP")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default">
              {rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                  >
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                rows.map((log) => (
                  <tr
                    key={log.id}
                    className="h-14 cursor-pointer transition-colors hover:bg-surface-container-low"
                  >
                    <td className="px-6 py-2 font-mono text-code text-text-secondary">
                      {log.timestamp}
                    </td>
                    <td className="px-6 py-2 font-sarabun text-body-md text-text-primary">
                      {log.email}
                    </td>
                    <td className="px-6 py-2">
                      <ActionBadge
                        action={log.action}
                        label={actionLabel(log.action)}
                      />
                    </td>
                    <td
                      className="max-w-[300px] truncate px-6 py-2 font-sarabun text-[13px] text-text-muted"
                      title={log.detail}
                    >
                      {log.detail}
                    </td>
                    <td className="px-6 py-2 font-mono text-code text-text-muted">
                      {log.ip}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      <div className="flex flex-col items-center justify-between gap-4 border-t border-border-default bg-surface-container-low px-6 py-4 sm:flex-row">
        <p className="font-sarabun text-label text-text-secondary">
          {t("paginationSummary", {
            start: startItem,
            end: endItem,
            total,
          })}
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage <= 1}
            className="rounded-radius-sm border border-border-default p-2 transition-colors hover:bg-surface-card disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("prevPage")}
          >
            <ChevronLeftIcon />
          </button>
          {pageNumbers.map((page, index) =>
            page === "ellipsis" ? (
              <span
                key={`ellipsis-${index}`}
                className="px-1 font-sarabun text-body-sm text-text-muted"
              >
                ...
              </span>
            ) : (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`flex h-8 w-8 items-center justify-center rounded-radius-sm font-sarabun text-body-sm font-medium transition-colors ${
                  page === currentPage
                    ? "bg-primary text-white"
                    : "hover:bg-surface-card"
                }`}
                aria-current={page === currentPage ? "page" : undefined}
              >
                {page}
              </button>
            )
          )}
          <button
            type="button"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
            className="rounded-radius-sm border border-border-default p-2 transition-colors hover:bg-surface-card disabled:cursor-not-allowed disabled:opacity-50"
            aria-label={t("nextPage")}
          >
            <ChevronRightIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
