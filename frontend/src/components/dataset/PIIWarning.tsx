"use client";

import { useTranslations } from "next-intl";

type PIIWarningProps = {
  columns: string[];
};

export default function PIIWarning({ columns }: PIIWarningProps) {
  const t = useTranslations("agency.upload");

  return (
    <div className="rounded-radius-md border border-status-error bg-status-error-bg p-4">
      <div className="mb-2 flex items-center gap-2 font-sarabun text-label font-bold text-status-error">
        <WarningIcon />
        <span>{t("piiFound", { count: columns.length })}</span>
      </div>
      <ul className="space-y-1">
        {columns.map((column) => (
          <li
            key={column}
            className="flex items-center gap-2 font-sarabun text-label text-status-error"
          >
            <LockIcon />
            {column}
          </li>
        ))}
      </ul>
      <p className="mt-2 font-sarabun text-caption text-status-error">
        {t("piiMasked")}
      </p>
    </div>
  );
}

function WarningIcon() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2V9h2v5z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M18 8h-1V6a5 5 0 0 0-10 0v2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V10a2 2 0 0 0-2-2zm-6 9a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm3.1-9H8.9V6a3.1 3.1 0 0 1 6.2 0v2z" />
    </svg>
  );
}
