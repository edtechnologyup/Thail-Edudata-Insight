"use client";

import { useLocale } from "next-intl";
import { useState } from "react";
import type { CategoryTreeNode } from "@/utils/categoryTreeUtils";
import { flattenCategoryTree } from "@/utils/categoryTreeUtils";

type MoveCategoryModalProps = {
  node: CategoryTreeNode;
  allNodes: CategoryTreeNode[];
  onConfirm: (targetParentId: string | null) => void;
  onCancel: () => void;
  isLoading?: boolean;
};

export default function MoveCategoryModal({
  node,
  allNodes,
  onConfirm,
  onCancel,
  isLoading,
}: MoveCategoryModalProps) {
  const locale = useLocale();
  const [selected, setSelected] = useState<string | null>(node.parentId);
  const label = locale === "th" ? node.nameTh : node.nameEn;

  const flat = flattenCategoryTree(allNodes).filter(
    (n) => n.id !== node.id && n.level < 5
  );

  const isDescendant = (targetId: string): boolean => {
    const check = (children: CategoryTreeNode[]): boolean =>
      children.some((c) => c.id === targetId || check(c.children));
    return check(node.children);
  };

  const options = flat.filter((n) => !isDescendant(n.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-2xl bg-surface-card p-6 shadow-level-3">
        <h3 className="mb-1 font-kanit text-heading-3-mobile font-semibold text-text-primary">
          {locale === "th" ? "ย้ายหมวดหมู่" : "Move Category"}
        </h3>
        <p className="mb-4 font-sarabun text-label text-text-muted">
          {locale === "th"
            ? `ย้าย "${label}" ไปอยู่ภายใต้หมวดอื่น`
            : `Move "${label}" under another category`}
        </p>

        <div className="mb-4 max-h-60 space-y-1 overflow-y-auto rounded-xl border border-border-default p-2">
          <button
            type="button"
            onClick={() => setSelected(null)}
            className={`w-full rounded-lg px-3 py-2 text-left font-sarabun text-label transition-colors ${
              selected === null
                ? "bg-primary-light font-semibold text-primary-dark"
                : "text-text-primary hover:bg-surface-container"
            }`}
          >
            {locale === "th" ? "— ระดับบนสุด (ไม่มี parent) —" : "— Root level (no parent) —"}
          </button>
          {options.map((opt) => {
            const optLabel = locale === "th" ? opt.nameTh : opt.nameEn;
            const isCurrentParent = opt.id === node.parentId;
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
                {"└ ".repeat(opt.level - 1)}
                {optLabel}
                {isCurrentParent && (
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
            onClick={() => onConfirm(selected)}
            disabled={isLoading || selected === node.parentId}
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
