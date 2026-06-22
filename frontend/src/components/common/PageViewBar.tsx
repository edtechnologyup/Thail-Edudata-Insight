"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { usePageView } from "@/hooks/usePageView";

const PAGE_MAP: Record<string, string> = {
  "": "home",
  search: "search",
  categories: "categories",
  stats: "stats",
  "api-docs": "api-docs",
  scholarship: "scholarship",
  "help-center": "help-center",
};

function resolvePageName(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  const rest = parts.slice(1);

  if (rest.length === 0) return "home";
  if (rest[0] === "datasets" && rest.length >= 2) return "dataset-detail";

  const key = rest[0];
  return PAGE_MAP[key] || "";
}

export default function PageViewBar() {
  const t = useTranslations("common");
  const pathname = usePathname();
  const pageName = resolvePageName(pathname);
  const { today, total } = usePageView(pageName);

  if (!pageName) return null;

  return (
    <div className="border-t border-border-default/60 bg-surface-card px-4 py-4 md:px-spacing-10">
      <div className="mx-auto flex max-w-container-max items-center justify-center gap-6">
        <div className="flex items-center gap-3 rounded-radius-lg bg-primary/10 px-5 py-3">
          <svg className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span className="font-kanit text-heading-3-mobile font-bold text-primary">
            {today.toLocaleString()}
          </span>
          <span className="font-sarabun text-label font-medium text-text-secondary">
            {t("visitorsToday")}
          </span>
        </div>
        <div className="flex items-center gap-3 rounded-radius-lg bg-surface-container px-5 py-3">
          <svg className="h-6 w-6 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="font-kanit text-heading-3-mobile font-bold text-text-primary">
            {total.toLocaleString()}
          </span>
          <span className="font-sarabun text-label font-medium text-text-secondary">
            {t("visitorsTotal")}
          </span>
        </div>
      </div>
    </div>
  );
}
