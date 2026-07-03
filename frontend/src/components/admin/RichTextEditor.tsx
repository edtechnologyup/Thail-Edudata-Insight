"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import DOMPurify from "dompurify";
import { marked } from "marked";

type RichTextEditorProps = {
  contentTh: string;
  contentEn: string;
  onChangeTh: (value: string) => void;
  onChangeEn: (value: string) => void;
  disabled?: boolean;
};

type EditorTab = "th" | "en";

const TOOLBAR_ITEMS = [
  { label: "B", style: "font-bold", insert: "**", wrap: true },
  { label: "I", style: "italic", insert: "*", wrap: true },
  { label: "🔗", style: "", insert: "[text](url)", wrap: false },
  { label: "H1", style: "font-bold", insert: "# ", wrap: false },
  { label: "H2", style: "font-bold", insert: "## ", wrap: false },
  { label: "⋮≡", style: "", insert: "- ", wrap: false },
  { label: "1.", style: "", insert: "1. ", wrap: false },
  { label: "</>", style: "font-mono", insert: "`", wrap: true },
  { label: "🖼", style: "", insert: "![alt](url)", wrap: false },
];

export default function RichTextEditor({
  contentTh,
  contentEn,
  onChangeTh,
  onChangeEn,
  disabled = false,
}: RichTextEditorProps) {
  const t = useTranslations("admin.pages");
  const [activeTab, setActiveTab] = useState<EditorTab>("th");
  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const value = activeTab === "th" ? contentTh : contentEn;
  const onChange = activeTab === "th" ? onChangeTh : onChangeEn;

  const previewHtml = useMemo(() => {
    if (!showPreview) return "";
    const html = marked.parse(value, { async: false }) as string;
    return DOMPurify.sanitize(html);
  }, [showPreview, value]);

  const handleToolbarClick = useCallback(
    (insert: string, wrap: boolean) => {
      const el = textareaRef.current;
      if (!el) return;
      const start = el.selectionStart;
      const end = el.selectionEnd;
      const selected = value.substring(start, end);

      let newText: string;
      let cursorPos: number;

      if (wrap && selected.length > 0) {
        newText =
          value.substring(0, start) +
          insert +
          selected +
          insert +
          value.substring(end);
        cursorPos = end + insert.length * 2;
      } else {
        newText = value.substring(0, start) + insert + value.substring(end);
        cursorPos = start + insert.length;
      }

      onChange(newText);
      requestAnimationFrame(() => {
        el.focus();
        el.setSelectionRange(cursorPos, cursorPos);
      });
    },
    [value, onChange]
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/80 bg-white shadow-md">
      {/* Tabs */}
      <div className="flex items-center border-b border-gray-100 px-8 pt-5">
        <button
          type="button"
          onClick={() => setActiveTab("th")}
          className={`relative px-6 pb-4 font-sarabun text-lg font-semibold transition-colors ${
            activeTab === "th"
              ? "text-primary-dark after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-full after:bg-primary-dark"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          TH (ภาษาไทย)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("en")}
          className={`relative px-6 pb-4 font-sarabun text-lg font-semibold transition-colors ${
            activeTab === "en"
              ? "text-primary-dark after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-full after:bg-primary-dark"
              : "text-text-muted hover:text-text-primary"
          }`}
        >
          EN (English)
        </button>
      </div>

      {/* Toolbar */}
      <div className="border-b border-gray-100 px-8 py-3">
        <div className="flex items-center gap-2">
          {TOOLBAR_ITEMS.map((item, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleToolbarClick(item.insert, item.wrap)}
              disabled={disabled}
              className={`flex h-10 w-10 items-center justify-center rounded-lg text-base text-text-secondary transition-colors hover:bg-gray-100 hover:text-text-primary disabled:opacity-40 ${item.style}`}
              title={item.label}
            >
              {item.label}
            </button>
          ))}

          <div className="mx-2 h-6 w-px bg-gray-200" />

          <button
            type="button"
            onClick={() => setShowPreview((prev) => !prev)}
            className={`flex h-10 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors ${
              showPreview
                ? "bg-primary-dark/10 text-primary-dark"
                : "text-text-secondary hover:bg-gray-100 hover:text-text-primary"
            }`}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {showPreview ? "ซ่อนตัวอย่าง" : "แสดงตัวอย่าง"}
          </button>
        </div>
      </div>

      {/* Content area */}
      <div className="p-8">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          disabled={disabled}
          rows={showPreview ? 14 : 24}
          placeholder={t("contentPlaceholder")}
          className={`${showPreview ? "min-h-[280px]" : "min-h-[500px]"} w-full resize-y border-0 bg-transparent px-0 py-0 font-sarabun text-lg leading-relaxed text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-0 disabled:cursor-not-allowed disabled:opacity-60`}
        />
      </div>

      {/* Preview */}
      {showPreview && (
        <div className="border-t border-gray-200 bg-gray-50/50">
          <div className="flex items-center gap-2 border-b border-gray-100 px-8 py-2.5">
            <svg className="h-4 w-4 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="font-sarabun text-sm font-medium text-text-muted">
              ตัวอย่างการแสดงผล
            </span>
          </div>
          <div className="max-h-[400px] overflow-y-auto p-8">
            <div
              className="static-page-content"
              dangerouslySetInnerHTML={{ __html: previewHtml }}
            />
            {!value.trim() && (
              <p className="text-center text-sm text-text-muted">
                พิมพ์เนื้อหาด้านบนเพื่อดูตัวอย่าง
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
