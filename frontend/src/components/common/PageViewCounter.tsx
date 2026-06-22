"use client";

import { useTranslations } from "next-intl";
import { usePageView } from "@/hooks/usePageView";

type PageViewCounterProps = {
  pageName: string;
};

export default function PageViewCounter({ pageName }: PageViewCounterProps) {
  const t = useTranslations("common");
  const { today, total } = usePageView(pageName);

  return (
    <div className="flex items-center gap-4">
      <div className="flex items-center gap-2 rounded-radius-md bg-primary/10 px-3 py-1.5">
        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
        <span className="font-kanit text-label font-bold text-primary">
          {today.toLocaleString()}
        </span>
        <span className="font-sarabun text-caption text-text-muted">
          {t("visitorsToday")}
        </span>
      </div>
      <div className="flex items-center gap-2 rounded-radius-md bg-surface-container px-3 py-1.5">
        <svg className="h-4 w-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="font-kanit text-label font-bold text-text-primary">
          {total.toLocaleString()}
        </span>
        <span className="font-sarabun text-caption text-text-muted">
          {t("visitorsTotal")}
        </span>
      </div>
    </div>
  );
}
