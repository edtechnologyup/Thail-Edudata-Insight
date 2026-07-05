"use client";

import { useState } from "react";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useParams } from "next/navigation";
import { useAgencyDetail, useAgencyDatasets } from "@/hooks/useAgencyPublic";
import { useCategories } from "@/hooks/useCategories";
import { mapApiDatasetToHomeCard } from "@/utils/statsMappers";
import DatasetCard from "@/components/dataset/DatasetCard";
import type { ApiDataset } from "@/types/dataset";

const AGENCY_TYPE_LABELS: Record<string, { th: string; en: string }> = {
  central: { th: "ส่วนกลาง", en: "Central" },
  regional: { th: "ส่วนภูมิภาค", en: "Regional" },
  local: { th: "ส่วนท้องถิ่น", en: "Local" },
  educational: { th: "สถาบันการศึกษา", en: "Educational" },
  other: { th: "อื่นๆ", en: "Other" },
};

const PAGE_SIZE = 9;

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return n.toLocaleString();
}

function getPageNumbers(current: number, total: number): (number | "ellipsis")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "ellipsis", total];
  if (current >= total - 2) return [1, "ellipsis", total - 2, total - 1, total];
  return [1, "ellipsis", current, "ellipsis", total];
}

export default function AgencyDetailPage() {
  const params = useParams();
  const locale = useLocale();
  const isTh = locale === "th";
  const agencyId = params.id as string;

  const [page, setPage] = useState(1);
  const { data: agency, isLoading, isError } = useAgencyDetail(agencyId);
  const { data: dsResult, isLoading: dsLoading } = useAgencyDatasets(agencyId, page, PAGE_SIZE);
  const { data: categories } = useCategories();

  if (isLoading) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-16 text-center font-sarabun text-body-md text-text-muted md:px-spacing-10">
        {isTh ? "กำลังโหลด..." : "Loading..."}
      </div>
    );
  }

  if (isError || !agency) {
    return (
      <div className="mx-auto max-w-container-max px-4 py-16 text-center font-sarabun text-body-md text-text-muted md:px-spacing-10">
        {isTh ? "ไม่พบข้อมูลหน่วยงาน" : "Agency not found"}
      </div>
    );
  }

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  const displayName = isTh ? agency.agency_name : (agency.agency_name_en || agency.agency_name);
  const subName = isTh ? agency.agency_name_en : null;
  const typeLabel = agency.agency_type ? AGENCY_TYPE_LABELS[agency.agency_type] : null;
  const initial = agency.agency_name.charAt(0);

  const datasets = (dsResult?.items ?? []) as ApiDataset[];
  const pagination = dsResult?.pagination;
  const totalPages = pagination?.total_pages ?? 1;

  const cards = datasets.map((ds) =>
    mapApiDatasetToHomeCard(ds, categories ?? [], locale)
  );

  const stats = [
    {
      label: isTh ? "ชุดข้อมูลทั้งหมด" : "Total Datasets",
      value: agency.dataset_count,
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 7v10c0 2 1 3 3 3h10c2 0 3-1 3-3V7c0-2-1-3-3-3H7c-2 0-3 1-3 3z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 2v3m6-3v3M9 14h6m-6-4h6" />
        </svg>
      ),
    },
    {
      label: isTh ? "ดาวน์โหลดรวม" : "Total Downloads",
      value: agency.total_downloads,
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      label: isTh ? "เข้าชมรวม" : "Total Views",
      value: agency.total_views,
      icon: (
        <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section
        className="border-l-[8px] px-4 py-10 md:px-spacing-10 md:py-12"
        style={{ backgroundColor: "#f5f6fa", borderColor: "#1a237e" }}
      >
        <div className="mx-auto flex max-w-container-max flex-col items-center gap-6 md:flex-row md:items-start md:gap-8">
          {/* Logo */}
          {agency.image_url ? (
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-level-1">
              <img
                src={`${apiBase}${agency.image_url}`}
                alt={agency.agency_name}
                className="h-full w-full object-cover"
              />
            </div>
          ) : (
            <div
              className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl font-kanit text-4xl font-bold text-white shadow-level-1"
              style={{ backgroundColor: "#1a237e" }}
            >
              {initial}
            </div>
          )}

          {/* Info */}
          <div className="flex-grow text-center md:text-left">
            <div className="mb-2 flex flex-col items-center gap-3 md:flex-row">
              <h1 className="font-kanit text-heading-1-mobile font-bold md:text-heading-1" style={{ color: "#1a237e" }}>
                {displayName}
              </h1>
              {typeLabel && (
                <span
                  className="rounded-radius-full px-4 py-1 font-sarabun text-caption font-medium text-white"
                  style={{ backgroundColor: "#1a237e" }}
                >
                  {isTh ? typeLabel.th : typeLabel.en}
                </span>
              )}
            </div>
            {subName && (
              <p className="mb-4 font-kanit text-body-lg text-text-muted">{subName}</p>
            )}

            {/* Contact links */}
            <div className="flex flex-wrap justify-center gap-x-8 gap-y-3 text-text-secondary md:justify-start">
              {agency.agency_website && (
                <a
                  href={agency.agency_website.startsWith("http") ? agency.agency_website : `https://${agency.agency_website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#1a237e" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 21a9 9 0 100-18 9 9 0 000 18z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.6 9h16.8M3.6 15h16.8M12 3c2.5 2.8 3.9 6.3 3.9 9s-1.4 6.2-3.9 9c-2.5-2.8-3.9-6.3-3.9-9s1.4-6.2 3.9-9z" />
                  </svg>
                  <span className="font-sarabun text-body-sm">{agency.agency_website.replace(/^https?:\/\//, "")}</span>
                </a>
              )}
              {agency.contact_email && (
                <a
                  href={`mailto:${agency.contact_email}`}
                  className="flex items-center gap-2 transition-colors hover:text-primary"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#1a237e" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-sarabun text-body-sm">{agency.contact_email}</span>
                </a>
              )}
              {agency.contact_phone && (
                <div className="flex items-center gap-2">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="#1a237e" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span className="font-sarabun text-body-sm">{agency.contact_phone}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section className="mx-auto -mt-6 max-w-container-max px-4 md:px-spacing-10">
        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-5 rounded-2xl border border-border-default/60 bg-white p-5 shadow-level-1"
            >
              <div
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full"
                style={{ backgroundColor: "rgba(0,137,123,0.1)", color: "#00897b" }}
              >
                {s.icon}
              </div>
              <div>
                <p className="font-sarabun text-caption text-text-muted">{s.label}</p>
                <p className="font-kanit text-heading-1-mobile font-bold" style={{ color: "#1a237e" }}>
                  {formatCount(s.value)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Dataset List ── */}
      <section className="mx-auto max-w-container-max px-4 pb-16 pt-12 md:px-spacing-10">
        <div className="mb-8 flex items-end justify-between">
          <h2 className="font-kanit text-heading-2 font-bold" style={{ color: "#1a237e" }}>
            {isTh ? "ชุดข้อมูลของหน่วยงาน" : "Agency Datasets"}{" "}
            <span className="font-normal text-text-muted">
              ({pagination?.total_items ?? agency.dataset_count})
            </span>
          </h2>
        </div>

        {dsLoading ? (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-surface-container" />
            ))}
          </div>
        ) : cards.length === 0 ? (
          <p className="py-12 text-center font-sarabun text-body-md text-text-muted">
            {isTh ? "ยังไม่มีชุดข้อมูลที่เผยแพร่" : "No published datasets"}
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, i) => (
              <DatasetCard key={card.id} {...card} index={i} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <nav className="mt-12 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page <= 1}
              className="flex h-10 w-10 items-center justify-center rounded-radius-full border border-border-default bg-white font-sarabun text-label text-text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              &lt;
            </button>
            {getPageNumbers(page, totalPages).map((p, idx) =>
              p === "ellipsis" ? (
                <span key={`e-${idx}`} className="flex h-10 w-10 items-center justify-center font-sarabun text-label text-text-muted">
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-10 w-10 items-center justify-center rounded-radius-full font-sarabun text-label font-bold transition-colors ${
                    p === page
                      ? "bg-gradient-to-b from-primary-hover to-primary-dark text-white shadow-level-1"
                      : "border border-border-default bg-white text-text-primary hover:border-primary hover:text-primary"
                  }`}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              onClick={() => setPage(Math.min(totalPages, page + 1))}
              disabled={page >= totalPages}
              className="flex h-10 w-10 items-center justify-center rounded-radius-full border border-border-default bg-white font-sarabun text-label text-text-muted transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
            >
              &gt;
            </button>
          </nav>
        )}
      </section>
    </>
  );
}
