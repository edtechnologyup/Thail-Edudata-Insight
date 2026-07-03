"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";
import { flattenCategoryTree } from "@/utils/categoryTreeUtils";

type MoveDatasetCategoryModalProps = {
  datasetTitle: string;
  currentCategoryId: string | null;
  allNodes: CategoryTreeNode[];
  onConfirm: (targetCategoryId: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function MoveDatasetCategoryModal({
  datasetTitle,
  currentCategoryId,
  allNodes,
  onConfirm,
  onCancel,
  isLoading,
}: MoveDatasetCategoryModalProps) {
  const locale = useLocale();
  const [selected, setSelected] = useState<string | null>(currentCategoryId);

  const leaves = flattenCategoryTree(allNodes).filter(
    (n) => n.children.length === 0
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-card p-6 shadow-level-3">
        <h3 className="mb-1 font-kanit text-heading-3-mobile font-semibold text-text-primary">
          {locale === "th" ? "ย้ายหมวดหมู่ Dataset" : "Move Dataset Category"}
        </h3>
        <p className="mb-4 font-sarabun text-label text-text-muted">
          {locale === "th"
            ? `เลือกหมวดหมู่ใหม่สำหรับ "${datasetTitle}"`
            : `Choose a new category for "${datasetTitle}"`}
        </p>

        <div className="mb-4 max-h-60 space-y-1 overflow-y-auto rounded-xl border border-border-default p-2">
          {leaves.length === 0 && (
            <p className="px-3 py-4 text-center font-sarabun text-label text-text-muted">
              {locale === "th" ? "ไม่มีหมวดหมู่" : "No categories available"}
            </p>
          )}
          {leaves.map((opt) => {
            const optLabel = locale === "th" ? opt.nameTh : opt.nameEn;
            const isCurrent = opt.id === currentCategoryId;
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => setSelected(opt.id)}
                className={`w-full rounded-lg px-3 py-2 text-left font-sarabun text-label transition-colors ${
                  selected === opt.id
                    ? "bg-primary-light font-semibold text-primary-dark"
                    : "text-text-primary hover:bg-surface-container"
                }`}
                style={{ paddingLeft: `${(opt.level - 1) * 16 + 12}px` }}
              >
                {optLabel}
                {isCurrent && (
                  <span className="ml-2 text-caption text-text-muted">
                    ({locale === "th" ? "ปัจจุบัน" : "current"})
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl border border-border-input px-6 py-2 font-sarabun text-label text-text-muted hover:bg-surface-container disabled:opacity-50"
          >
            {locale === "th" ? "ยกเลิก" : "Cancel"}
          </button>
          <button
            type="button"
            onClick={() => selected && onConfirm(selected)}
            disabled={isLoading || !selected || selected === currentCategoryId}
            className="rounded-xl bg-primary-dark px-6 py-2 font-sarabun text-label font-medium text-white hover:opacity-90 disabled:opacity-50"
          >
            {isLoading
              ? locale === "th" ? "กำลังย้าย..." : "Moving..."
              : locale === "th" ? "ย้ายหมวดหมู่" : "Move"}
          </button>
        </div>
      </div>
    </div>
  );
}
