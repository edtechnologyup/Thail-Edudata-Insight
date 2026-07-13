"use client";

import { useTranslations } from "next-intl";
import { useCallback, useEffect, useState } from "react";
import {
  useAutoDetectDictionary,
  useDataDictionary,
  useSaveDataDictionary,
  type DataDictionaryEntry,
} from "@/hooks/useDataDictionary";

type FileInfo = { id: string; file_name: string; file_format: string };

type Props = {
  datasetId: string;
  files: FileInfo[];
  theme?: "agency";
};

const DATA_TYPES = ["text", "number", "date", "boolean", "other"] as const;

const SUPPORTED_FORMATS = new Set(["csv", "excel", "xlsx", "xls", "json"]);

export default function DataDictionaryEditor({ datasetId, files, theme }: Props) {
  const t = useTranslations("agency.upload");
  const isGreen = theme === "agency";
  const cPrimary = isGreen ? "#01579b" : "#053F5C";
  const cAccent = isGreen ? "#0277bd" : "#0081A7";

  const inputClass =
    "w-full rounded-lg border border-gray-200 bg-white px-3 py-1.5 font-sarabun text-caption text-text-primary outline-none transition-all focus:border-[#0277bd] focus:ring-1 focus:ring-[#0277bd]/20";
  const selectClass =
    "rounded-lg border border-gray-200 bg-white px-2 py-1.5 font-sarabun text-caption text-text-primary outline-none focus:border-[#0277bd] focus:ring-1 focus:ring-[#0277bd]/20";

  const supportedFiles = files.filter((f) => SUPPORTED_FORMATS.has(f.file_format.toLowerCase()));
  const [activeFileId, setActiveFileId] = useState<string>(supportedFiles[0]?.id ?? "");
  const [entries, setEntries] = useState<DataDictionaryEntry[]>([]);
  const [saveMsg, setSaveMsg] = useState<string | null>(null);

  const dictQuery = useDataDictionary(datasetId, activeFileId);
  const saveMutation = useSaveDataDictionary(datasetId, activeFileId);
  const autoDetectMutation = useAutoDetectDictionary(datasetId, activeFileId);

  useEffect(() => {
    if (dictQuery.data?.entries) {
      setEntries(dictQuery.data.entries);
    }
  }, [dictQuery.data]);

  useEffect(() => {
    setSaveMsg(null);
  }, [activeFileId]);

  const updateEntry = useCallback(
    (idx: number, field: keyof DataDictionaryEntry, value: string | null) => {
      setEntries((prev) =>
        prev.map((e, i) => (i === idx ? { ...e, [field]: value } : e))
      );
    },
    []
  );

  const handleAutoDetect = async () => {
    try {
      const result = await autoDetectMutation.mutateAsync();
      setEntries(result.entries);
    } catch {
      // error surfaced via mutation state
    }
  };

  const handleSave = async () => {
    try {
      await saveMutation.mutateAsync(entries);
      setSaveMsg(t("ddSaveSuccess"));
      setTimeout(() => setSaveMsg(null), 3000);
    } catch {
      // error surfaced via mutation state
    }
  };

  if (supportedFiles.length === 0) {
    return null;
  }

  const activeFile = supportedFiles.find((f) => f.id === activeFileId);

  return (
    <section
      className={`rounded-2xl border ${isGreen ? "border-[#0277bd]/8" : "border-[#0081A7]/8"} bg-white/95 p-8 shadow-xl shadow-black/5 backdrop-blur-sm`}
    >
      <div className="mb-6 flex items-center gap-3">
        <span
          className={`flex h-8 w-8 items-center justify-center rounded-full font-sarabun text-label font-bold text-white ${isGreen ? "bg-[#01579b]" : "bg-[#053F5C]"}`}
        >
          4
        </span>
        <h2
          className={`font-kanit text-heading-3-mobile font-semibold ${isGreen ? "text-[#01579b]" : "text-[#053F5C]"}`}
        >
          {t("ddSection")}
        </h2>
        <span className="font-sarabun text-caption text-text-muted">
          ({t("ddOptional")})
        </span>
      </div>

      {/* File tabs */}
      {supportedFiles.length > 1 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {supportedFiles.map((file) => (
            <button
              key={file.id}
              type="button"
              onClick={() => setActiveFileId(file.id)}
              className={`flex items-center gap-2 rounded-lg border px-3 py-2 font-sarabun text-caption transition-all ${
                activeFileId === file.id
                  ? `border-[${cPrimary}] bg-[#e3f2fd] font-medium text-[${cPrimary}]`
                  : "border-gray-200 text-text-secondary hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M14 2H6c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" />
              </svg>
              {file.file_name}
            </button>
          ))}
        </div>
      )}

      {/* Auto-detect button */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={handleAutoDetect}
          disabled={autoDetectMutation.isPending}
          className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 font-sarabun text-label font-medium transition-colors disabled:opacity-50 ${
            isGreen
              ? "border-[#0277bd]/30 text-[#01579b] hover:bg-[#0277bd]/5"
              : "border-[#0081A7]/30 text-[#053F5C] hover:bg-[#0081A7]/5"
          }`}
        >
          {autoDetectMutation.isPending ? (
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          )}
          {autoDetectMutation.isPending ? t("ddAutoDetecting") : t("ddAutoDetect")}
        </button>
        <span className="font-sarabun text-caption text-text-muted">
          {t("ddAutoDetectHint")}
        </span>
      </div>

      {/* Dictionary table */}
      {entries.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse font-sarabun text-caption">
            <thead>
              <tr className={isGreen ? "bg-[#01579b]/5" : "bg-[#053F5C]/5"}>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-text-secondary" style={{ width: 36 }}>
                  {t("ddColOrder")}
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-text-secondary" style={{ minWidth: 130 }}>
                  {t("ddColName")}
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-text-secondary" style={{ minWidth: 110 }}>
                  {t("ddColSample")}
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-text-secondary" style={{ minWidth: 160 }}>
                  {t("ddColDescription")}
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left font-medium text-text-secondary" style={{ width: 110 }}>
                  {t("ddColType")}
                </th>
              </tr>
            </thead>
            <tbody>
              {entries.map((entry, idx) => (
                <tr key={entry.column_name} className="transition-colors hover:bg-gray-50/50">
                  <td className="border border-gray-200 px-3 py-2 text-text-muted">
                    {idx + 1}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 font-mono text-[12px] font-medium text-text-primary">
                    {entry.column_name}
                  </td>
                  <td className="border border-gray-200 px-3 py-2 text-[11px] italic text-text-muted">
                    {entry.sample_value ?? "—"}
                  </td>
                  <td className="border border-gray-200 px-1 py-1">
                    <input
                      type="text"
                      className={inputClass}
                      value={entry.description ?? ""}
                      placeholder={t("ddDescPlaceholder")}
                      onChange={(e) => updateEntry(idx, "description", e.target.value || null)}
                    />
                  </td>
                  <td className="border border-gray-200 px-1 py-1">
                    <select
                      className={selectClass}
                      value={entry.data_type ?? ""}
                      onChange={(e) => updateEntry(idx, "data_type", e.target.value || null)}
                    >
                      <option value="">{t("ddTypePlaceholder")}</option>
                      {DATA_TYPES.map((dt) => (
                        <option key={dt} value={dt}>
                          {t(`ddType${dt.charAt(0).toUpperCase()}${dt.slice(1)}` as any)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="py-6 text-center font-sarabun text-label text-text-muted">
          {t("ddNoColumns")}
        </p>
      )}

      {/* Save button */}
      {entries.length > 0 && (
        <div className="mt-4 flex items-center justify-end gap-3">
          {saveMsg && (
            <span className="font-sarabun text-caption font-medium text-green-600">
              {saveMsg}
            </span>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className={`inline-flex items-center gap-2 rounded-full px-6 py-2.5 font-sarabun text-label font-bold text-white shadow-lg transition-all hover:brightness-110 active:scale-95 disabled:opacity-50 ${
              isGreen
                ? "bg-gradient-to-r from-[#01579b] to-[#0277bd]"
                : "bg-gradient-to-r from-[#053F5C] to-[#0081A7]"
            }`}
          >
            {saveMutation.isPending ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
              </svg>
            )}
            {saveMutation.isPending ? t("ddSaving") : t("ddSave")}
          </button>
        </div>
      )}
    </section>
  );
}
