"use client";

import { Suspense } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Pagination from "@/components/search/Pagination";
import { useSearchParamsUpdate } from "@/components/search/useSearchParamsUpdate";
import { SCHOLARSHIP_TYPE_VALUES } from "@/components/scholarship/ScholarshipFilter";
import {
  useAdminScholarships,
  useHideScholarship,
} from "@/hooks/useAdminScholarships";
import type { Scholarship, ScholarshipSource } from "@/hooks/useScholarships";
import apiClient from "@/services/api";
import { toast } from "@/stores/toastStore";

function parseAdminScholarshipParams(searchParams: URLSearchParams) {
  const page = Math.max(1, Number(searchParams.get("page") ?? "1") || 1);
  const status = searchParams.get("status") ?? "";
  const scholarship_type = searchParams.get("scholarship_type") ?? "";
  const agency_id = searchParams.get("agency_id") ?? "";

  return { page, status, scholarship_type, agency_id };
}

function formatDate(value: string, locale: string): string {
  return new Date(value).toLocaleDateString(
    locale === "th" ? "th-TH" : "en-US",
    { year: "numeric", month: "short", day: "numeric" }
  );
}

function StatusBadge({
  status,
  publishedLabel,
  draftLabel,
}: {
  status: Scholarship["status"];
  publishedLabel: string;
  draftLabel: string;
}) {
  if (status === "published") {
    return (
      <span className="inline-flex rounded-radius-full bg-status-published-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-published">
        {publishedLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex rounded-radius-full bg-status-draft-bg px-3 py-1 font-sarabun text-caption font-semibold text-status-draft">
      {draftLabel}
    </span>
  );
}

function SourceBadge({
  source,
  label,
}: {
  source: ScholarshipSource;
  label: string;
}) {
  const className =
    source === "agency"
      ? "bg-primary-light text-primary-dark"
      : source === "data_go_th"
        ? "bg-status-published-bg text-status-published"
        : "bg-[#FFF7ED] text-[#C2410C]";

  return (
    <span
      className={`inline-flex rounded-radius-full px-3 py-1 font-sarabun text-caption font-semibold ${className}`}
    >
      {label}
    </span>
  );
}

function AdminScholarshipsContent() {
  const locale = useLocale();
  const t = useTranslations("scholarship");
  const tAdmin = useTranslations("scholarship.admin");
  const tTypes = useTranslations("scholarship.types");
  const tLevels = useTranslations("scholarship.levels");
  const tSources = useTranslations("scholarship.sources");
  const searchParams = useSearchParams();
  const updateParams = useSearchParamsUpdate();
  const { page, status, scholarship_type, agency_id } =
    parseAdminScholarshipParams(searchParams);

  const { data, isLoading, isError } = useAdminScholarships({
    page,
    page_size: 20,
    status: status || undefined,
    scholarship_type: scholarship_type || undefined,
    agency_id: agency_id || undefined,
  });
  const hideMutation = useHideScholarship();

  const { data: agencyUsers = [] } = useQuery({
    queryKey: ["admin", "users", "agency-filter"],
    queryFn: async () => {
      const response = await apiClient.get<{
        data: Array<{
          id: string;
          agency_name: string | null;
          email: string;
        }>;
      }>("/admin/users", {
        params: { page: 1, page_size: 100, role: "agency" },
      });
      return response.data.data ?? [];
    },
    staleTime: 60_000,
    retry: 1,
  });

  const statusOptions = [
    { value: "", label: t("common.all") },
    { value: "published", label: t("common.statusPublished") },
    { value: "draft", label: t("common.statusDraft") },
  ];

  const typeOptions = [
    { value: "", label: t("common.all") },
    ...SCHOLARSHIP_TYPE_VALUES.map((value) => ({
      value,
      label: tTypes(value),
    })),
  ];

  const agencyOptions = [
    { value: "", label: t("common.all") },
    ...agencyUsers.map((user) => ({
      value: user.id,
      label: user.agency_name?.trim() || user.email,
    })),
  ];

  const items = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const currentPage = pagination?.page ?? page;

  const handleHide = async (scholarship: Scholarship) => {
    try {
      await hideMutation.mutateAsync(scholarship.id);
      toast.success(tAdmin("hideSuccess"));
    } catch {
      toast.error(tAdmin("hideError"));
    }
  };

  const columnHeaders = [
    tAdmin("colTitle"),
    tAdmin("colAgency"),
    tAdmin("colType"),
    tAdmin("colLevel"),
    tAdmin("colStatus"),
    tAdmin("colSource"),
    tAdmin("colCloseDate"),
    tAdmin("colActions"),
  ];

  return (
    <div className="mx-auto max-w-container-max space-y-spacing-8 pb-24">
      <header>
        <h1 className="font-kanit text-[28px] font-bold leading-tight text-text-primary">
          {tAdmin("title")}
        </h1>
        <p className="mt-1 font-sarabun text-label text-text-muted">
          {tAdmin("subtitle")}
        </p>
      </header>

      <section className="rounded-radius-lg border border-border-default bg-surface-card p-4 shadow-level-1 md:p-6">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label
              htmlFor="admin-scholarship-status"
              className="mb-2 block font-sarabun text-label font-medium text-text-primary"
            >
              {tAdmin("filterStatus")}
            </label>
            <select
              id="admin-scholarship-status"
              value={status}
              onChange={(event) =>
                updateParams({ status: event.target.value || null })
              }
              className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-page px-3 font-sarabun text-body-sm text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              {statusOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-scholarship-type"
              className="mb-2 block font-sarabun text-label font-medium text-text-primary"
            >
              {tAdmin("filterType")}
            </label>
            <select
              id="admin-scholarship-type"
              value={scholarship_type}
              onChange={(event) =>
                updateParams({ scholarship_type: event.target.value || null })
              }
              className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-page px-3 font-sarabun text-body-sm text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              {typeOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label
              htmlFor="admin-scholarship-agency"
              className="mb-2 block font-sarabun text-label font-medium text-text-primary"
            >
              {tAdmin("filterAgency")}
            </label>
            <select
              id="admin-scholarship-agency"
              value={agency_id}
              onChange={(event) =>
                updateParams({ agency_id: event.target.value || null })
              }
              className="min-h-[44px] w-full rounded-radius-md border border-border-input bg-surface-page px-3 font-sarabun text-body-sm text-text-primary focus:border-border-focus focus:outline-none focus:ring-2 focus:ring-primary-dark/20"
            >
              {agencyOptions.map((option) => (
                <option key={option.value || "all"} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {isLoading && (
        <p className="font-sarabun text-body-md text-text-muted">
          {t("common.loading")}
        </p>
      )}

      {isError && (
        <p className="font-sarabun text-body-md text-status-error">
          {tAdmin("loadError")}
        </p>
      )}

      {!isLoading && !isError && items.length === 0 && (
        <div className="rounded-radius-lg border border-border-default/80 bg-surface-card px-6 py-12 text-center">
          <p className="font-sarabun text-body-md text-text-muted">
            {tAdmin("empty")}
          </p>
        </div>
      )}

      {!isLoading && !isError && items.length > 0 && (
        <div className="overflow-x-auto rounded-radius-lg border border-border-default/80 bg-surface-card shadow-level-1">
          <table className="min-w-full divide-y divide-border-default/60">
            <thead className="bg-surface-container">
              <tr>
                {columnHeaders.map((heading) => (
                  <th
                    key={heading}
                    className="px-4 py-3 text-left font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted"
                  >
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/40">
              {items.map((scholarship) => (
                <tr key={scholarship.id} className="hover:bg-surface-page/60">
                  <td className="px-4 py-4 font-sarabun text-body-sm font-medium text-text-primary">
                    {scholarship.title}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {scholarship.agency_name ?? t("common.noAgency")}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {tTypes(scholarship.scholarship_type)}
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {tLevels(scholarship.target_level)}
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge
                      status={scholarship.status}
                      publishedLabel={t("common.statusPublished")}
                      draftLabel={t("common.statusDraft")}
                    />
                  </td>
                  <td className="px-4 py-4">
                    <SourceBadge
                      source={scholarship.source}
                      label={tSources(scholarship.source)}
                    />
                  </td>
                  <td className="px-4 py-4 font-sarabun text-body-sm text-text-secondary">
                    {formatDate(scholarship.close_date, locale)}
                  </td>
                  <td className="px-4 py-4">
                    {scholarship.status === "published" ? (
                      <button
                        type="button"
                        onClick={() => handleHide(scholarship)}
                        disabled={
                          hideMutation.isPending &&
                          hideMutation.variables === scholarship.id
                        }
                        className="rounded-radius-sm border border-status-error/30 px-3 py-1.5 font-sarabun text-caption font-semibold text-status-error transition-colors hover:bg-status-error-bg disabled:opacity-50"
                      >
                        {tAdmin("hide")}
                      </button>
                    ) : (
                      <span className="font-sarabun text-caption text-text-muted">
                        {t("common.noAgency")}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {!isLoading && !isError && totalPages > 1 && (
        <Pagination currentPage={currentPage} totalPages={totalPages} />
      )}
    </div>
  );
}

export default function AdminScholarshipsPage() {
  const t = useTranslations("scholarship");

  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-container-max px-4 py-12 text-center font-sarabun text-body-md text-text-muted">
          {t("common.loading")}
        </div>
      }
    >
      <AdminScholarshipsContent />
    </Suspense>
  );
}
