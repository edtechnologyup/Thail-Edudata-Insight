"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import BulkUploadResult from "@/components/dataset/BulkUploadResult";
import BulkUploadZone from "@/components/dataset/BulkUploadZone";
import type { BulkUploadResult as BulkUploadResultData } from "@/types/dataset";
import { downloadBulkUploadTemplate } from "@/hooks/useBulkUpload";

export default function BulkUploadPage() {
  const t = useTranslations("agency.bulk");
  const locale = useLocale();
  const base = `/${locale}`;

  const [uploadResult, setUploadResult] = useState<BulkUploadResultData | null>(
    null
  );
  const [resetKey, setResetKey] = useState(0);
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const handleDownloadTemplate = async () => {
    setTemplateError(null);
    setIsDownloadingTemplate(true);
    try {
      const blob = await downloadBulkUploadTemplate();
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "bulk-upload-template.xlsx";
      anchor.click();
      URL.revokeObjectURL(url);
    } catch {
      setTemplateError(t("templateDownloadError"));
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleUploadAgain = () => {
    setUploadResult(null);
    setResetKey((current) => current + 1);
  };

  return (
    <div className="mx-auto max-w-[960px] space-y-8 pb-24">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 font-sarabun text-caption uppercase tracking-wider text-text-muted">
        <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
          {t("breadcrumbDashboard")}
        </Link>
        <span>›</span>
        <span className="font-semibold text-text-primary">
          {t("breadcrumbCurrent")}
        </span>
      </nav>

      <header>
        <h1 className="font-kanit text-[28px] font-bold text-text-primary">
          {t("title")}
        </h1>
        <p className="mt-1 font-sarabun text-body-md text-text-muted">
          {t("subtitle")}
        </p>
      </header>

      {/* Step 1 & 2 side by side */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Step 1 — Download template */}
        <section className="flex flex-col rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
          <div className="mb-4 flex items-center gap-3">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark font-sarabun text-label font-bold text-white">
              1
            </span>
            <h2 className="font-kanit text-body-lg font-semibold text-text-primary">
              {t("step1Title")}
            </h2>
          </div>
          <p className="mb-6 flex-1 font-sarabun text-body-md leading-relaxed text-text-muted">
            {t("step1Desc")}
          </p>
          <div>
            <button
              type="button"
              onClick={() => void handleDownloadTemplate()}
              disabled={isDownloadingTemplate}
              className="inline-flex items-center gap-2 rounded-xl border border-primary-dark/30 bg-surface-card px-5 py-2.5 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              <DownloadIcon />
              {isDownloadingTemplate
                ? t("templateDownloading")
                : t("downloadTemplate")}
            </button>
            {templateError && (
              <p
                className="mt-2 font-sarabun text-caption text-status-error"
                role="alert"
              >
                {templateError}
              </p>
            )}
          </div>
        </section>

        {/* Step 2 — Upload */}
        <BulkUploadZone
          resetKey={resetKey}
          onComplete={(result) => setUploadResult(result)}
        />
      </div>

      {uploadResult && (
        <BulkUploadResult
          result={uploadResult}
          onUploadAgain={handleUploadAgain}
        />
      )}
    </div>
  );
}

function DownloadIcon() {
  return (
    <svg
      className="h-5 w-5"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}
