"use client";

import { useTranslations } from "next-intl";

export type AuditLogFilterValues = {
  dateFrom: string;
  dateTo: string;
  action: string;
  search: string;
};

type AuditLogFilterProps = {
  values: AuditLogFilterValues;
  onChange: (values: AuditLogFilterValues) => void;
  onSearch: () => void;
};

function SearchIcon() {
  return (
    <svg
      className="h-[18px] w-[18px]"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

export default function AuditLogFilter({
  values,
  onChange,
  onSearch,
}: AuditLogFilterProps) {
  const t = useTranslations("admin.auditLogs");

  const update = (patch: Partial<AuditLogFilterValues>) => {
    onChange({ ...values, ...patch });
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    onSearch();
  };

  return (
    <section className="rounded-radius-lg border border-border-default bg-surface-card p-6 shadow-level-1">
      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-end gap-6 md:grid-cols-12"
      >
        <div className="grid grid-cols-2 gap-3 md:col-span-4">
          <div className="space-y-1">
            <label
              htmlFor="audit-date-from"
              className="block font-sarabun text-caption font-bold text-text-muted"
            >
              {t("filterDateFrom")}
            </label>
            <input
              id="audit-date-from"
              type="date"
              value={values.dateFrom}
              onChange={(event) => update({ dateFrom: event.target.value })}
              className="min-h-[42px] w-full rounded-radius-sm border border-border-input px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
          <div className="space-y-1">
            <label
              htmlFor="audit-date-to"
              className="block font-sarabun text-caption font-bold text-text-muted"
            >
              {t("filterDateTo")}
            </label>
            <input
              id="audit-date-to"
              type="date"
              value={values.dateTo}
              onChange={(event) => update({ dateTo: event.target.value })}
              className="min-h-[42px] w-full rounded-radius-sm border border-border-input px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="space-y-1 md:col-span-3">
          <label
            htmlFor="audit-action"
            className="block font-sarabun text-caption font-bold text-text-muted"
          >
            {t("filterAction")}
          </label>
          <select
            id="audit-action"
            value={values.action}
            onChange={(event) => update({ action: event.target.value })}
            className="min-h-[42px] w-full rounded-radius-sm border border-border-input px-3 font-sarabun text-body-md text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            <option value="all">{t("filterActionAll")}</option>
            <option value="LOGIN">{t("actions.login")}</option>
            <option value="UPLOAD">{t("actions.upload")}</option>
            <option value="DOWNLOAD">{t("actions.download")}</option>
            <option value="DELETE">{t("actions.delete")}</option>
            <option value="APPROVE">{t("actions.approve")}</option>
            <option value="REJECT">{t("actions.reject")}</option>
          </select>
        </div>

        <div className="space-y-1 md:col-span-3">
          <label
            htmlFor="audit-search"
            className="block font-sarabun text-caption font-bold text-text-muted"
          >
            {t("filterSearch")}
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
              <SearchIcon />
            </span>
            <input
              id="audit-search"
              type="search"
              value={values.search}
              onChange={(event) => update({ search: event.target.value })}
              placeholder={t("filterSearchPlaceholder")}
              className="min-h-[42px] w-full rounded-radius-sm border border-border-input py-2 pl-10 pr-3 font-sarabun text-body-md text-text-primary placeholder:text-text-muted focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        <div className="md:col-span-2">
          <button
            type="submit"
            className="min-h-[42px] w-full rounded-radius-sm bg-primary px-4 font-sarabun text-label font-bold text-white transition-colors hover:bg-primary-hover active:scale-95"
          >
            {t("search")}
          </button>
        </div>
      </form>
    </section>
  );
}
