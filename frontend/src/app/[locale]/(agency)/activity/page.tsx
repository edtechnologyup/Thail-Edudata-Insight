"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import {
  ACTIVITY_LOG_PAGE_SIZE,
  type AgencyActivityLogItem,
  useAgencyActivityLogs,
} from "@/hooks/useAgencyActivityLogs";

function getPageNumbers(
  current: number,
  total: number
): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "ellipsis", total];
  if (current >= total - 2) return [1, "ellipsis", total - 2, total - 1, total];
  return [1, "ellipsis", current, "ellipsis", total];
}

type FilterTab = "all" | "dataset" | "scholarship" | "teacher";

const FILTER_TABS: { key: FilterTab; label: string }[] = [
  { key: "all", label: "ทั้งหมด" },
  { key: "dataset", label: "Dataset" },
  { key: "scholarship", label: "Scholarship" },
  { key: "teacher", label: "Teacher Records" },
];

function actionStyle(activityType: AgencyActivityLogItem["activityType"]) {
  switch (activityType) {
    case "upload":
      return { dot: "bg-[#43a047]", text: "text-[#43a047]" };
    case "draft":
      return { dot: "bg-[#8e24aa]", text: "text-[#8e24aa]" };
    case "update":
      return { dot: "bg-[#f57c00]", text: "text-[#f57c00]" };
    case "delete":
      return { dot: "bg-status-error", text: "text-status-error" };
    default:
      return { dot: "bg-text-muted", text: "text-text-muted" };
  }
}

function typePillStyle(itemType: AgencyActivityLogItem["itemType"]) {
  return itemType === "scholarship"
    ? "bg-[#fff3e0] text-[#f57c00]"
    : "bg-primary-light text-primary-dark";
}

function mapActivityLabel(
  activityType: AgencyActivityLogItem["activityType"],
  t: ReturnType<typeof useTranslations<"agency.activity">>
) {
  switch (activityType) {
    case "upload":
      return t("actionUpload");
    case "draft":
      return t("actionDraft");
    case "update":
      return t("actionUpdate");
    case "delete":
      return t("actionDelete");
    default:
      return t("actionOther");
  }
}

function mapItemTypeLabel(
  itemType: AgencyActivityLogItem["itemType"],
  t: ReturnType<typeof useTranslations<"agency.activity">>
) {
  return itemType === "scholarship" ? t("typeScholarship") : t("typeDataset");
}

export default function AgencyActivityPage() {
  const t = useTranslations("agency.activity");
  const locale = useLocale();
  const base = `/${locale}`;
  const [page, setPage] = useState(1);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const { data, isLoading, isError, error } = useAgencyActivityLogs(
    page,
    ACTIVITY_LOG_PAGE_SIZE
  );

  const allItems = data?.items ?? [];
  const items =
    activeTab === "all"
      ? allItems
      : allItems.filter((item) => {
          if (activeTab === "dataset") return item.itemType === "dataset";
          if (activeTab === "scholarship")
            return item.itemType === "scholarship";
          return false;
        });

  const pagination = data?.pagination;
  const totalPages = Math.max(1, pagination?.total_pages ?? 1);
  const totalItems = pagination?.total_items ?? 0;
  const currentPage = Math.min(page, totalPages);
  const from =
    totalItems === 0 ? 0 : (currentPage - 1) * ACTIVITY_LOG_PAGE_SIZE + 1;
  const to = Math.min(currentPage * ACTIVITY_LOG_PAGE_SIZE, totalItems);
  const pages = getPageNumbers(currentPage, totalPages);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex flex-wrap items-center gap-2 font-sarabun text-caption uppercase tracking-wider text-text-muted">
        <Link href={`${base}/dashboard`} className="hover:text-primary-dark">
          Main Dashboard
        </Link>
        <span>›</span>
        <span className="font-semibold text-text-primary">
          ประวัติการทำงาน
        </span>
      </nav>

      <header className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
        <div>
          <h1 className="font-kanit text-[28px] font-bold text-text-primary">
            {t("title")}
          </h1>
          <p className="mt-1 font-sarabun text-body-md text-text-muted">
            {t("subtitle")}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl border border-border-input bg-surface-card px-5 py-2.5 font-sarabun text-label font-medium text-text-primary transition-colors hover:bg-surface-container"
          >
            <FilterIcon />
            กรองข้อมูล
          </button>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-primary-dark px-5 py-2.5 font-sarabun text-label font-medium text-white shadow-level-1 transition-opacity hover:opacity-90"
          >
            <ExportIcon />
            ส่งออก CSV
          </button>
        </div>
      </header>

      {/* Filter tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {FILTER_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => {
              setActiveTab(tab.key);
              setPage(1);
            }}
            className={`rounded-full px-5 py-2 font-sarabun text-label font-medium transition-colors ${
              activeTab === tab.key
                ? "bg-primary-dark text-white shadow-level-1"
                : "border border-border-input bg-surface-card text-text-muted hover:bg-surface-container hover:text-text-primary"
            }`}
          >
            {tab.label}
          </button>
        ))}
        <span className="ml-2 inline-flex items-center gap-1.5 rounded-full border border-border-input bg-surface-card px-4 py-2 font-sarabun text-caption text-text-muted">
          <ClockSmallIcon />
          30 วันล่าสุด
        </span>
      </div>

      {isError && (
        <div className="rounded-2xl border border-status-error/30 bg-status-error/5 px-4 py-3 font-sarabun text-label text-status-error">
          {error instanceof Error ? error.message : t("loadError")}
        </div>
      )}

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-border-default/60 bg-surface-card shadow-level-1">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-border-default/30 font-sarabun text-caption font-semibold uppercase tracking-wide text-text-muted">
                <th className="px-6 py-4">{t("colDateTime")}</th>
                <th className="px-6 py-4">{t("colType")}</th>
                <th className="px-6 py-4">{t("colAction")}</th>
                <th className="px-6 py-4">{t("colTitle")}</th>
                <th className="px-6 py-4 text-center">จัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-default/20">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}>
                    <td colSpan={5} className="px-6 py-5">
                      <div className="h-5 animate-pulse rounded-lg bg-surface-container" />
                    </td>
                  </tr>
                ))
              ) : items.length === 0 ? (
                <tr>
                  <td
                    className="px-6 py-12 text-center font-sarabun text-body-md text-text-muted"
                    colSpan={5}
                  >
                    {t("empty")}
                  </td>
                </tr>
              ) : (
                items.map((item) => {
                  const dateObj = new Date(item.created_at);
                  const dateStr = dateObj.toLocaleDateString(
                    locale === "th" ? "th-TH" : "en-US",
                    { year: "numeric", month: "numeric", day: "numeric" }
                  );
                  const timeStr = dateObj.toLocaleTimeString(
                    locale === "th" ? "th-TH" : "en-US",
                    { hour: "2-digit", minute: "2-digit", second: "2-digit" }
                  );
                  const aStyle = actionStyle(item.activityType);
                  const tPill = typePillStyle(item.itemType);

                  return (
                    <tr
                      key={item.id}
                      className="transition-colors hover:bg-surface-page"
                    >
                      <td className="px-6 py-4">
                        <span className="block font-sarabun text-label font-semibold text-text-primary">
                          {dateStr}
                        </span>
                        <span className="font-sarabun text-[11px] text-text-muted">
                          {timeStr}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 font-sarabun text-caption font-semibold ${tPill}`}
                        >
                          {mapItemTypeLabel(item.itemType, t)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-2">
                          <span
                            className={`h-2.5 w-2.5 rounded-full ${aStyle.dot}`}
                          />
                          <span
                            className={`font-sarabun text-label font-semibold ${aStyle.text}`}
                          >
                            {mapActivityLabel(item.activityType, t)}
                          </span>
                        </span>
                      </td>
                      <td className="max-w-[300px] px-6 py-4">
                        <span className="block truncate font-sarabun text-label text-text-primary">
                          {item.title ?? "-"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            className="flex h-8 w-8 items-center justify-center rounded-full text-text-muted transition-colors hover:bg-surface-container hover:text-primary-dark"
                            title="ดูรายละเอียด"
                          >
                            <EyeIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col gap-4 px-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-sarabun text-label text-text-muted">
            {t("paginationSummary", { from, to, total: totalItems })}
          </p>
          <nav
            className="flex items-center justify-center gap-1 sm:justify-end"
            aria-label={t("pagination")}
          >
            <button
              type="button"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={currentPage <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
              aria-label={t("prevPage")}
            >
              <ChevronLeftIcon />
            </button>
            {pages.map((pageNum, index) =>
              pageNum === "ellipsis" ? (
                <span
                  key={`ellipsis-${index}`}
                  className="px-2 font-sarabun text-label text-text-muted"
                >
                  ...
                </span>
              ) : (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => setPage(pageNum)}
                  className={`flex h-10 w-10 items-center justify-center rounded-xl font-sarabun text-label font-bold transition-colors ${
                    pageNum === currentPage
                      ? "bg-primary-dark text-white shadow-level-1"
                      : "border border-border-input text-text-primary hover:bg-surface-container"
                  }`}
                  aria-current={pageNum === currentPage ? "page" : undefined}
                >
                  {pageNum}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage >= totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-input text-text-muted transition-colors hover:bg-surface-container disabled:opacity-40"
              aria-label={t("nextPage")}
            >
              <ChevronRightIcon />
            </button>
          </nav>
        </div>
      )}

      {/* Bottom stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <BottomStatCard
          icon={<SyncIcon />}
          iconBg="bg-primary-dark"
          label="การซิงค์ข้อมูลล่าสุด"
          value="100% สำเร็จ"
          badge="เสถียร"
          badgeColor="bg-[#e8f5e9] text-[#43a047]"
        />
        <BottomStatCard
          icon={<StorageIcon />}
          iconBg="bg-[#e3f2fd]"
          label="อัตราการเพิ่มของข้อมูล"
          value="2.4 GB / สัปดาห์"
          badge="+12%"
          badgeColor="bg-[#e8f5e9] text-[#43a047]"
        />
        <BottomStatCard
          icon={<WarningIcon />}
          iconBg="bg-[#fff3e0]"
          label="ข้อมูลที่ต้องตรวจสอบ"
          value="พร้อมใช้งานทั้งหมด"
          badge="0 รายการ"
          badgeColor="bg-[#e8f5e9] text-[#43a047]"
        />
      </div>
    </div>
  );
}

function BottomStatCard({
  icon,
  iconBg,
  label,
  value,
  badge,
  badgeColor,
}: {
  icon: React.ReactNode;
  iconBg: string;
  label: string;
  value: string;
  badge: string;
  badgeColor: string;
}) {
  return (
    <div className="flex items-center gap-4 rounded-2xl border border-border-default/60 bg-surface-card px-6 py-5 shadow-level-1">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconBg} text-white`}
      >
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-sarabun text-caption text-text-muted">{label}</p>
        <p className="font-kanit text-body-lg font-bold text-text-primary">
          {value}
        </p>
      </div>
      <span
        className={`shrink-0 rounded-full px-3 py-1 font-sarabun text-[11px] font-bold ${badgeColor}`}
      >
        {badge}
      </span>
    </div>
  );
}

function FilterIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M10 18h4v-2h-4v2ZM3 6v2h18V6H3Zm3 7h12v-2H6v2Z" />
    </svg>
  );
}
function ExportIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M19 9h-4V3H9v6H5l7 7 7-7ZM5 18v2h14v-2H5Z" />
    </svg>
  );
}
function ClockSmallIcon() {
  return (
    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M11.99 2C6.47 2 2 6.48 2 12s4.47 10 9.99 10C17.52 22 22 17.52 22 12S17.52 2 11.99 2zM12 20c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67V7z" />
    </svg>
  );
}
function EyeIcon() {
  return (
    <svg className="h-4.5 w-4.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
    </svg>
  );
}
function SyncIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 4V1L8 5l4 4V6c3.31 0 6 2.69 6 6 0 1.01-.25 1.97-.7 2.8l1.46 1.46A7.93 7.93 0 0 0 20 12c0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6 0-1.01.25-1.97.7-2.8L5.24 7.74A7.93 7.93 0 0 0 4 12c0 4.42 3.58 8 8 8v3l4-4-4-4v3z" />
    </svg>
  );
}
function StorageIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-4 7h20v-4H2v4zm2-3h2v2H4v-2z" />
    </svg>
  );
}
function WarningIcon() {
  return (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" />
    </svg>
  );
}
function ChevronLeftIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12l4.58-4.59z" />
    </svg>
  );
}
function ChevronRightIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M8.59 16.59 13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z" />
    </svg>
  );
}
