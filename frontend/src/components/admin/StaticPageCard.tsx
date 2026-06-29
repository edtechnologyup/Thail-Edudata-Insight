"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import ToggleSwitch from "@/components/admin/ToggleSwitch";
import type { AdminStaticPageMeta } from "@/types/content";
import { useTogglePageStatus, useDeletePage } from "@/hooks/useAdminPageContent";

const ICON_CONFIG = {
  policy: {
    Icon: PolicyIcon,
    bgClass: "bg-primary/10 text-primary",
  },
  gavel: {
    Icon: GavelIcon,
    bgClass: "bg-primary-light text-primary-dark",
  },
  api: {
    Icon: ApiIcon,
    bgClass: "bg-primary-container/10 text-primary-container",
  },
  help: {
    Icon: HelpIcon,
    bgClass: "bg-primary-container/10 text-primary-container",
  },
} as const;

function formatUpdatedAt(date: string, locale: string): string {
  return new Date(date).toLocaleDateString(locale === "th" ? "th-TH" : "en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

type StaticPageCardProps = {
  page: AdminStaticPageMeta;
};

export default function StaticPageCard({ page }: StaticPageCardProps) {
  const t = useTranslations("admin.pages");
  const locale = useLocale();
  const router = useRouter();
  const toggleStatus = useTogglePageStatus();
  const deletePage = useDeletePage();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { Icon, bgClass } = ICON_CONFIG[page.icon];
  const title = locale === "th" ? page.titleTh : page.titleEn;
  const isPublished = page.status === "published";

  const handleToggle = () => {
    toggleStatus.mutate({
      slug: page.slug,
      status: isPublished ? "draft" : "published",
    });
  };

  const handleDelete = () => {
    deletePage.mutate(page.slug);
    setConfirmDelete(false);
  };

  return (
    <>
      <article className="group relative flex flex-col justify-between rounded-2xl border border-white/80 bg-white p-7 shadow-md transition-all hover:shadow-lg">
        <div>
          {/* Icon + Toggle */}
          <div className="mb-5 flex items-start justify-between">
            <div
              className={`flex h-14 w-14 items-center justify-center rounded-2xl ${bgClass}`}
            >
              <Icon />
            </div>
            <div className="flex items-center gap-2">
              <span className={`font-sarabun text-caption font-semibold ${isPublished ? "text-emerald-600" : "text-gray-400"}`}>
                {isPublished ? t("published") : t("draft")}
              </span>
              <ToggleSwitch
                checked={isPublished}
                onChange={handleToggle}
                disabled={toggleStatus.isPending}
                label={page.slug}
              />
            </div>
          </div>

          {/* Title */}
          <h4 className="font-kanit text-xl font-bold text-text-primary transition-colors group-hover:text-primary-dark">
            {title}
          </h4>
          <p className="mt-1 font-sarabun text-body-sm text-text-muted">
            {page.route}
          </p>

          {/* Meta row */}
          <div className="mt-5 flex items-center justify-between text-text-muted">
            <div>
              <p className="font-sarabun text-body-sm">{t("lastEdit")}</p>
              <p className="font-sarabun text-body-md font-bold text-text-primary">
                {formatUpdatedAt(page.updatedAt, locale)}
              </p>
            </div>
            <div className="text-right">
              <p className="font-sarabun text-body-sm">{t("totalViews")}</p>
              <p className="font-sarabun text-body-md font-bold text-text-primary">
                &mdash;
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={() => router.push(`/${locale}/admin/pages/${page.slug}`)}
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border-2 border-primary-dark py-2.5 font-sarabun text-body-md font-semibold text-primary-dark transition-all hover:bg-primary-dark/5 hover:shadow-md"
          >
            <EditIcon />
            {t("editContent")}
          </button>
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            className="inline-flex items-center justify-center rounded-full border-2 border-red-300 px-4 py-2.5 font-sarabun text-body-md font-semibold text-red-500 transition-all hover:bg-red-50 hover:shadow-md"
            aria-label={`Delete ${page.slug}`}
          >
            <TrashIcon />
          </button>
        </div>
      </article>

      {/* Confirm delete modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="mx-4 w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl">
            <h3 className="font-kanit text-xl font-bold text-text-primary">
              {locale === "th" ? "ยืนยันการลบ" : "Confirm Delete"}
            </h3>
            <p className="mt-3 font-sarabun text-body-md text-text-muted">
              {locale === "th"
                ? `ต้องการลบหน้า "${title}" ใช่หรือไม่? ข้อมูลจะถูกลบถาวร`
                : `Are you sure you want to delete "${title}"? This action cannot be undone.`}
            </p>
            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setConfirmDelete(false)}
                className="rounded-full border-2 border-gray-200 px-6 py-2 font-sarabun text-body-md font-semibold text-text-secondary transition-colors hover:bg-gray-50"
              >
                {locale === "th" ? "ยกเลิก" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deletePage.isPending}
                className="rounded-full bg-red-500 px-6 py-2 font-sarabun text-body-md font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-50"
              >
                {locale === "th" ? "ลบ" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function PolicyIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

function GavelIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}

function ApiIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  );
}
