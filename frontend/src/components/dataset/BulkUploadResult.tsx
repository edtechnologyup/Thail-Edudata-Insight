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
    <section className="rounded-radius-lg border border-border-default bg-surface-card p-spacing-6 shadow-level-1">
      <div className="mb-spacing-6 grid grid-cols-1 gap-spacing-6 sm:grid-cols-2">
        <div className="rounded-radius-lg border border-primary bg-primary-light p-6 text-center">
          <p className="mb-1 flex items-center justify-center gap-1 font-kanit text-label font-semibold text-primary-dark">
            <CheckIcon />
            {t("resultSuccess")}
          </p>
          <p className="font-kanit text-[32px] font-bold text-primary-dark">
            {t("successCount", { count: result.success })}
          </p>
        </div>
        <div className="rounded-radius-lg border border-status-error bg-status-error-bg p-6 text-center">
          <p className="mb-1 flex items-center justify-center gap-1 font-kanit text-label font-semibold text-status-error">
            <ErrorIcon />
            {t("resultError")}
          </p>
          <p className="font-kanit text-[32px] font-bold text-status-error">
            {t("errorCount", { count: result.errors })}
          </p>
        </div>
      </div>

      {result.errorDetails.length > 0 && (
        <div className="mb-spacing-6">
          <h3 className="mb-3 font-kanit text-heading-3-mobile font-semibold text-text-primary">
            {t("errorTableTitle")}
          </h3>
          <div className="overflow-x-auto rounded-radius-md border border-border-default/30">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-surface-container font-kanit text-label font-semibold text-text-secondary">
                  <th className="px-4 py-3">{t("errorTable.row")}</th>
                  <th className="px-4 py-3">{t("errorTable.title")}</th>
                  <th className="px-4 py-3">{t("errorTable.column")}</th>
                  <th className="px-4 py-3">{t("errorTable.reason")}</th>
                </tr>
              </thead>
              <tbody className="font-sarabun text-label">
                {result.errorDetails.map((detail) => (
                  <tr
                    key={`${detail.row}-${detail.column}`}
                    className="border-b border-border-default/20 bg-status-error-bg/40"
                  >
                    <td className="px-4 py-4 text-center font-bold text-text-primary">
                      {detail.row}
                    </td>
                    <td className="px-4 py-4 text-text-primary">
                      {locale === "th" ? detail.titleTh : detail.titleEn}
                    </td>
                    <td className="px-4 py-4 font-semibold text-status-error">
                      {detail.column}
                    </td>
                    <td className="px-4 py-4 text-text-secondary">
                      {locale === "th" ? detail.reasonTh : detail.reasonEn}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="flex justify-center">
        <button
          type="button"
          onClick={onUploadAgain}
          className="inline-flex items-center gap-2 rounded-radius-full border-2 border-primary-dark px-8 py-2.5 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light"
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
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
    </svg>
  );
}

function ErrorIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M17.65 6.35A7.958 7.958 0 0 0 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08a5.99 5.99 0 0 1-5.65 4c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z" />
    </svg>
  );
}
