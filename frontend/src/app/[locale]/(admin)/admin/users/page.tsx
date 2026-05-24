"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useMemo, useState } from "react";
import UserTable from "@/components/admin/UserTable";
import type { AdminUsersFilters } from "@/data/mockData";

type StatusFilter = "all" | "pending" | "active" | "rejected" | "suspended";
type RoleFilter = "all" | "agency" | "admin";

export default function AdminUsersPage() {
  const t = useTranslations("admin.users");
  const locale = useLocale();
  const base = `/${locale}`;

  const [searchInput, setSearchInput] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [appliedSearch, setAppliedSearch] = useState("");
  const [appliedStatus, setAppliedStatus] = useState<StatusFilter>("all");
  const [appliedRole, setAppliedRole] = useState<RoleFilter>("all");
  const [page, setPage] = useState(1);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  const queryFilters: AdminUsersFilters = useMemo(
    () => ({
      search: appliedSearch || undefined,
      status: appliedStatus,
      role: appliedRole,
      page,
    }),
    [appliedSearch, appliedStatus, appliedRole, page]
  );

  const handleApplyFilters = () => {
    setAppliedSearch(searchInput.trim());
    setAppliedStatus(statusFilter);
    setAppliedRole(roleFilter);
    setPage(1);
  };

  const showToast = (message: string) => {
    setToastMessage(message);
    setToastError(null);
    window.setTimeout(() => setToastMessage(null), 3000);
  };

  const showError = (message: string) => {
    setToastError(message);
    setToastMessage(null);
    window.setTimeout(() => setToastError(null), 3000);
  };

  return (
    <div className="mx-auto max-w-container-max space-y-spacing-8 pb-24">
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          {t("title")}
        </h1>
        <nav className="mt-1 flex font-sarabun text-label text-text-muted">
          <Link href={base} className="hover:text-primary-dark">
            {t("breadcrumbHome")}
          </Link>
          <span className="mx-2">/</span>
          <span className="font-medium text-primary-dark">{t("title")}</span>
        </nav>
      </header>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-6 shadow-level-1">
        <div className="flex flex-wrap items-end gap-spacing-6">
          <div className="min-w-[280px] flex-1">
            <label className="mb-2 block font-sarabun text-label font-medium text-text-muted">
              {t("search")}
            </label>
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon />
              </span>
              <input
                type="search"
                value={searchInput}
                onChange={(event) => setSearchInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    handleApplyFilters();
                  }
                }}
                placeholder={t("searchPlaceholder")}
                className="h-10 w-full rounded-radius-sm border border-border-input bg-surface-card pl-10 pr-4 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
              />
            </div>
          </div>

          <div className="w-full sm:w-48">
            <label className="mb-2 block font-sarabun text-label font-medium text-text-muted">
              {t("filterStatus")}
            </label>
            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <option value="all">{t("filterAll")}</option>
              <option value="pending">{t("status.pending")}</option>
              <option value="active">{t("status.active")}</option>
              <option value="rejected">{t("status.rejected")}</option>
              <option value="suspended">{t("status.suspended")}</option>
            </select>
          </div>

          <div className="w-full sm:w-48">
            <label className="mb-2 block font-sarabun text-label font-medium text-text-muted">
              {t("filterRole")}
            </label>
            <select
              value={roleFilter}
              onChange={(event) => setRoleFilter(event.target.value as RoleFilter)}
              className="h-10 w-full rounded-radius-sm border border-border-input bg-surface-card px-3 font-sarabun text-body-md focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              <option value="all">{t("filterAll")}</option>
              <option value="agency">{t("role.agency")}</option>
              <option value="admin">{t("role.admin")}</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleApplyFilters}
            className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-radius-sm bg-primary-dark px-6 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-colors hover:bg-primary-hover"
          >
            <FilterIcon />
            {t("applyFilter")}
          </button>
        </div>
      </section>

      <UserTable
        filters={queryFilters}
        onPageChange={setPage}
        onSuccess={showToast}
        onError={showError}
      />

      {toastMessage ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-radius-md bg-primary-dark px-4 py-3 font-sarabun text-label text-white shadow-level-3">
          {toastMessage}
        </div>
      ) : null}
      {toastError ? (
        <div className="fixed bottom-6 right-6 z-[110] rounded-radius-md bg-status-error px-4 py-3 font-sarabun text-label text-white shadow-level-3">
          {toastError}
        </div>
      ) : null}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
      />
    </svg>
  );
}

function FilterIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z" />
    </svg>
  );
}
