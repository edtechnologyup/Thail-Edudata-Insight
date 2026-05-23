"use client";

import { useTranslations } from "next-intl";
import { useSearchParamsUpdate } from "./useSearchParamsUpdate";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 3) {
    return [1, 2, 3, "ellipsis", total];
  }
  if (current >= total - 2) {
    return [1, "ellipsis", total - 2, total - 1, total];
  }
  return [1, "ellipsis", current, "ellipsis", total];
}

export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const t = useTranslations("common");
  const updateParams = useSearchParamsUpdate();

  if (totalPages <= 1) return null;

  const pages = getPageNumbers(currentPage, totalPages);

  function goToPage(page: number) {
    if (page < 1 || page > totalPages || page === currentPage) return;
    updateParams({ page: String(page) }, { resetPage: false });
  }

  return (
    <nav
      className="mt-12 flex justify-center items-center gap-2"
      aria-label={`${t("pagination.page")} ${currentPage} ${t("pagination.of")} ${totalPages}`}
    >
      <button
        type="button"
        onClick={() => goToPage(currentPage - 1)}
        disabled={currentPage <= 1}
        className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
        aria-label={t("pagination.previous")}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {pages.map((page, index) =>
        page === "ellipsis" ? (
          <span key={`ellipsis-${index}`} className="px-2 font-sarabun text-label text-text-muted">
            ...
          </span>
        ) : (
          <button
            key={page}
            type="button"
            onClick={() => goToPage(page)}
            className={`flex h-10 w-10 items-center justify-center rounded-radius-sm font-sarabun text-label font-bold transition-colors ${
              page === currentPage
                ? "bg-primary text-white shadow-level-1"
                : "border border-border-input text-text-primary hover:bg-surface-container"
            }`}
            aria-current={page === currentPage ? "page" : undefined}
          >
            {page}
          </button>
        )
      )}

      <button
        type="button"
        onClick={() => goToPage(currentPage + 1)}
        disabled={currentPage >= totalPages}
        className="flex h-10 w-10 items-center justify-center rounded-radius-md border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
        aria-label={t("pagination.next")}
      >
        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </nav>
  );
}
