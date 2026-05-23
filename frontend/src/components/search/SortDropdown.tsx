"use client";

import { useTranslations } from "next-intl";
import { useSearchParamsUpdate } from "./useSearchParamsUpdate";

export type SortOption = "newest" | "popular" | "name";

type SortDropdownProps = {
  value: SortOption;
};

export default function SortDropdown({ value }: SortDropdownProps) {
  const t = useTranslations("search");
  const updateParams = useSearchParamsUpdate();

  return (
    <div className="flex items-center gap-3">
      <span className="hidden font-sarabun text-label text-text-muted sm:inline">
        {t("sortBy")}:
      </span>
      <select
        value={value}
        onChange={(e) =>
          updateParams({ sort: e.target.value as SortOption }, { resetPage: true })
        }
        className="rounded-radius-md border border-border-input bg-surface-card px-3 py-1.5 font-sarabun text-label text-text-primary outline-none focus:border-border-focus focus:ring-1 focus:ring-primary-dark/30"
        aria-label={t("sortBy")}
      >
        <option value="newest">{t("sortNewest")}</option>
        <option value="popular">{t("sortPopular")}</option>
        <option value="name">{t("sortName")}</option>
      </select>
    </div>
  );
}
