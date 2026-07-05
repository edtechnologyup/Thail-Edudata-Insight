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
      className="shrink-0 rounded-radius-full px-4 py-2 font-sarabun text-caption font-normal transition-all hover:opacity-80"
      style={
        copied
          ? { backgroundColor: "#e1f5ee", color: "#0f6e56", border: "1.5px solid #0f6e56" }
          : { backgroundColor: "#ffffff", color: "#1a237e", border: "1.5px solid #c5cae9" }
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
        className="flex-1 overflow-x-auto rounded-2xl border border-border-default/60 p-4 font-mono text-caption font-normal leading-relaxed"
        style={{ backgroundColor: "#f3f4f6", color: "#1f2328" }}
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

function AccordionSection({
  title,
  expanded,
  onToggle,
  children,
}: {
  title: string;
  expanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-4 overflow-hidden rounded-2xl border border-border-default/60 last:mb-0">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 bg-primary-light/50 px-6 py-4 text-left transition-colors hover:bg-primary-light"
        aria-expanded={expanded}
      >
        <h4 className="font-kanit text-body-md font-bold text-primary-dark">
          {title}
        </h4>
        <svg
          className={`h-5 w-5 shrink-0 text-primary-dark transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {expanded && <div className="bg-gray-50/50 p-6">{children}</div>}
    </section>
  );
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
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    preview: true,
    download: false,
  });

  const toggleSection = (key: string) =>
    setExpanded((prev) => ({ ...prev, [key]: !prev[key] }));

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-light">
              <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <h3
              id="api-access-modal-title"
              className="font-kanit text-heading-3 font-bold text-primary"
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
        <AccordionSection
          title={t("previewHeading")}
          expanded={expanded.preview}
          onToggle={() => toggleSection("preview")}
        >
          <p className="mb-2 font-sarabun text-caption font-bold text-text-primary">
            Endpoint
          </p>
          <div className="mb-4 flex items-center gap-3">
            <code
              className="flex-1 overflow-x-auto rounded-xl border border-border-default/60 bg-white px-4 py-3 font-mono text-caption font-normal"
              style={{ color: "#1f2328" }}
            >
              <span className="mr-2 rounded-md px-2 py-0.5 font-bold text-white" style={{ backgroundColor: "#2e7d32" }}>GET</span>
              {previewUrl}
            </code>
            <CopyButton text={previewUrl} />
          </div>

          <p className="mb-2 font-sarabun text-caption font-bold text-text-primary">
            curl
          </p>
          <CodeBlock code={`curl "${previewUrl}"`} />

          {previewData && (
            <>
              <p className="mb-2 mt-5 font-sarabun text-caption font-bold text-text-primary">
                {t("exampleResponse")}
              </p>
              <CodeBlock code={buildExampleResponse(previewData)} />
            </>
          )}
        </AccordionSection>

        {/* ── Download ── */}
        <AccordionSection
          title={t("downloadHeading")}
          expanded={expanded.download}
          onToggle={() => toggleSection("download")}
        >
          <p className="mb-2 font-sarabun text-caption font-bold text-text-primary">
            Endpoint
          </p>
          <div className="mb-4 flex items-center gap-3">
            <code
              className="flex-1 overflow-x-auto rounded-xl border border-border-default/60 bg-white px-4 py-3 font-mono text-caption font-normal"
              style={{ color: "#1f2328" }}
            >
              <span className="mr-2 rounded-md px-2 py-0.5 font-bold text-white" style={{ backgroundColor: "#2e7d32" }}>GET</span>
              {downloadUrl}?purpose=...&format=csv
            </code>
            <CopyButton text={`${downloadUrl}?purpose=YOUR_PURPOSE&format=csv`} />
          </div>

          <p className="mb-2 font-sarabun text-caption font-bold text-text-primary">
            {t("queryParams")}
          </p>
          <div className="mb-5 overflow-hidden rounded-xl border border-border-default/60">
            <table className="w-full text-left font-sarabun text-caption">
              <thead>
                <tr style={{ backgroundColor: "#1a237e" }}>
                  <th className="px-4 py-3 font-normal text-white">{t("paramName")}</th>
                  <th className="px-4 py-3 font-normal text-white">{t("paramType")}</th>
                  <th className="px-4 py-3 font-normal text-white">{t("paramDesc")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-default/40">
                <tr className="bg-white">
                  <td className="px-4 py-3 font-mono font-semibold text-primary-dark">purpose</td>
                  <td className="px-4 py-3 text-text-secondary">string</td>
                  <td className="px-4 py-3 text-text-secondary">{t("purposeDesc")}</td>
                </tr>
                <tr className="bg-gray-50">
                  <td className="px-4 py-3 font-mono font-semibold text-primary-dark">format</td>
                  <td className="px-4 py-3 text-text-secondary">string</td>
                  <td className="px-4 py-3 text-text-secondary">csv | excel | json | xml</td>
                </tr>
              </tbody>
            </table>
          </div>

          <p className="mb-2 font-sarabun text-caption font-bold text-text-primary">
            curl
          </p>
          <CodeBlock
            code={`curl -o data.csv \\\n  "${downloadUrl}?purpose=research%20and%20analysis&format=csv"`}
          />

          <p
            className="mt-5 rounded-xl px-4 py-2.5 font-sarabun text-caption"
            style={{ backgroundColor: "#e1f5ee", color: "#0f6e56" }}
          >
            {t("downloadNote")}
          </p>
        </AccordionSection>
      </div>
    </div>
  );
}
