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
    <div className="overflow-hidden rounded-radius-lg shadow-level-1">
      {showHeader && (
        <div className="flex items-center justify-between bg-surface-navy px-4 py-2">
          <span className="font-sarabun text-caption uppercase text-text-muted">
            {t("response")}
          </span>
          <span className="font-sarabun text-caption text-text-muted">
            {label}
          </span>
        </div>
      )}
      <div className="relative bg-text-primary p-4">
        <pre className="overflow-x-auto font-mono text-code text-surface-card">
          <code>{code}</code>
        </pre>
        <button
          type="button"
          onClick={handleCopy}
          className="absolute right-4 top-4 flex items-center gap-1 font-sarabun text-caption text-text-muted transition-colors hover:text-surface-card"
          aria-label={t("copy")}
        >
          <CopyIcon />
          <span>{copied ? t("copied") : t("copy")}</span>
        </button>
      </div>
    </div>
  );
}

function CopyIcon() {
  return (
    <svg
      width="18"
      height="18"
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
