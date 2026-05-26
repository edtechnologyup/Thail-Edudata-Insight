"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type CitationStyle = "apa" | "vancouver";

type CitationBoxProps = {
  apa: string;
  vancouver: string;
  isLoading?: boolean;
  errorMessage?: string | null;
};

export default function CitationBox({
  apa,
  vancouver,
  isLoading = false,
  errorMessage = null,
}: CitationBoxProps) {
  const t = useTranslations("dataset");
  const tStyles = useTranslations("dataset.citationStyles");
  const [style, setStyle] = useState<CitationStyle>("apa");
  const [copied, setCopied] = useState(false);

  const citationText = style === "apa" ? apa : vancouver;

  async function handleCopy() {
    if (!citationText) return;
    try {
      await navigator.clipboard.writeText(citationText);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  const tabClass = (active: boolean) =>
    `pb-2 font-sarabun text-label transition-colors ${
      active
        ? "border-b-2 border-primary font-semibold text-primary"
        : "font-medium text-text-muted hover:text-text-primary"
    }`;

  return (
    <div className="rounded-radius-lg border border-border-default/80 bg-surface-container p-spacing-6">
      <div className="mb-4 flex items-center gap-6 border-b border-border-default/60">
        <button
          type="button"
          className={tabClass(style === "apa")}
          onClick={() => setStyle("apa")}
        >
          {tStyles("apa")}
        </button>
        <button
          type="button"
          className={tabClass(style === "vancouver")}
          onClick={() => setStyle("vancouver")}
        >
          {tStyles("vancouver")}
        </button>
      </div>

      {isLoading && (
        <p className="font-sarabun text-body-md text-text-muted">
          {t("detail.previewLoading")}
        </p>
      )}

      {errorMessage && !isLoading && (
        <p className="font-sarabun text-body-md text-status-error" role="alert">
          {errorMessage}
        </p>
      )}

      {!isLoading && !errorMessage && citationText && (
        <div className="flex flex-col items-stretch gap-4 md:flex-row md:items-center">
          <code className="flex-1 rounded-radius-md border border-border-default/60 bg-surface-card p-4 font-mono text-code text-text-secondary">
            {citationText}
          </code>
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-radius-md bg-surface-container px-4 py-2 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-border-default/40"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
              />
            </svg>
            {copied ? tStyles("copied") : tStyles("copy")}
          </button>
        </div>
      )}
    </div>
  );
}
