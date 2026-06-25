"use client";

import { useTranslations } from "next-intl";
import { DragEvent, useEffect, useRef, useState } from "react";
import type { BulkUploadResult } from "@/types/dataset";
import { useBulkUpload } from "@/hooks/useBulkUpload";

type BulkUploadZoneProps = {
  onComplete: (result: BulkUploadResult) => void;
  resetKey: number;
};

function isXlsxFile(file: File): boolean {
  return file.name.toLowerCase().endsWith(".xlsx");
}

export default function BulkUploadZone({
  onComplete,
  resetKey,
}: BulkUploadZoneProps) {
  const t = useTranslations("agency.bulk");
  const inputRef = useRef<HTMLInputElement>(null);
  const bulkUploadMutation = useBulkUpload();
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  const isProcessing = bulkUploadMutation.isPending;

  useEffect(() => {
    setError(null);
    setFileName(null);
    setProgress(0);
    if (inputRef.current) {
      inputRef.current.value = "";
    }
  }, [resetKey]);

  useEffect(() => {
    if (!isProcessing) {
      return;
    }

    setProgress(0);
    const interval = window.setInterval(() => {
      setProgress((current) => {
        if (current >= 95) {
          return current;
        }
        return current + 5;
      });
    }, 100);

    return () => window.clearInterval(interval);
  }, [isProcessing]);

  const processFile = async (file: File) => {
    if (!isXlsxFile(file)) {
      setError(t("fileInvalidType"));
      return;
    }

    setError(null);
    setFileName(file.name);

    try {
      const result = await bulkUploadMutation.mutateAsync(file);
      setProgress(100);
      onComplete(result);
    } catch {
      setError(t("uploadFailed"));
      setProgress(0);
    }
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (isProcessing) {
      return;
    }
    const file = event.dataTransfer.files[0];
    if (file) {
      void processFile(file);
    }
  };

  return (
    <section className="flex flex-col rounded-2xl border border-border-default/60 bg-surface-card p-6 shadow-level-1">
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-dark font-sarabun text-label font-bold text-white">
          2
        </span>
        <h2 className="font-kanit text-body-lg font-semibold text-text-primary">
          {t("step2Title")}
        </h2>
      </div>

      <div
        role="button"
        tabIndex={0}
        onDragOver={(event) => event.preventDefault()}
        onDrop={handleDrop}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            inputRef.current?.click();
          }
        }}
        onClick={() => {
          if (!isProcessing) {
            inputRef.current?.click();
          }
        }}
        className={`flex flex-1 flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-border-input bg-surface-page px-6 py-10 text-center transition-colors ${
          isProcessing
            ? "cursor-not-allowed opacity-60"
            : "cursor-pointer hover:border-primary-dark/40 hover:bg-surface-container"
        }`}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary-dark">
          <FileIcon />
        </div>
        <div>
          <p className="font-kanit text-body-md font-semibold text-text-primary">
            {t("dropzone")}
          </p>
          <button
            type="button"
            disabled={isProcessing}
            onClick={(event) => {
              event.stopPropagation();
              inputRef.current?.click();
            }}
            className="mt-2 rounded-full border border-primary-dark/30 px-6 py-2 font-sarabun text-label font-medium text-primary-dark transition-colors hover:bg-primary-light disabled:opacity-50"
          >
            {t("dropzoneClick")}
          </button>
        </div>
        <p className="font-sarabun text-caption text-text-muted">
          {t("dropzoneHint")}
        </p>
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx"
          className="hidden"
          disabled={isProcessing}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void processFile(file);
            }
          }}
        />
      </div>

      {fileName && (
        <p className="mt-3 font-sarabun text-label text-text-secondary">
          {fileName}
        </p>
      )}

      {isProcessing && (
        <div className="mt-4">
          <div className="mb-2 flex items-center justify-between">
            <span className="font-sarabun text-label text-text-muted">
              {t("processing", { percent: progress })}
            </span>
            <SpinnerIcon />
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-container">
            <div
              className="h-full rounded-full bg-primary-dark transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {error && (
        <p className="mt-3 font-sarabun text-caption text-status-error">
          {error}
        </p>
      )}
    </section>
  );
}

function FileIcon() {
  return (
    <svg
      className="h-7 w-7"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
    </svg>
  );
}

function SpinnerIcon() {
  return (
    <svg
      className="h-5 w-5 animate-spin text-primary-dark"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}
