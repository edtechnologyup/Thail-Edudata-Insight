"use client";

import { useLocale, useTranslations } from "next-intl";
import type { BulkUploadResult as BulkUploadResultData } from "@/data/mockData";

type BulkUploadResultProps = {
  result: BulkUploadResultData;
  onUploadAgain: () => void;
};

export default function BulkUploadResult({
  result,
  onUploadAgain,
}: BulkUploadResultProps) {
  const t = useTranslations("agency.bulk");
  const locale = useLocale();

  return (
    <section className="space-y-6">
      {/* Header with badges */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-kanit text-heading-3-mobile font-bold text-text-primary">
          {t("errorTableTitle")}
        </h2>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-4 py-1.5 font-sarabun text-label font-semibold text-primary-dark">
            <CheckIcon />
            {t("resultSuccess")}: {result.success} {t("successUnit")}
          </span>
          {result.errors > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-status-error-bg px-4 py-1.5 font-sarabun text-label font-semibold text-status-error">
              <ErrorIcon />
              {t("resultError")}: {result.errors} {t("errorUnit")}
            </span>
          )}
        </div>
      </div>

      {/* Error table */}
      {result.errorDetails.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="border-b border-border-default/30 font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted">
                  <th className="px-6 py-4">{t("errorTable.row")}</th>
                  <th className="px-6 py-4">{t("errorTable.column")}</th>
                  <th className="px-6 py-4">{t("errorTable.reason")}</th>
                  <th className="px-6 py-4 text-center">การดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/20">
                {result.errorDetails.map((detail) => (
                  <tr
                    key={`${detail.row}-${detail.column}`}
                    className="transition-colors hover:bg-surface-page"
                  >
                    <td className="px-6 py-4 font-sarabun text-label font-bold text-text-primary">
                      #{detail.row}
                    </td>
                    <td className="px-6 py-4 font-sarabun text-label font-semibold text-primary-dark">
                      {detail.column}
                    </td>
                    <td className="px-6 py-4 font-sarabun text-label text-text-secondary">
                      {locale === "th" ? detail.reasonTh : detail.reasonEn}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        type="button"
                        className="rounded-lg px-3 py-1 font-sarabun text-caption font-semibold text-primary-dark transition-colors hover:bg-primary-light"
                      >
                        แก้ไขข้อมูล
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={onUploadAgain}
          className="inline-flex items-center gap-2 rounded-xl border border-primary-dark/30 px-8 py-2.5 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light"
        >
          <RefreshIcon />
          {t("uploadAgain")}
        </button>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg
      className="h-4 w-4"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08a5.99 5.99 0 0 1-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}
