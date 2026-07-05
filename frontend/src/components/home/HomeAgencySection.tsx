"use client";

import Link from "next/link";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import apiClient from "@/services/api";
import type { PublicAgency } from "@/hooks/useAgencyPublic";

const PER_PAGE = 12;

function formatCount(n: number): string {
  if (n >= 1000) {
    const k = n / 1000;
    return k >= 10 ? `${Math.round(k)}k` : `${k.toFixed(1).replace(/\.0$/, "")}k`;
  }
  return n.toLocaleString();
}

export default function HomeAgencySection() {
  const locale = useLocale();
  const isTh = locale === "th";
  const [page, setPage] = useState(0);

  const { data: agencies, isLoading, isError } = useQuery<PublicAgency[]>({
    queryKey: ["agencies-public-list"],
    queryFn: async () => {
      const res = await apiClient.get<{ data: PublicAgency[] }>("/public/agencies");
      return res.data.data ?? [];
    },
    staleTime: 60_000,
  });

  if (!isLoading && (isError || !agencies || agencies.length === 0)) return null;

  const totalPages = Math.ceil((agencies?.length ?? 0) / PER_PAGE);
  const currentPage = Math.min(page, Math.max(totalPages - 1, 0));
  const visible = (agencies ?? []).slice(
    currentPage * PER_PAGE,
    currentPage * PER_PAGE + PER_PAGE
  );

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

  return (
    <section className="py-12 md:py-16" style={{ backgroundColor: "#f5f6fa" }}>
      <div className="mx-auto max-w-container-max px-4 md:px-10">
        <div className="mb-8 flex items-end justify-between gap-4 md:mb-10">
          <div>
            <h2 className="font-kanit text-heading-2 text-text-primary">
              {isTh ? "หน่วยงานผู้เผยแพร่ข้อมูล" : "Data Publishers"}
            </h2>
            <p className="mt-2 font-sarabun text-body-md text-text-secondary">
              {isTh
                ? "หน่วยงานที่ร่วมเผยแพร่ชุดข้อมูลด้านการศึกษา"
                : "Organizations publishing education datasets"}
            </p>
          </div>
          {totalPages > 1 && (
            <div className="flex shrink-0 items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(Math.max(currentPage - 1, 0))}
                disabled={currentPage === 0}
                className="flex h-10 w-10 items-center justify-center rounded-radius-full border border-border-default bg-white text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="font-sarabun text-caption text-text-muted">
                {currentPage + 1} / {totalPages}
              </span>
              <button
                type="button"
                onClick={() => setPage(Math.min(currentPage + 1, totalPages - 1))}
                disabled={currentPage >= totalPages - 1}
                className="flex h-10 w-10 items-center justify-center rounded-radius-full border border-border-default bg-white text-text-secondary transition-colors hover:border-primary hover:text-primary disabled:opacity-40"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-36 animate-pulse rounded-2xl bg-white" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {visible.map((a) => {
              const initial = a.agency_name.charAt(0);
              const name = isTh ? a.agency_name : (a.agency_name_en || a.agency_name);
              return (
                <Link
                  key={a.agency_user_id}
                  href={`/${locale}/agencies/${a.agency_user_id}`}
                  className="group flex flex-col items-center gap-3 rounded-2xl border border-border-default/60 bg-white p-5 shadow-sm transition-all hover:-translate-y-1 hover:shadow-level-2"
                >
                  {a.image_url ? (
                    <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white shadow-sm">
                      <img
                        src={`${apiBase}${a.image_url}`}
                        alt={a.agency_name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div
                      className="flex h-16 w-16 items-center justify-center rounded-full font-kanit text-xl font-bold text-white"
                      style={{ backgroundColor: "#1a237e" }}
                    >
                      {initial}
                    </div>
                  )}
                  <div className="text-center">
                    <p className="font-kanit text-body-sm font-medium text-text-primary line-clamp-2 group-hover:text-primary">
                      {name}
                    </p>
                    <p className="mt-1 font-sarabun text-caption text-text-muted">
                      {formatCount(a.dataset_count)} {isTh ? "ชุดข้อมูล" : "datasets"}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
