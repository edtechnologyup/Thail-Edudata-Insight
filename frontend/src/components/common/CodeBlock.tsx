"use client";

import { useCallback, useState } from "react";
import { useTranslations } from "next-intl";

type CodeBlockProps = {
  code: string;
  label?: string;
  showHeader?: boolean;
};

export default function CodeBlock({
  code,
  label = "JSON",
  showHeader = true,
}: CodeBlockProps) {
  const t = useTranslations("apiDocs");
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  }, [code]);

  return (
    <div className="min-w-0 overflow-hidden rounded-xl border border-border-default/40 shadow-level-1">
      {showHeader && (
        <div className="flex items-center justify-between border-b border-border-default/60 px-5 py-2.5" style={{ backgroundColor: "#e9ebee" }}>
          <span className="font-sarabun text-label font-normal uppercase text-text-secondary">
            {t("response")}
          </span>
          <div className="flex items-center gap-3">
            <span className="font-sarabun text-label font-normal text-text-muted">
              {label}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1 rounded-lg border px-3 py-1 font-sarabun text-caption font-normal transition-colors"
              style={{
                color: copied ? "#0f6e56" : "#1a237e",
                borderColor: copied ? "#0f6e56" : "#c5cae9",
                backgroundColor: copied ? "#e1f5ee" : "#ffffff",
              }}
              aria-label={t("copy")}
            >
              <CopyIcon />
              <span>{copied ? t("copied") : t("copy")}</span>
            </button>
          </div>
        </div>
      )}
      <div className="relative px-5 py-5" style={{ backgroundColor: "#f3f4f6", minHeight: "120px" }}>
        <pre className="overflow-x-auto font-mono text-body-lg font-normal leading-loose" style={{ color: "#1f2328" }}>
          <code>{code}</code>
        </pre>
        {!showHeader && (
          <button
            type="button"
            onClick={handleCopy}
            className="absolute right-4 top-3 flex items-center gap-1 rounded-lg border px-3 py-1.5 font-sarabun text-caption font-normal transition-colors"
            style={{
              color: copied ? "#0f6e56" : "#1a237e",
              borderColor: copied ? "#0f6e56" : "#c5cae9",
              backgroundColor: copied ? "#e1f5ee" : "#ffffff",
            }}
            aria-label={t("copy")}
          >
            <CopyIcon />
            <span>{copied ? t("copied") : t("copy")}</span>
          </button>
        )}
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      aria-hidden
    >
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}
