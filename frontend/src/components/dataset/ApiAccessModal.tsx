"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import type { DatasetPreviewData } from "@/types/dataset";

type ApiAccessModalProps = {
  open: boolean;
  onClose: () => void;
  datasetId: string;
  previewData: DatasetPreviewData | null;
};

function CopyButton({ text }: { text: string }) {
  const t = useTranslations("dataset.apiAccess");
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="shrink-0 rounded-xl px-4 py-2 font-sarabun text-caption font-bold transition-all hover:opacity-80"
      style={
        copied
          ? { backgroundColor: "#e8f5e9", color: "#2e7d32", border: "1.5px solid #2e7d32" }
          : { backgroundColor: "#f9a825", color: "#33691e", border: "1.5px solid #f9a825" }
      }
    >
      {copied ? (
        <span className="inline-flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
          {t("copied")}
        </span>
      ) : (
        <span className="inline-flex items-center gap-1">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          {t("copy")}
        </span>
      )}
    </button>
  );
}

function CodeBlock({ code }: { code: string }) {
  return (
    <div className="flex items-start gap-3">
      <pre
        className="flex-1 overflow-x-auto rounded-2xl p-4 font-mono text-caption leading-relaxed text-white"
        style={{ backgroundColor: "#1a3a2a" }}
      >
        {code}
      </pre>
      <CopyButton text={code} />
    </div>
  );
}

function buildExampleResponse(preview: DatasetPreviewData): string {
  const sample = {
    status: "success",
    data: {
      columns: preview.columns.slice(0, 4),
      total_rows: preview.total_rows,
      masked_columns: preview.masked_columns.slice(0, 2),
      rows: preview.rows.slice(0, 3),
    },
  };
  return JSON.stringify(sample, null, 2);
}

export default function ApiAccessModal({
  open,
  onClose,
  datasetId,
  previewData,
}: ApiAccessModalProps) {
  const t = useTranslations("dataset.apiAccess");
  const tCommon = useTranslations("common");
  const [mounted, setMounted] = useState(false);

  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "/api/v1";

  const previewUrl = `${baseUrl}/public/datasets/${datasetId}/preview`;
  const downloadUrl = `${baseUrl}/public/datasets/${datasetId}/download`;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !mounted || typeof document === "undefined") return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open, mounted]);

  if (!open || !mounted) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="api-access-modal-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-surface-navy/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label={tCommon("close")}
      />
      <div className="relative max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-3xl border border-border-default/60 bg-white p-8 shadow-level-3">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl"
              style={{ backgroundColor: "#e0f2f1" }}
            >
              <svg className="h-5 w-5" style={{ color: "#00695c" }} fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3
              id="api-access-modal-title"
              className="font-kanit text-heading-3 font-bold"
              style={{ color: "#1a3a2a" }}
            >
              {t("title")}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-default/60 text-text-muted transition-colors hover:bg-surface-container"
            aria-label={tCommon("close")}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <p className="mb-2 font-sarabun text-body-md text-text-secondary">
          {t("intro")}
        </p>
        <p
          className="mb-6 inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 font-sarabun text-caption font-semibold"
          style={{ backgroundColor: "#fff3e0", color: "#e65100" }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          {t("rateLimit")}
        </p>

        {/* ── Preview ── */}
        <section className="mb-8 rounded-2xl border border-border-default/60 bg-gray-50/50 p-6">
          <h4 className="mb-4 font-kanit text-body-md font-bold" style={{ color: "#00695c" }}>
            {t("previewHeading")}
          </h4>

          <p className="mb-2 font-sarabun text-caption font-bold" style={{ color: "#1a3a2a" }}>
            Endpoint
          </p>
          <div className="mb-4 flex items-center gap-3">
            <code
              className="flex-1 overflow-x-auto rounded-xl border border-border-default/60 bg-white px-4 py-3 font-mono text-caption"
              style={{ color: "#00695c" }}
            >
              <span className="mr-2 rounded-md px-2 py-0.5 font-bold text-white" style={{ backgroundColor: "#00897b" }}>GET</span>
              {previewUrl}
            </code>
            <CopyButton text={previewUrl} />
          </div>

          <p className="mb-2 font-sarabun text-caption font-bold" style={{ color: "#1a3a2a" }}>
            curl
          </p>
          <CodeBlock code={`curl "${previewUrl}"`} />

          {previewData && (
            <>
              <p className="mb-2 mt-5 font-sarabun text-caption font-bold" style={{ color: "#1a3a2a" }}>
                {t("exampleResponse")}
              </p>
              <CodeBlock code={buildExampleResponse(previewData)} />
            </>
          )}
        </section>

        {/* ── Download ── */}
        <section className="rounded-2xl border border-border-default/60 bg-gray-50/50 p-6">
          <h4 className="mb-4 font-kanit text-body-md font-bold" style={{ color: "#00695c" }}>
            {t("downloadHeading")}
          </h4>

          <p className="mb-2 font-sarabun text-caption font-bold" style={{ color: "#1a3a2a" }}>
            Endpoint
          </p>
          <div className="mb-4 flex items-center gap-3">
            <code
              className="flex-1 overflow-x-auto rounded-xl border border-border-default/60 bg-white px-4 py-3 font-mono text-caption"
              style={{ color: "#00695c" }}
            >
              <span className="mr-2 rounded-md px-2 py-0.5 font-bold text-white" style={{ backgroundColor: "#00897b" }}>GET</span>
              {downloadUrl}?purpose=...&format=csv
            </code>
            <CopyButton text={`${downloadUrl}?purpose=YOUR_PURPOSE&format=csv`} />
          </div>

          <p className="mb-2 font-sarabun text-caption font-bold" style={{ color: "#1a3a2a" }}>
            {t("queryParams")}
          </p>
          <div className="mb-5 overflow-hidden rounded-xl border border-border-default/60">
            <table className="w-full text-left font-sarabun text-caption">
              <thead>
                <tr style={{ backgroundColor: "#1a3a2a" }}>
                  <th className="px-4 py-3 font-semibold text-white">{t("paramName")}</th>
                  <th className="px-4 py-3 font-semibold text-white">{t("paramType")}</th>
                  <th className="px-4 py-3 font-semibold text-white">{t("paramDesc")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                <tr className="bg-white">
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: "#00695c" }}>purpose</td>
                  <td className="px-4 py-3 text-text-secondary">string</td>
                  <td className="px-4 py-3 text-text-secondary">{t("purposeDesc")}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold" style={{ color: "#00695c" }}>format</td>
                  <td className="px-4 py-3 text-text-secondary">string</td>
                  <td className="px-4 py-3 text-text-secondary">csv | excel | json | xml</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-2 font-sarabun text-caption font-bold" style={{ color: "#1a3a2a" }}>
            curl
          </p>
          <CodeBlock
            code={`curl -o data.csv \\\n  "${downloadUrl}?purpose=research%20and%20analysis&format=csv"`}
          />

          <p
            className="mt-5 rounded-xl px-4 py-2.5 font-sarabun text-caption"
            style={{ backgroundColor: "#e8f5e9", color: "#2e7d32" }}
          >
            {t("downloadNote")}
          </p>
        </section>
      </div>
    </div>
  );
}
