"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";

type CitationBoxProps = {
  apa: string;
  vancouver: string;
  isLoading?: boolean;
  errorMessage?: string | null;
};

function CopyButton({ text }: { text: string }) {
  const tStyles = useTranslations("dataset.citationStyles");
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/30 bg-white/10 text-white/70 transition-colors hover:bg-white/20 hover:text-white"
      aria-label={copied ? tStyles("copied") : tStyles("copy")}
    >
      {copied ? (
        <svg className="h-4 w-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      )}
    </button>
  );
}

export default function CitationBox({
  apa,
  vancouver,
  isLoading = false,
  errorMessage = null,
}: CitationBoxProps) {
  const t = useTranslations("dataset");
  const tStyles = useTranslations("dataset.citationStyles");

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border-default/60 bg-white p-6">
        <p className="font-sarabun text-body-md text-text-muted">{t("detail.previewLoading")}</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-2xl border border-border-default/60 bg-white p-6">
        <p className="font-sarabun text-body-md text-status-error" role="alert">{errorMessage}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {apa && (
        <div className="rounded-2xl p-5 shadow-level-1" style={{ backgroundColor: "#004d40" }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-kanit text-label font-bold" style={{ color: "#f9a825" }}>
              {tStyles("apa")}
            </h3>
            <CopyButton text={apa} />
          </div>
          <p className="font-sarabun text-body-sm leading-relaxed text-white">
            {apa}
          </p>
        </div>
      )}

      {vancouver && (
        <div className="rounded-2xl p-5 shadow-level-1" style={{ backgroundColor: "#004d40" }}>
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-kanit text-label font-bold" style={{ color: "#f9a825" }}>
              {tStyles("vancouver")}
            </h3>
            <CopyButton text={vancouver} />
          </div>
          <p className="font-sarabun text-body-sm leading-relaxed text-white">
            {vancouver}
          </p>
        </div>
      )}
    </div>
  );
}
