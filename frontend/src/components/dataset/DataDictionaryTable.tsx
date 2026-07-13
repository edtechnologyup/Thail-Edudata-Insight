"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { useDataDictionary } from "@/hooks/useDataDictionary";

type FileInfo = { id: string; file_name: string; file_format: string };

type Props = {
  datasetId: string;
  files: FileInfo[];
};

const TYPE_COLORS: Record<string, { bg: string; text: string }> = {
  text: { bg: "#e3f2fd", text: "#1565c0" },
  number: { bg: "#e8f5e9", text: "#2e7d32" },
  date: { bg: "#fff3e0", text: "#e65100" },
  boolean: { bg: "#ede7f6", text: "#4527a0" },
  other: { bg: "#f5f5f5", text: "#616161" },
};

export default function DataDictionaryTable({ datasetId, files }: Props) {
  const tDetail = useTranslations("dataset.detail");
  const locale = useLocale();
  const isTh = locale === "th";

  const supportedFormats = new Set(["csv", "excel", "xlsx", "xls", "json"]);
  const supportedFiles = files.filter((f) => supportedFormats.has(f.file_format.toLowerCase()));

  const [activeFileId, setActiveFileId] = useState<string>(supportedFiles[0]?.id ?? "");

  const { data, isLoading } = useDataDictionary(datasetId, activeFileId);

  if (supportedFiles.length === 0) return null;

  const entries = data?.entries ?? [];
  if (!isLoading && entries.length === 0) return null;

  const activeFile = supportedFiles.find((f) => f.id === activeFileId);

  return (
    <div className="rounded-2xl border border-border-default/60 bg-white p-6 shadow-level-1">
      <h3 className="mb-4 flex items-center gap-2 font-kanit text-body-md font-bold text-primary">
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
        {tDetail("dataDictionary")}
        {activeFile && (
          <span className="rounded-md bg-[#e3f2fd] px-2 py-0.5 font-sarabun text-[11px] font-medium text-[#01579b]">
            {activeFile.file_name}
          </span>
        )}
      </h3>

      {isLoading ? (
        <div className="animate-pulse space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-8 rounded bg-surface-container" />
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-sarabun text-caption">
            <thead>
              <tr className="bg-primary/5">
                <th className="border border-border-default/60 px-3 py-2.5 text-left font-kanit text-label font-bold text-primary" style={{ width: 36 }}>
                  #
                </th>
                <th className="border border-border-default/60 px-3 py-2.5 text-left font-kanit text-label font-bold text-primary" style={{ minWidth: 140 }}>
                  {isTh ? "ชื่อ column" : "Column name"}
                </th>
                <th className="border border-border-default/60 px-3 py-2.5 text-left font-kanit text-label font-bold text-primary">
                  {isTh ? "คำอธิบาย" : "Description"}
                </th>
                <th className="border border-border-default/60 px-3 py-2.5 text-left font-kanit text-label font-bold text-primary" style={{ width: 90 }}>
                  {isTh ? "ประเภท" : "Type"}
                </th>
                <th className="border border-border-default/60 px-3 py-2.5 text-left font-kanit text-label font-bold text-primary" style={{ minWidth: 110 }}>
                  {isTh ? "ตัวอย่าง" : "Sample"}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => {
                const typeColors = TYPE_COLORS[entry.data_type ?? ""] ?? TYPE_COLORS.other;
                return (
                  <tr key={entry.column_name} className="transition-colors hover:bg-surface-container/50">
                    <td className="border border-border-default/60 px-3 py-2.5 text-text-muted">
                      {idx + 1}
                    </td>
                    <td className="border border-border-default/60 px-3 py-2.5 font-mono text-[12px] font-medium text-text-primary">
                      {entry.column_name}
                    </td>
                    <td className="border border-border-default/60 px-3 py-2.5 text-label text-text-secondary">
                      {entry.description ? (
                        entry.description
                      ) : (
                        <span className="italic text-text-muted">{tDetail("ddNotFilled")}</span>
                      )}
                    </td>
                    <td className="border border-border-default/60 px-3 py-2.5">
                      {entry.data_type && (
                        <span
                          className="rounded px-2 py-0.5 text-[11px] font-bold"
                          style={{ backgroundColor: typeColors.bg, color: typeColors.text }}
                        >
                          {entry.data_type}
                        </span>
                      )}
                    </td>
                    <td className="border border-border-default/60 px-3 py-2.5 text-[11px] italic text-text-muted">
                      {entry.sample_value ?? "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* File switcher for multi-file */}
      {supportedFiles.length > 1 && (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="font-sarabun text-caption text-text-muted">{tDetail("ddOtherFiles")}</span>
          {supportedFiles
            .filter((f) => f.id !== activeFileId)
            .map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setActiveFileId(file.id)}
                className="rounded-lg border border-border-default px-3 py-1.5 font-sarabun text-[11px] text-text-secondary transition-colors hover:border-primary/50 hover:bg-surface-container"
              >
                {file.file_name}
              </button>
            ))}
        </div>
      )}
    </div>
  );
}
