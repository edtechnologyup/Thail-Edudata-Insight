"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import type { DatasetDetailMock } from "@/types/dataset";

type PreviewTableProps = {
  columns: DatasetDetailMock["columns"];
  rows: DatasetDetailMock["previewData"];
};

function LockIcon() {
  return (
    <svg
      className="h-4 w-4 text-white/70"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
      />
    </svg>
  );
}

const TABLE_PAGE_SIZE = 20;

export default function PreviewTable({ columns, rows }: PreviewTableProps) {
  const t = useTranslations("dataset.detail");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [fullscreen, setFullscreen] = useState(false);

  const previewRows = rows.slice(0, 20);
  const totalRows = previewRows.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / TABLE_PAGE_SIZE));
  const pagedRows = previewRows.slice((page - 1) * TABLE_PAGE_SIZE, page * TABLE_PAGE_SIZE);

  const tableContent = (
    <>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <h2 className="font-kanit text-label font-bold text-primary">
            {t("preview")}
          </h2>
        </div>
        <button
          type="button"
          onClick={() => setFullscreen(!fullscreen)}
          className="flex items-center gap-1.5 font-sarabun text-caption font-medium text-primary-dark transition-colors hover:underline"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
          </svg>
          {fullscreen
            ? (locale === "th" ? "ปิดเต็มจอ" : "Exit fullscreen")
            : (locale === "th" ? "แสดงเต็มจอ" : "Fullscreen")}
        </button>
      </div>

      <div className="overflow-auto rounded-2xl border border-border-default/60 shadow-level-1">
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead>
            <tr style={{ backgroundColor: "#eef0f3" }}>
              {columns.map((col) => {
                const label = locale === "th" ? col.labelTh : col.labelEn;
                return (
                  <th
                    key={col.key}
                    className="whitespace-nowrap px-5 py-3.5 font-sarabun text-label font-normal text-text-primary"
                  >
                    <span className="inline-flex items-center gap-1">
                      {label}
                      {col.masked && <LockIcon />}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody className="font-sarabun text-label text-text-secondary">
            {pagedRows.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`border-b border-border-default/30 transition-colors hover:bg-primary-light/40 ${
                  rowIndex % 2 === 0 ? "bg-white" : "bg-gray-50"
                }`}
              >
                {columns.map((col) => {
                  const value = row[col.key];
                  return (
                    <td key={col.key} className="px-5 py-3">
                      {col.masked ? (
                        <span className="inline-block select-none blur-sm opacity-60" aria-hidden>
                          {String(value)}
                        </span>
                      ) : (
                        String(value ?? "")
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex flex-col items-center justify-between gap-3 sm:flex-row">
        <p className="font-sarabun text-caption text-text-muted">
          {locale === "th"
            ? `แสดงผลเฉพาะตัวอย่าง ${pagedRows.length} จากทั้งหมด ${rows.length.toLocaleString("th-TH")} รายการ`
            : `Showing ${pagedRows.length} of ${rows.length.toLocaleString("en-US")} records`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-white font-sarabun text-caption text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
            >
              &lt;
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`flex h-8 w-8 items-center justify-center rounded-lg font-sarabun text-caption font-bold transition-colors ${
                  p === page
                    ? "text-white"
                    : "border border-border-default bg-white text-text-primary hover:bg-surface-container"
                }`}
                style={p === page ? { backgroundColor: "#1a237e" } : undefined}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page >= totalPages}
              className="flex h-8 w-8 items-center justify-center rounded-lg border border-border-default bg-white font-sarabun text-caption text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
            >
              &gt;
            </button>
          </div>
        )}
      </div>
    </>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 overflow-auto bg-white p-6">
        <div className="mx-auto max-w-[1400px]">{tableContent}</div>
      </div>
    );
  }

  return <div>{tableContent}</div>;
}
