"use client";

import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import { useSearchFilters } from "@/hooks/useSearchFilters";
import type { SearchFilterCategory } from "@/hooks/useSearchFilters";
import { buildCategoryTree, type CategoryTreeNode } from "@/utils/categoryTreeUtils";
import { useSearchParamsUpdate } from "./useSearchParamsUpdate";

type FilterTreeProps = {
  selectedCategory: string | null;
};

type FilterCategoryNode = CategoryTreeNode & {
  name_th: string;
  name_en: string;
};

function mapFilterTree(
  categories: SearchFilterCategory[]
): FilterCategoryNode[] {
  const nodes = buildCategoryTree(
    categories.map((category) => ({
      id: category.id,
      name_th: category.name_th,
      name_en: category.name_en,
      slug: category.slug,
      level: category.level,
      parent_id: category.parent_id,
      created_by: "",
      created_at: "",
    }))
  );

  const byId = new Map(categories.map((category) => [category.id, category]));

  const attachLabels = (node: CategoryTreeNode): FilterCategoryNode => {
    const source = byId.get(node.id);
    return {
      ...node,
      name_th: source?.name_th ?? node.nameTh,
      name_en: source?.name_en ?? node.nameEn,
      children: node.children.map(attachLabels),
    };
  };

  return nodes.map(attachLabels);
}

function FilterTreeNodeRow({
  node,
  depth,
  expanded,
  selectedCategory,
  locale,
  onToggle,
  onSelect,
}: {
  node: FilterCategoryNode;
  depth: number;
  expanded: Record<string, boolean>;
  selectedCategory: string | null;
  locale: string;
  onToggle: (id: string) => void;
  onSelect: (id: string) => void;
}) {
  const label = locale === "th" ? node.name_th : node.name_en;
  const hasChildren = node.children.length > 0;
  const isExpanded = expanded[node.id] ?? false;
  const isActive = selectedCategory === node.id;

  return (
    <div>
      <div
        className={`flex w-full items-center gap-2 rounded-radius-md px-2 py-1.5 font-sarabun text-label transition-colors hover:bg-surface-container ${
          isActive
            ? "border-l-[3px] border-primary-dark bg-primary-light text-primary-dark"
            : ""
        }`}
        style={{ paddingLeft: `${8 + depth * 12}px` }}
      >
        {hasChildren ? (
          <button
            type="button"
            onClick={() => onToggle(node.id)}
            className="inline-flex h-5 w-5 shrink-0 items-center justify-center text-text-muted"
            aria-expanded={isExpanded}
            aria-label={label}
          >
            {isExpanded ? (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            )}
          </button>
        ) : (
          <span className="inline-block h-5 w-5 shrink-0" aria-hidden />
        )}
        <button
          type="button"
          onClick={() => onSelect(node.id)}
          className="flex-1 text-left font-medium"
        >
          {label}
        </button>
      </div>
      {hasChildren && isExpanded && (
        <div className="flex flex-col gap-1">
          {node.children.map((child) => (
            <FilterTreeNodeRow
              key={child.id}
              node={child as FilterCategoryNode}
              depth={depth + 1}
              expanded={expanded}
              selectedCategory={selectedCategory}
              locale={locale}
              onToggle={onToggle}
              onSelect={onSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
}

export default function FilterTree({ selectedCategory }: FilterTreeProps) {
  const t = useTranslations("search");
  const locale = useLocale();
  const updateParams = useSearchParamsUpdate();
  const { data: filterOptions } = useSearchFilters();
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  const tree = useMemo(
    () => mapFilterTree(filterOptions?.categories ?? []),
    [filterOptions?.categories]
  );

  const selectedRoot = useMemo(() => {
    if (!selectedCategory) return null;
    const containsSelected = (node: FilterCategoryNode): boolean =>
      node.id === selectedCategory ||
      node.children.some((child) => containsSelected(child as FilterCategoryNode));
    return tree.find(containsSelected) ?? null;
  }, [tree, selectedCategory]);

  if (tree.length === 0) {
    return null;
  }

  function toggleExpand(id: string) {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function selectCategory(id: string) {
    if (selectedCategory === id) {
      updateParams({ category: null, page: null });
    } else {
      updateParams({ category: id, page: null });
    }
  }

  function clearCategory() {
    updateParams({ category: null, page: null });
  }

  if (selectedRoot) {
    const rootLabel = locale === "th" ? selectedRoot.name_th : selectedRoot.name_en;
    const isRootActive = selectedCategory === selectedRoot.id;

    return (
      <div className="flex flex-col gap-2">
        <div className="mb-1 flex items-center justify-between font-sarabun text-label font-bold text-primary-dark">
          <span>{t("categories")}</span>
        </div>

        <div className="flex items-center justify-between gap-2 rounded-radius-md border border-primary/30 bg-primary-light px-3 py-2">
          <span className="truncate font-sarabun text-label font-bold text-primary-dark">
            {rootLabel}
          </span>
          <button
            type="button"
            onClick={clearCategory}
            className="shrink-0 text-primary-dark transition-colors hover:text-status-error"
            aria-label={t("clearFilter")}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto">
          <button
            type="button"
            onClick={() => selectCategory(selectedRoot.id)}
            className={`w-full rounded-radius-md px-2 py-1.5 text-left font-sarabun text-label font-medium transition-colors hover:bg-surface-container ${
              isRootActive
                ? "border-l-[3px] border-primary-dark bg-primary-light text-primary-dark"
                : "text-text-secondary"
            }`}
          >
            {locale === "th" ? "ทั้งหมดในหมวดนี้" : "All in this category"}
          </button>
          {selectedRoot.children.map((child) => (
            <FilterTreeNodeRow
              key={child.id}
              node={child as FilterCategoryNode}
              depth={0}
              expanded={expanded}
              selectedCategory={selectedCategory}
              locale={locale}
              onToggle={toggleExpand}
              onSelect={selectCategory}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between font-sarabun text-label font-bold text-primary-dark">
        <span>{t("categories")}</span>
      </div>
      <div className="flex max-h-[300px] flex-col gap-1 overflow-y-auto">
        {tree.map((node) => (
          <button
            key={node.id}
            type="button"
            onClick={() => selectCategory(node.id)}
            className="flex w-full items-center justify-between gap-2 rounded-radius-md px-2 py-1.5 text-left font-sarabun text-label font-medium text-text-secondary transition-colors hover:bg-surface-container hover:text-primary-dark"
          >
            <span className="truncate">
              {locale === "th" ? node.name_th : node.name_en}
            </span>
            <svg className="h-4 w-4 shrink-0 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        ))}
      </div>
    </div>
  );
}
